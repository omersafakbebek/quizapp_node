const mongoose = require('mongoose');
const validator = require('validator');
var uniqueValidator = require('mongoose-unique-validator');


// var validateEmail = function(email) {
//     var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//     return re.test(email)
// };

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: 'username cannot be empty',
        unique: true
    },
    // roles: {

    // },
    password: {
        type: String,
        required: 'Provide a password'
    },
    name:{
        type: String
    },
    surname:{
        type:String
    },
    email:{
        type: String,
        required: 'Email is required',
        unique: true    ,
        // validate: [validateEmail, 'Provide a valid email address'],
        validate:[validator.isEmail,'Provide a valid email adress']
    },
    dob:{
        type: Date
    }
});
UserSchema.plugin(uniqueValidator,{ message: 'Error, expected {PATH} to be unique.' });


module.exports=mongoose.model('Users',UserSchema);