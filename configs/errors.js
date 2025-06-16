module.exports = {
    BAD_REQUEST_USER_ALREADY_EXISTS:{
        message:"This user already exists",
        code:400
    },
    USER_NOT_FOUND:{
        message:'There is no such user',
        code:400
    },
    USER_PASSWORD_WRONG:{
        message:'Password is incorrect',
        code:400
    },

    NO_FIND_DATA:{
        message:'There is no such data',
        code:400
    },
    NOT_ALL_DATA:{
        message:'Not all fields are filled in',
        code:400
    },
    NO_FIND_STORE:{
        message:'There is no such store or it is not active',
        code:400
    },
    NO_FIND_PRODUCT:{
        message:'There is no such product or it is not active',
        code:400
    },

    BAD_REQUEST_EMAIL_NOT_VALID:{
        message:'Error! Please enter an email address in the format: email@mail.com',
        code: 400
    },
    BAD_REQUEST_USER_EXIST_WITH_EMAIL:{
        message:'User with this email address already exists',
        code:400
    },
    BAD_REQUEST_PHONE_NOT_VALID:{
        message:'Error! Please enter an phone in the format: + 329 818 4032',
        code: 400
    },
    BAD_REQUEST_USER_EXIST_WITH_PHONE:{
        message:'user with this phone already exists',
        code:400
    },
    LOGIN_NO_SELECT_DATA:{
        message:"You didn't enter your email or password",
        error:400
    },
    BAD_REQUEST_USER_NOT_FOUND:{
        message:"No such user found",
        error:400
    },
    BAD_REQUEST_NOT_ALL_FIELD_TO_CHANGE_PASSWORD:{
        message:'To change your password you must fill in all fields',
        code: 400
    },
    BAD_REQUEST_NOT_VALID_PASSWORD:{
        message:'The new password must contain at least 1 lowercase and 1 uppercase letter and be at least 8 characters long',
        code:400
    },
    BAD_REQUEST_CONFIRM_PASSWORD_NOT_VALID:{
        message:'Confirm password does not match the new password',
        code:400
    },
    FORGOT_TOKEN_NOT_VALID:{
        message:'Token is not valid or invalid',
        code:400
    },
    EXIST_CUSTOMER_WITH_PHONE:{
        message:'You already have a customer with this phone number',
        code:400
    },
    EXIST_CUSTOMER_WITH_EMAIL:{
        message:'You already have a customer with this mail address',
        code:400
    },
    EXIST_STORE_WITH_PHONE:{
        message:'This phone number is already in use',
        code:400
    },
    EXIST_STORE_WITH_EMAIL:{
        message:'This mail address is already in use',
        code:400
    },
    BAD_REQUEST_PASSWORD_NOT_MUCH_CONFIRM_PASSWORD:{
        message:"The confirmation password must match the new password",
        code:400
    },
}
