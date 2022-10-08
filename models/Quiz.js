const mongoose = require('mongoose');


const AnswerSchema=mongoose.Schema({answer:{
    type:String,
    required:true
}});
const QuizSchema = mongoose.Schema({
    question:{
        type:String,
        required:true
    },
    answers:[AnswerSchema]
});
module.exports=mongoose.model('Quizzes',QuizSchema);