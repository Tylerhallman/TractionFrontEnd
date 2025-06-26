const nodemailer = require('nodemailer');
const config = require('../configs/config');
const log = require('./logger');
const handlebars = require('handlebars');
const fs = require("fs");
const path = require('path');
/**
 * Create mail client
 * @param
 * @param
 */

log.info(`Initiate mail client`);
handlebars.registerHelper('multiply', (a, b) => (a * b).toFixed(2));
handlebars.registerHelper('firstImageUrl', function(images) {
    if (Array.isArray(images) && images.length > 0) {
        return images[0].url || '';
    }
    return '';
});
let smtpConfig = {
    host: config.MAIL_HOST,
    port: parseInt(config.MAIL_PORT)
};

if (config.MAIL_ANON === 'true') {
    smtpConfig.ignoreTLS = true;
    smtpConfig.secure = false;
    smtpConfig.auth = false;
    smtpConfig.tls = { rejectUnauthorized: false };
    smtpConfig.debug = true;
} else {
    if (config.MAIL_SECURE) smtpConfig.secure = true;
    if (config.MAIL_TLS) smtpConfig.requireTLS = true;
    if (config.MAIL_USERNAME && config.MAIL_PASSWORD) {
        smtpConfig.auth = {
            user: config.MAIL_USERNAME,
            pass: config.MAIL_PASSWORD
        }
    }
}

const mailTransport = nodemailer.createTransport(smtpConfig);
log.info(`Verify mail connection: Data: ${JSON.stringify(smtpConfig)}`);
let verifyConnection;
try {
    verifyConnection = mailTransport.verify();
    log.info('Mail connection verified');
} catch (err) {
    log.error(`Mail connection not verified. Error: ${JSON.stringify(err)}`);
}

/**
 * get email template
 *
 * @param data - email data
 * @param type - email template
 * @return email text
 */

const getTemplate = async(data, type) => {
    log.info(`Start generating mail template. Data: ${JSON.stringify(data)} Type: ${JSON.stringify(type)}`);
    const filePath = path.join(process.cwd(), 'views', 'email-template', `${type}.hbs`);
    const file = fs.readFileSync(filePath, 'utf8');
    let source = file.toString();
    let template = handlebars.compile(source);
    let result = await template({...data, frontUrl: config.FRONT_URL, imgUrl: config.IMG_URL });
    log.info(`Finish generating mail template. Data: ${JSON.stringify(result)}`);
    return result;
}
class EmailUtil {
    /**
     * send email function
     *
     * @param mailInfo - email data
     */
    async sendMail(mailInfo, type) {
        if  (verifyConnection) {
            log.info(`Start mail sending. Data: ${JSON.stringify(mailInfo)}`);
            let template = await getTemplate(mailInfo.data, type);
            let messageData = {
                from: mailInfo.from,
                to: mailInfo.to,
                subject: mailInfo.subject,
                html: template,
                attachments:mailInfo.attachments,
            };
            try {
                let result = await mailTransport.sendMail(messageData);
                log.info(`Mail send successfull. Data: ${JSON.stringify(result)}`);
                return result;
            } catch (err) {
                log.error(`Mail send failed. Error: ${JSON.stringify(err)}`);
            }
        }
    }
}



module.exports = new EmailUtil();
