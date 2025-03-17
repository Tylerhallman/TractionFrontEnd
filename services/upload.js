const mongoose = require('mongoose');

const Upload = mongoose.model('Upload');


module.exports = {

    createUploadFile: async (data)=>{
        return await Upload.create(data)
    },
    getUpload:async(condition)=>{
        return await Upload.findOne(condition)
    }
}
