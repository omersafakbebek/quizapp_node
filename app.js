const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');


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

require('dotenv/config');
const url = process.env.DB_CONNECTION;

app.post('/login', (req,res)=>{
    console.log(req.body);
});

app.get('/',(req,res)=>{
    res.send('We are on home');
});
mongoose.connect(url, {useNewUrlParser: true}, ()=>
    console.log('connected to db',url)
);

app.use((req,res)=>{
    res.status(404).send('Page not found');
});

app.listen(8090);