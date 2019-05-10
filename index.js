const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const passport = require('passport');
const passportJwt = require('passport-jwt');

let ExtractJwt = passportJwt.ExtractJwt;
let JwtStrategy = passportJwt.Strategy;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = '123456';

// lets create our strategy for web token
let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    console.log("payLoad....", jwt_payload);
    let user = getUser({ id: jwt_payload.id });

    if (user) {
        next(null, user);
    }
    else {
        next(null, false);
    }
});

//user the strategy
passport.use(strategy);

const app = express();

// initialize passport with express
app.use(passport.initialize());

// parse application/json
app.use(bodyParser.json());

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const Sequelize = require('sequelize');

const sequelize = new Sequelize({
    database: 'testNode',
    username: 'root',
    password: '',
    dialect: 'mysql',
});

// check Connect Database

sequelize.authenticate()
.then(() => console.log('Database has connect....'))
.catch(err => console.error('Unable to connect to the database', error));

// create user model
const User = sequelize.define('user',{
    name : {
        type : Sequelize.STRING,
    },
    password : {
        type : Sequelize.STRING,
    },
});

// create table with user model
User.sync()
.then(() => console.log('User table created successfully'))
.catch((err) => console.error('You enter wrong database'));


const createUser = async ({name,password}) => {
    return await User.create({name,password});
};

const getAllUser = async () => {
    return await User.findAll();
};

const getUser = async obj => {
  return await User.findOne({
    where: obj,
  });
};

// set some basic routes
app.get('/user', function(req,res){
    getAllUser().then(user => res.json(user));
});

app.post('/register',function(req,res,next){
    const {name,password} = req.body;
    createUser({name,password}).then(user => res.json({user,message : 'Account created successfully'}));
});

app.post('/login',async function(req,res,next){
    if ( name && password ) {
        let user = await getUser({name : name});

    }
    else if (!user){
        res.status(401).json({message :'No found user'});
    }
    else if (user.password === password) {
        let payLoad = { id : user.id};
        let token = jwt.sign(payLoad,jwtOptions.secretOrKey);
        res.json ({message : 'ok',token : token});
    }
    else {
        res.status(401).json({ message: 'Password is incorrect' });
    }
});

app.listen (3000, function(){
    console.log ('Express is running on port 3000');
})



