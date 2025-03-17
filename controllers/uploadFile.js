const uploadService = require("../services/upload");
const log = require("../utils/logger");
const {deleteFile} = require("../utils/file")

module.exports = {
    userUploadFile: async (req, res) => {
        try {
            log.info(`Start userUploadFile. Data: ${JSON.stringify(req.file)}`);

            const file_path = req.file_path;
            const file_name = req.file_name;
            const file_size = req.file_size
            const { user_id } = req.user
            let result = await uploadService.createUploadFile({user_id:user_id,path:file_path,type:req.body.category ? req.body.category : null,name:file_name,size:file_size})

            log.info(`End userUploadFile. Data: ${JSON.stringify(result)}`);
            return res.status(200).send({
                result
            });
        }catch (err) {
            log.error(err);
            return res.status(500).json({
                message: err.message,
                errCode: 500,
            });
        }
    },
    deleteUploadFile:async(req,res)=>{
        try {
            log.info(`Start deleteUploadFile. Data: ${JSON.stringify(req.file)}`);
            const {_id} = req.body
            let result = await uploadService.getUpload({_id:_id})
            if(result){
                deleteFile(result.path)
            }
            log.info(`End deleteUploadFile. Data: ${JSON.stringify(result)}`);
            return res.status(200).send({
                delete:true
            });
        }catch (err) {
            log.error(err);
            return res.status(500).json({
                message: err.message,
                errCode: 500,
            });
        }
    }
}