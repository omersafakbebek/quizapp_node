const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt=require('bcryptjs');
const jwt = require('jsonwebtoken');
const {verifyToken,isAdmin}= require('../auth');
const {upload ,s3}= require('../s3');
const env=process.env;
router.patch('/uploadAvatar/:userId',upload.single('avatar'),(req,res)=>{
    console.log(req.file);
    res.send('Successfully uploaded '+req.file.location+' location');
});
router.get('/listAvatars',async (req,res)=>{
    let r=await s3.listObjectsV2({Bucket:env.BUCKET}).promise();
    let x=r.Contents.map(item=>item.Key);
    res.send(x);
});
router.get('/downloadAvatar/:userId',async (req,res)=>{
    const filename=req.params.userId;
    let x=await s3.getObject({Bucket:env.BUCKET,Key:filename}).promise();
    res.send(x.Body);
});
router.delete('/deleteAvatar/:userId',async (req,res)=>{
    const filename=req.params.userId;
    await s3.deleteObject({Bucket:env.BUCKET,Key:filename}).promise();
    res.send('File deleted successfully');
})

router.post('/login', async (req,res)=>{
    try{
        const username=req.body.username;
        const password = req.body.password;
        const user = await User.findOne({username:username},'password').lean();
        if(!(user&&await bcrypt.compare(password,user.password))){
            
            res.status(403).send('Bad Credentials');
            
        }else{
            console.log(user);

            const accessToken = jwt.sign({userId:user._id},env.SECRET_KEY,{expiresIn:env.ACCESS_TOKEN_EXPIRATION});
            const refreshToken= jwt.sign({userId:user._id},env.SECRET_KEY,{expiresIn:env.REFRESH_TOKEN_EXPIRATION});
            res.json({accessToken:accessToken,refreshToken:refreshToken});
        }
        
    }catch(err){
        res.json({message:err});
    }
});

router.get('/refreshToken',verifyToken, async (req,res)=>{
    try{
        const accessToken = jwt.sign({userId:req.userId},env.SECRET_KEY,{expiresIn:env.ACCESS_TOKEN_EXPIRATION});
        const refreshToken= jwt.sign({userId:req.userId},env.SECRET_KEY,{expiresIn:env.REFRESH_TOKEN_EXPIRATION});
        res.json({accessToken:accessToken,refreshToken:refreshToken});
    }catch(err){
        res.json({message:err});
    }
});

router.get('/',verifyToken,isAdmin,async (req,res)=>{
    try{
        const size = req.query.size;
        const page = req.query.page;
        const users=await User.find({},{},{skip:page*size,limit:size}).select('username email').lean();
        res.json(users);
    }catch(err){
        res.json({message:err});
    }
});
router.get('/:userId',verifyToken,async (req,res)=>{
    try{
        const user=await User.findById(req.params.userId).lean();
        res.json(user);
    }catch(err){
        res.json({message:err});
    }
});
router.post('/',async (req,res)=>{
    const encryptedPassword = await bcrypt.hash(req.body.password,10);

    try{
        const savedUser = await user.save();
        res.json(savedUser);
    }catch(err){
        res.json({message:err});
    }
});
router.patch('/admin/:userId',verifyToken,isAdmin,async (req,res)=>{
    try{
        const updatedUser = await User.updateOne({_id:req.params.userId},{$set:{role:'admin'}});
        res.json(updatedUser);
    }catch(err){
        res.json(err);
    }
})
router.delete('/:userId',verifyToken,async (req,res)=>{
    try{
        const deletedUser = await User.findByIdAndDelete(req.params.userId);
        res.json(deletedUser);
    }catch(err){
        res.json({message:err});
    }
});
router.patch('/:userId',verifyToken,async (req,res)=>{
    try{
        const updatedUser = await User.updateOne({_id:req.params.userId},{$set:{username:req.body.username,
            password:req.body.password,
            name:req.body.name,
            surname:req.body.surname,
            email:req.body.email,
            dob:req.body.dob
        }},{runValidators:true});
        res.json(updatedUser);
    }catch(err){
        res.json(err);
    }
});



module.exports=router;