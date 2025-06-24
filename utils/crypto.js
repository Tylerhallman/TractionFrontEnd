const crypto = require('crypto');
const config = require("../configs/config");

const algorithm = 'aes-256-cbc';
const secret = config.CRYPTO_SECRET;
const key = crypto.scryptSync(secret, 'salt', 32);

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
}

function decrypt({ iv, content }) {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(content, 'hex')),
        decipher.final()
    ]);
    return decrypted.toString('utf8');
}

module.exports = {
    encrypt,
    decrypt
};
