const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const bcrypt = require('bcryptjs');

require('dotenv/config');

const admin = process.env.ADMIN;
if(admin==1){
        var d = new Date();
        bcrypt.hash('admin',10).then((encryptedPassword)=>{
            var user=new User({
                username:'admin',
                password:encryptedPassword,
                name:'admin',
                surname:'admin',
                email:`admin@gmail.com`,
                dob:d,
                role:'admin'
            });
            user.save();
        });    
}

User.countDocuments({},async (err,count) =>{
    console.log('Number of users in the database: ',count);
    if(count<=1){
        var d = new Date();
        for(var i=1; i<11;i++){
            d.setDate(d.getDate()-365*i);
            var encryptedPassword = await bcrypt.hash(`password${i}`,10);
            var user=new User({
                username:`user${i}`,
                password:encryptedPassword,
                name:`name${i}`,
                surname:`surname${i}`,
                email:`email${i}@gmail.com`,
                dob:d,
                role:'user'
            });
            await user.save();
        }
    }
});
Quiz.countDocuments({},async (err,count)=>{
    console.log('Number of quizzes in the database: ',count);
    if(count<1){
        var answerIndex = 1;
        for(var i=1; i<11;i++){
            var quiz=new Quiz({
                question:`question${i}`,
                answers:[
                    {
                        answer:`answer${answerIndex}`
                    },
                    {
                        answer:`answer${answerIndex+1}`
                    },
                    {
                        answer:`answer${answerIndex+2}`
                    },
                    {
                        answer:`answer${answerIndex+3}`
                    }
                ]
            });
            await quiz.save();
            answerIndex=answerIndex+4;
        }
    }
}
)




// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');

// app.use('/api-docs', swaggerUi.serve);

app.use(cors());
app.use(bodyParser.json());


app.use((req,res,next)=>{
    console.log('This is a',req.method,'request');
    next();
});
app.use(morgan('dev'));

const usersRoute = require('./routes/users');
app.use('/user',usersRoute);

const quizzesRoute=require('./routes/quizzes');
app.use('/quiz',quizzesRoute);

const mongoose =require('mongoose');

const url = process.env.DB_CONNECTION;



app.get('/',(req,res)=>{
    res.send('We are on home');
});
mongoose.connect(url, {useNewUrlParser: true}, (err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log('connected to db',url)
    }

    
});

app.use((req,res)=>{
    res.status(404).send('Page not found');
});

app.listen(process.env.PORT);