const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');


const AnswerSchema=mongoose.Schema({answer:{
    type:String,
    required:true
}});
const QuizSchema = mongoose.Schema({
    question:{
        type:String,
        required:true,
        unique:true
    },
    answers:[AnswerSchema]
});
module.exports=mongoose.model('Quizzes',QuizSchema);
QuizSchema.plugin(uniqueValidator,{ message: 'Error, expected {PATH} to be unique.' });

