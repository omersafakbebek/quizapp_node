const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv/config');


const verifyToken = (req,res,next) =>{
    const token = req.header('authorization');
    if(!token) return res.status(401).send('Provide an access token');
    try{
        req.userId=jwt.verify(token,process.env.SECRET_KEY).userId;
        next();
    }catch(err){
        res.status(401).send(err);
    }
}
const isAdmin = async (req,res,next) => {
    const user = await User.findById(req.userId);
    if(user.role!='admin') return res.status(403).send('Access denied');
    next();
}
module.exports={verifyToken,isAdmin};