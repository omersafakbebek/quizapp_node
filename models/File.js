const mongoose=require('mongoose');

const FileSchema=mongoose.Schema({
    key:String,
    location:String
})
module.exports=mongoose.model('Files',FileSchema);