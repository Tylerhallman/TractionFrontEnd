const {resolve} = require("path");
const {access, constants, unlink} = require("fs");
module.exports={
    deleteFile:async(filePath)=>{
        const absolutePath = resolve(process.cwd(), filePath);

        access(absolutePath, constants.F_OK, (err) => {
            if (err) {
                console.error(`File ${absolutePath} not found or unavailable`);
                return;
            }

            unlink(absolutePath, (err) => {
                if (err) {
                    console.error(`Error when deleting the file: ${err.message}`);
                } else {
                    console.log(`File ${absolutePath} deleted successfully`);
                }
            });
        });
    }
}