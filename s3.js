const aws = require('aws-sdk');
const multer = require('multer');
const multerS3=require('multer-s3');


const env=process.env;

aws.config.update({
    secretAccessKey:env.SECRET_ACCESS_KEY,
    accessKeyId:env.ACCESS_KEY,
    region:env.REGION
});
const s3=new aws.S3();
const upload=multer({
    storage:multerS3({
        bucket:env.BUCKET,
        s3:s3,
        acl:'public-read',
        key:(req,file,cb)=>{
            cb(null,req.params.userId);
        }
    })
});
module.exports={upload,s3};