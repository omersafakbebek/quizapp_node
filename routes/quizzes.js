const express = require('express');
const router=express.Router();
const Quiz = require('../models/Quiz');

router.get('/',async (req,res) =>{
    try{
        const quizzes = await Quiz.find();
        res.json(quizzes);
    }catch(err){
        res.json({message:err});
    }
});
router.get('/:quizId',async (req,res) =>{
    try{
        const quiz = await Quiz.findById(req.params.quizId);
        res.json(quiz);
    }catch(err){
        res.json({message:err});
    }
});
router.post('/',async (req,res)=>{
    try{
        const quiz = new Quiz({
            question:req.body.question,
            answers:req.body.answers
        });
        const savedQuiz = await quiz.save();
        res.json(savedQuiz);
    }catch(err){
        res.json({message:err});
    }
});
router.patch('/:quizId',async (req,res) => {
    try{
        const updatedQuiz = await Quiz.updateOne({_id:req.params.quizId},{$set:{
            question:req.body.question,
            answers:req.body.answers}});
        res.json(updatedQuiz);
    }catch(err){
        res.json({message:err});
    }
});
router.delete('/:quizId',async (req,res) => {
    try{
        const deletedQuiz = await Quiz.findByIdAndDelete(req.params.quizId);
        res.json(deletedQuiz);
    }catch(err){
        res.json({message:error});
    }
});
router.patch('/:quizId/:answerId',async (req,res) => {
    try {
        const updatedQuiz = await Quiz.updateOne({_id:req.params.quizId,"answers._id":req.params.answerId},
        {
            $set:{
                "answers.$":req.body
            }
        });
        res.json(updatedQuiz);
    } catch (error) {
        res.json({message:error});
    }
});
router.delete('/:quizId/:answerId',async (req,res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        await quiz.answers.pull({_id:req.params.answerId});
        res.json(quiz.save());
        
    } catch (error) {
        res.json({message:error});
    }
}); 

module.exports=router;