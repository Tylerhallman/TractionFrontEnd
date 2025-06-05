const contentful = require('contentful-management');
const mongoose = require('mongoose');
const Content = mongoose.model('Content');
const config = require('../configs/config')

const client = contentful.createClient({
    accessToken: config.CONTENTFUL_MANAGEMENT_TOKEN,
});

async function getEnvironment() {
    const space = await client.getSpace(config.CONTENTFUL_SPACE_ID);
    return await space.getEnvironment(config.CONTENTFUL_ENVIRONMENT || 'master');
}

module.exports = {
    upsertContent: async (user_id, type, fields) => {
        const environment = await getEnvironment();

        const existingContent = await Content.findOne({ user_id });

        let entryId = null;
        if (existingContent) {
            if (type === 'tractionWebsiteMain') entryId = existingContent.homepageEntryId;
            if (type === 'tractionWebsiteTypes') entryId = existingContent.typesEntryId;
            if (type === 'tractionWebsiteNews') entryId = existingContent.newsEntryId;
        }

        let entry;

        if (entryId) {
            entry = await environment.getEntry(entryId);

            for (const [key, value] of Object.entries(fields)) {
                entry.fields[key] = typeof value === 'object' && value['en-US'] ? value : { 'en-US': value };
            }

            entry = await entry.update();
        } else {
            entry =await environment.createEntry(type, {
                fields: ensureLocalizedFields(fields)
            });
        }

        await entry.publish();

        const updateData = {};
        if (type === 'tractionWebsiteMain') updateData.homepageEntryId = entry.sys.id;
        if (type === 'tractionWebsiteTypes') updateData.typesEntryId = entry.sys.id;
        if (type === 'tractionWebsiteNews') updateData.newsEntryId = entry.sys.id;

        return await Content.findOneAndUpdate(
            {user_id},
            {$set: updateData},
            {new: true, upsert: true}
        );
    },

    getContent: async (filter) => {
        return await Content.findOne(filter);
    }
};
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