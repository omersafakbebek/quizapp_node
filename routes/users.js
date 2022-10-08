const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/',async (req,res)=>{
    try{
        const users=await User.find();
        res.json(users);
    }catch(err){
        res.json({message:err});
    }
});
router.get('/:userId',async (req,res)=>{
    try{
        const user=await User.findById(req.params.userId);
        res.json(user);
    }catch(err){
        res.json({message:err});
    }
});
router.post('/',async (req,res)=>{
    const user=new User({
        username:req.body.username,
        password:req.body.password,
        name:req.body.name,
        surname:req.body.surname,
        email:req.body.email,
        dob:req.body.dob
    });
    try{
        const savedUser = await user.save();
        res.json(savedUser);
    }catch(err){
        res.json({message:err});
    }
});
router.delete('/:userId',async (req,res)=>{
    try{
        const deletedUser = await User.findByIdAndDelete(req.params.userId);
        res.json(deletedUser);
    }catch(err){
        res.json({message:err});
    }
});
//Patch requestte email validationu yapma işini çözemedim
router.patch('/:userId',async (req,res)=>{
    try{
        const updatedUser = await User.updateOne({_id:req.params.userId},{$set:{username:req.body.username,
            password:req.body.password,
            name:req.body.name,
            surname:req.body.surname,
            email:req.body.email,
            dob:req.body.dob
        }});
        res.json(updatedUser);
    }catch(err){
        res.json(err);
    }
});

module.exports=router;