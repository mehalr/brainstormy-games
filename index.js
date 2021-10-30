const express = require('express');
const app = express();
const path = require('path');
const User = require('./models/user');
const Quiz = require('./models/quiz');
const Result = require('./models/leaderboard.js');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: 'notagoodsecret' }))

app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'views/dashboard/assets')));

app.set('views',[path.join(__dirname, 'views'),
                path.join(__dirname, 'views/dashboard/pages')]);


app.set('view engine', 'ejs');

//mongo connection

mongoose.connect('mongodb://localhost:27017/loginDemo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

//login required
const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next();
}

//--------------------------------------------------------------
// Index page
app.get('/',(req,res)=>{
    res.render('index2.ejs');
});

//------------------------------------------------

//register and login
//-----------------------------------------------------
app.post('/register', async (req, res) => {
    const { name, email, password ,role } = req.body;
    const hash = await bcrypt.hash(password,12);
    console.log(hash);
    const user = new User({
    	name,
    	email,
    	password: hash,
    	role});

    await user.save();
    // req.session.user_id = user._id;
    res.redirect('/login')
})

app.get('/login',(req,res)=>{
	res.render('login.ejs')
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const validPassword = await bcrypt.compare(password ,user.password);
    if (validPassword) {
        req.session.user_id = user._id;
        if (user.role == 'student'){
            req.session.valid = user.name;
            res.redirect('student/dashboard')
        }else{
            res.redirect('/teacher/dashboard');
        }

    }
    else {
        res.redirect('/login')
    }
})

app.get('/logout', (req, res) => {
    req.session.user_id = null;
    // req.session.destroy();
    res.redirect('/');
})

//-------------------------------------------------------
// create quiz for games
//dinosaur adventures

app.get('/create/dino',(req,res)=>{
    res.render('createDino.ejs');
})

app.post('/create/dino',async(req,res)=>{
    const {topic,question,answer} = req.body;
    var gcode = Math.floor(100000 + Math.random() * 900000).toString();
    const teacher = await User.findById(req.session.user_id);
    const quiz = new Quiz({
        topic ,
        game : 'dinosaur adventures',
        code: gcode,
        teacher: teacher.name,
        question,
        answer
    });

    await quiz.save();
    res.render('gamecode.ejs',{gcode});
})
//-----------------
// create quiz coinscrapper

app.get('/create/coinscrapper',(req,res)=>{
    res.render('createCoin.ejs');
})

app.post('/create/coinscrapper',async(req,res)=>{
    const {topic,question,answer} = req.body;
    var gcode = Math.floor(100000 + Math.random() * 900000).toString();
    const teacher = await User.findById(req.session.user_id);
    const quiz = new Quiz({
        topic ,
        game : 'coinscrapper',
        code: gcode,
        teacher: teacher.name,
        question,
        answer
    });

    await quiz.save();
    res.render('gamecode.ejs',{gcode});

})

//---------------------
//create quiz space

app.get('/create/space',(req,res)=>{
    res.render('createSpace.ejs');
})

app.post('/create/space',async(req,res)=>{
    const {topic,question,option,answer} = req.body;
    var gcode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(req.session.user_id)
    const teacher = await User.findById(req.session.user_id);
    console.log(teacher);
    const quiz = new Quiz({
        topic ,
        game : 'space invaders',
        code: gcode,
        teacher: teacher.name,
        question,
        answer,
        option
    });

    await quiz.save();
    res.render('gamecode.ejs',{gcode});

})

//----
//create quiz doodle
app.post('/create/doodle',async(req,res)=>{
    const {question} = req.body;
    console.log(question);
    const teacher = await User.findById(req.session.user_id);
    
    var gcode = Math.floor(100000 + Math.random() * 900000).toString();
    const quiz = new Quiz({ 
        topic : 'Doodle for Fun',
        game : 'Doodle Fun',
        code: gcode,
        teacher: teacher.name,
        question,
    });

    await quiz.save();
    res.render('gamecode.ejs',{gcode});  
})

app.get('/create/doodle',(req,res)=>{
    res.render('createDoodle.ejs');
})

//-------------------------------------------------------------------


//games start
//dino

app.get('/dino',async(req,res)=>{
    var code = req.session.gamecode;
    if (code != null){
        req.session.gamecode = null;
        const quiz = await Quiz.findOne({ code });
        console.log(quiz);
        res.render('games/dino.ejs',{question : quiz.question , answer: quiz.answer ,trial : false, code:quiz.code});
    }else{
        res.render('games/dino.ejs',{question : [] , answer: [] , trial : true, code:-1})
    }
});

//-----------------------------------------------
//space

app.get('/space',async(req,res)=>{
	var code = req.session.gamecode;
    if (code != null){
        req.session.gamecode = null;
        const quiz = await Quiz.findOne({ code });
        console.log(quiz);
        res.render('games/space.ejs',{question : quiz.question , answer: quiz.answer ,
            option: quiz.option ,trial : false, code:code});
    }else{
        res.render('games/space.ejs',{question : [] , answer: [] , option : [] ,trial : true, code: -1})
    }
});
//----------------------------------------------
//coinscrapper

app.get('/coinscrapper',async(req,res)=>{
    var code = req.session.gamecode;
    if (code != null){
        req.session.gamecode = null;
        const quiz = await Quiz.findOne({ code });
        console.log(quiz);
        res.render('games/coinscrapper.ejs',{question : quiz.question , answer: quiz.answer ,trial : false, code: quiz.code});
    }else{
        res.render('games/coinscrapper.ejs',{question : [] , answer: [] , trial : true, code: -1})
    }

});

//doodle fun
//----
app.get('/doodle',async(req,res)=>{
    var code = req.session.gamecode;
    if (code != null){
        req.session.gamecode = null;
        const quiz = await Quiz.findOne({ code });
        console.log(quiz);
        res.render('games/doodle.ejs',{question : quiz.question ,trial : false ,code: quiz.code});
    }else{
        res.render('games/doodle.ejs',{question : [] , trial : true ,code: -1})
    }
});

//-------------------------------------------------------------
//Dashboard


app.get('/student/dashboard',requireLogin,(req,res)=>{
    var valid = req.session.valid;
     req.session.valid = null;
	res.render('dashboard_stud.ejs',{valid});
});

app.get('/teacher/dashboard',requireLogin,(req,res)=>{
    res.render('dashboard_teacher.ejs');
});

//--------------------------------------------------------------
//educational games


app.get('/student/educational-games',(req,res)=>{
	res.render('educational-games_stud.ejs');
});

app.post('/student/educational-games',async(req,res)=>{
    const {code} = req.body;
    console.log({code});
    const quiz = await Quiz.findOne({ code });
    req.session.gamecode = quiz.code;

    if (quiz.game == 'coinscrapper'){
        res.redirect('/coinscrapper')
    }else if (quiz.game == 'space invaders') {
        res.redirect('/space')
    }else if (quiz.game == 'dinosaur adventures'){
        res.redirect('/dino')
    }
});

//-----

app.get('/teacher/educational-games',(req,res)=>{
    res.render('educational-games_teacher.ejs');
});

//--------------------------------------------------
//analytics
//-----------------------------------------------
app.get('/teacher/analytics',async(req,res)=>{
  const quiz = await Quiz.find({});
    res.render('analytics.ejs', {quiz});
});

//--------------------------------------------
//save score
//-----------------
app.post('/check', async(req,res) => {
  const {score, game_id} = req.body;
  const quiz = await Quiz.findOne({ game_id });
  const player = await User.findById(req.session.user_id);
  console.log(player)
  const result = new Result({
    game_id,
    player_id: req.session.user_id,
    score,
    player_name: player.name,
  });
  result.save();
})
//---------------------------------------

//leaderboard
app.get('/leaderboard/:code',async(req,res)=>{
  const { code } = await req.params;
  console.log(code);
  const result = await Result.find({game_id: code});
  console.log(result)
    res.render('leaderboard.ejs', {result});
});
//--------------------------------------------




app.listen(3000,()=>{
	console.log('Listening to port 3000');
});
