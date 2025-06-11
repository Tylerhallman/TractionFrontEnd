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
        'typeMotorcyclesAndCategoriesImage',
        'typeAtvutvAndCategoriesImages',
        'typeSnowAndCategoriesImages',
        'typeElectricAndCategoriesImages',
        'typesPageBannerImage',
    ];

    for (const field of assetFields) {
        const value = fields[field]?.['en-US'];

        if (Array.isArray(value)) {
            const assetLinks = [];

            for (const url of value) {
                const filename = url.split('/').pop();
                const contentType = url.endsWith('.png') ? 'image/png' :
                    url.endsWith('.jpg') || url.endsWith('.jpeg') ? 'image/jpeg' :
                        url.endsWith('.webp') ? 'image/webp' :
                            url.endsWith('.mp3') ? 'audio/mpeg' :
                                'application/octet-stream';

                const asset = await environment.createAssetFromFiles({
                    fields: {
                        title: { 'en-US': filename },
                        file: {
                            'en-US': {
                                contentType,
                                fileName: filename,
                                upload: url,
                            }
                        }
                    }
                });

                await asset.processForAllLocales();
                await asset.publish();

                assetLinks.push({
                    sys: {
                        type: 'Link',
                        linkType: 'Asset',
                        id: asset.sys.id
                    }
                });
            }

            transformedFields[field] = { 'en-US': assetLinks };
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

            const finalFields = await uploadAndTransformAssets(environment, fields);

            let entry;
            if (entryId) {
                entry = await environment.getEntry(entryId);

                for (const [key, value] of Object.entries(finalFields)) {
                    entry.fields[key] = typeof value === 'object' && value['en-US']
                        ? value
                        : { 'en-US': value };
                }

                entry = await entry.update();
            } else {
                entry = await environment.createEntry(type, {
                    fields: ensureLocalizedFields(finalFields)
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

    getContent: async (filter) => {
        return await Content.findOne(filter);
    }
};
