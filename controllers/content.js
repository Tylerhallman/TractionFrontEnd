const log = require("../utils/logger");
const contentService = require('../services/content');
const errors = require("../configs/errors");

module.exports = {
    async updateContent(req, res) {
        try {
            log.info(`Start updateContent. Data: ${JSON.stringify(req.body)}`);
            const { user_id } = req.user;
            const { type, fields } = req.body;

            if (!type || !fields) {
                log.error(`${JSON.stringify(errors.NOT_ALL_DATA)}`);
                return res.status(400).json({
                    message: errors.NOT_ALL_DATA.message,
                    errCode: errors.NOT_ALL_DATA.code,
                });
            }

            const result = await contentService.upsertContent(user_id, type, fields);

            log.info(`End updateContent. Data: ${JSON.stringify(result)}`);
            return res.status(201).json(result);
        } catch (err) {
            log.error(err);
            return res.status(400).json({
                message: err.message,
                errCode: 400
            });
        }
    },
    async getContent(req, res) {
        try {
            const { user_id } = req.user;

            const content = await contentService.getContent({ user_id });

            if (!content) {
                return res.status(404).json({ message: "No content found for user" });
            }

            return res.status(200).json({
                homepageEntryId: content.homepageEntryId,
                typesEntryId: content.typesEntryId,
                newsEntryId: content.newsEntryId,
            });
        } catch (err) {
            log.error(err);
            return res.status(400).json({
                message: err.message,
                errCode: 400,
            });
        }
    }
};