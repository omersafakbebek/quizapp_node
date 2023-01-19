const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt=require('bcryptjs');
const jwt = require('jsonwebtoken');
const {verifyToken,isAdmin}= require('../auth');
const {upload ,s3,invokeLambda}= require('../aws');
const File=require('../models/File');
const redis= require('redis');
const { json } = require('body-parser');
const env=process.env;
const client=redis.createClient({url:env.REDIS_URL});


function cache(req,res,next){
    client.get("allfiles",(err,data)=>{
        if(data!=null){
            res.json(JSON.parse(data));
        }else{
            console.log("Data does not exist in cache");
            next();
        }
    });

    
}
function cacheUsers(req,res,next){
    client.hgetall("allusers",(err,data)=>{
        if(data!=null){
            const j=[];
            // data.keys.forEach((id)=>{
            //     j.push(JSON.parse(data.get(id)));
            // })
            Object.keys(data).forEach((userid)=>{
                j.push(JSON.parse(data[userid]));
            })
            res.json(j);
        }else{
            console.log("Data does not exist in cache");
            next();
        }
    })
}


router.post('/uploadAvatar/:userId',upload.single('avatar'),async (req,res)=>{
    console.log(req.file);
    const file= new File({
        key:req.file.key,
        location:req.file.location
    });
    const savedFile=await file.save();
    res.send('Successfully uploaded '+savedFile);
});
router.get('/listAvatars',cache,async (req,res)=>{
    const files=await File.find().lean();
    
    client.setex("allfiles",30,JSON.stringify(files));
    res.json(files);
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

router.get('/',verifyToken,isAdmin,cacheUsers,async (req,res)=>{
    try{
        const size = req.query.size;
        const page = req.query.page;
        const users=await User.find({},{},{skip:page*size,limit:size}).select('username email').lean();
        users.forEach((user)=>{            
            client.hmset("allusers",user._id.toString(),JSON.stringify(user));
        })
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
    const usernameQrLocation=await invokeLambda(req.body.username);
    const user = new User({
        username:req.body.username,
        usernameQrLocation:usernameQrLocation,
        password:encryptedPassword,
        name:req.body.name,
        surname:req.body.surname,
        email:req.body.email,
        dob:req.body.dob,
        role:'user'
    });
    try{
        const savedUser = await user.save();
        client.del("allusers");
        res.json(savedUser);
    }catch(err){
        res.json({message:err});
    }
});
router.patch('/admin/:userId',verifyToken,isAdmin,async (req,res)=>{
    try{
        const updatedUser = await User.updateOne({_id:req.params.userId},{$set:{role:'admin'}});
        client.hdel("allusers",req.params.userId);
        res.json(updatedUser);
    }catch(err){
        res.json(err);
    }
})
router.delete('/:userId',verifyToken,async (req,res)=>{
    try{
        const deletedUser = await User.findByIdAndDelete(req.params.userId);
        client.del("allusers");
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
        client.hdel("allusers",req.params.userId);
        res.json(updatedUser);
    }catch(err){
        res.json(err);
    }
});



module.exports=router;