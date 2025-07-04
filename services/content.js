const contentful = require('contentful-management');
const mongoose = require('mongoose');
const Content = mongoose.model('Content');
const config = require('../configs/config');

const client = contentful.createClient({
    accessToken: config.CONTENTFUL_MANAGEMENT_TOKEN,
});

async function getEnvironment() {
    const space = await client.getSpace(config.CONTENTFUL_SPACE_ID);
    return await space.getEnvironment(config.CONTENTFUL_ENVIRONMENT || 'master');
}

function ensureLocalizedFields(fields) {
    return Object.fromEntries(
        Object.entries(fields).map(([key, value]) => {
            if (typeof value === 'object' && value !== null && value['en-US']) {
                return [key, value];
            }
            return [key, { 'en-US': value }];
        })
    );
}

const uploadAndTransformAssets = async (environment, fields) => {
    const transformedFields = { ...fields };

    const assetFields = [
        'mainWebsiteImage',
        'firstCarouselMainImage',
        'firstBannerImage',
        'secondBannerImage',
        'secondCarouselMainImage',
        'thirdBannerImage',
        'fourthBannerMainImage',
        'mainWebsiteAllNewsImage',
        'mainNewsImage',
        'typeMotorcyclesAndCategoriesImage',
        'typeAtvutvAndCategoriesImages',
        'typeSnowAndCategoriesImages',
        'typeElectricAndCategoriesImages',
        'typesPageBannerImage',
        'homepageTypeImages'
    ];

    async function assetExists(filename) {
        const assets = await environment.getAssets({
            'fields.file.fileName': filename,
            limit: 1,
        });
        return assets.items.length > 0 ? assets.items[0] : null;
    }

    for (const field of assetFields) {
        const value = fields[field];

        if (!value) continue;

        const urls = Array.isArray(value) ? value : [value];
        const assetLinks = [];

        for (const url of urls) {
            const filename = url.split('/').pop();
            const contentType = url.endsWith('.png') ? 'image/png' :
                url.endsWith('.jpg') || url.endsWith('.jpeg') ? 'image/jpeg' :
                    url.endsWith('.webp') ? 'image/webp' :
                        url.endsWith('.mp3') ? 'audio/mpeg' :
                            'application/octet-stream';

            try {
                let asset = await assetExists(filename);

                if (!asset) {
                    asset = await environment.createAsset({
                        fields: {
                            title: { 'en-US': filename },
                            file: {
                                'en-US': {
                                    contentType,
                                    fileName: filename,
                                    upload: url,
                                },
                            },
                        },
                    });

                    await asset.processForAllLocales();
                    await asset.publish();
                }

                assetLinks.push({
                    sys: {
                        type: 'Link',
                        linkType: 'Asset',
                        id: asset.sys.id,
                    },
                });
            } catch (error) {
                console.error(`❌ Failed to create or find asset from URL (${url}):`, error.message);
            }
        }

        if (assetLinks.length) {
            transformedFields[field] = {
                'en-US': Array.isArray(value) ? assetLinks : assetLinks[0],
            };
        }
    }

    return transformedFields;
};

module.exports = {
    upsertContent: async (user_id, type, fields) => {
        try {
            const environment = await getEnvironment();
            const existingContent = await Content.findOne({ user_id });

            let entryId = null;
            if (existingContent) {
                if (type === 'tractionWebsiteMain') entryId = existingContent.homepageEntryId;
                if (type === 'tractionWebsiteTypes') entryId = existingContent.typesEntryId;
                if (type === 'tractionWebsiteNews') entryId = existingContent.newsEntryId;
            }

            // const finalFields = await uploadAndTransformAssets(environment, fields);

            let entry;
            if (entryId) {
                entry = await environment.getEntry(entryId);

                for (const [key, value] of Object.entries(fields)) {
                    entry.fields[key] = typeof value === 'object' && value['en-US']
                        ? value
                        : { 'en-US': value };
                }

                entry = await entry.update();
            } else {
                entry = await environment.createEntry(type, {
                    fields: ensureLocalizedFields(fields)
                });
            }

            await entry.publish();

            const updateData = {};
            if (type === 'tractionWebsiteMain') updateData.homepageEntryId = entry.sys.id;
            if (type === 'tractionWebsiteTypes') updateData.typesEntryId = entry.sys.id;
            if (type === 'tractionWebsiteNews') updateData.newsEntryId = entry.sys.id;

            return await Content.findOneAndUpdate(
                { user_id },
                { $set: updateData },
                { new: true, upsert: true }
            );
        } catch (err) {
            console.error('Error in upsertContent:', err);
            throw err;
        }
    },
    getAsset: async (url) => {
        const environment = await getEnvironment();

        async function assetExists(filename) {
            const assets = await environment.getAssets({
                'fields.file.fileName': filename,
                limit: 1,
            });
            return assets.items.length > 0 ? assets.items[0] : null;
        }

        const filename = url.split('/').pop();
        const contentType = url.endsWith('.png') ? 'image/png' :
            url.endsWith('.jpg') || url.endsWith('.jpeg') ? 'image/jpeg' :
                url.endsWith('.webp') ? 'image/webp' :
                    url.endsWith('.mp3') ? 'audio/mpeg' :
                        'application/octet-stream';

        try {
            let asset = await assetExists(filename);

            if (!asset) {
                asset = await environment.createAsset({
                    fields: {
                        title: { 'en-US': filename },
                        file: {
                            'en-US': {
                                contentType,
                                fileName: filename,
                                upload: url,
                            },
                        },
                    },
                });

                await asset.processForLocale('en-US');

                let processed = false;
                while (!processed) {
                    asset = await environment.getAsset(asset.sys.id);
                    processed = asset.fields.file?.['en-US']?.url !== undefined;
                    if (!processed) await new Promise(r => setTimeout(r, 1000));
                }

                await asset.publish();
            } else {
                if (!asset.sys.publishedVersion) {
                    await asset.processForLocale('en-US');
                    await asset.publish();
                }
            }

            asset = await environment.getAsset(asset.sys.id);

            return {
                sys: {
                    type: 'Link',
                    linkType: 'Asset',
                    id: asset.sys.id,
                },
            };
        } catch (error) {
            console.error(`❌ Failed to create or find asset from URL (${url}):`, error.message);
        }
    },
    getContent: async (filter) => {
        return await Content.findOne(filter);
    }
};
