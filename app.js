const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());


const usersRoute = require('./routes/users');
app.use('/user',usersRoute);

const mongoose =require('mongoose');

require('dotenv/config');
const url = process.env.DB_CONNECTION;

app.get('/',(req,res)=>{
    res.send('We are on home');
});
mongoose.connect(url, {useNewUrlParser: true}, ()=>
    console.log('connected to db',url)
);


app.listen(8090);