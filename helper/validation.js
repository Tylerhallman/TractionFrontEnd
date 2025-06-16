const config = require('../configs/config');


module.exports = {

    emailValidation: async (email) => {
        email = email.trim();
        return config.REGEX_EMAIL.test(email);
    },
    phoneValidation: async (phone) => {
        return config.REGEX_PHONE.test(phone)
    },
    passwordValidation:async (password) =>{
        return config.REGEX_PASSWORD.test(password)
    }
}
