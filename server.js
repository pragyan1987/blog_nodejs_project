require("dotenv").config();
const express = require('express');

//bring in mongoose
const mongoose = require('mongoose');

//bring in method override
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const blogRouter = require('./routes/blogs');
const blogRouter1 = require('./routes/category');
const blogRouter2 = require('./routes/regi');

const Blog = require('./models/Blog');
const User= require('./models/data');

const app = express();

//const db='mongodb+srv://mydb1:mydb1980@cluster0.c29zo.mongodb.net/new_blog?retryWrites=true&w=majority';

mongoose.connect(process.env.DATABASE,
  {useNewUrlParser: true, useUnifiedTopology: true,}
  )
  .then(() => { 
console.log("DB connected");

  });
//mongoose.connect('mongodb+srv://mydb1:mydb1980@cluster0.3x8rg.mongodb.net/new_blog');


//mongoose.connect('mongodb://localhost/new_blog', {
 // useNewUrlParser: true, useUnifiedTopology: true
//});


//set template engine
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'secret',
  saveUninitialized: false,
  resave: false
}));
app.use(flash());
app.use((req, res, next)=>{
  res.locals.message = req.session.message
  delete req.session.message
  next()
})
//route for the index
app.get('/', async (request, response) => {
  var query = { status:"publish"};
  let blogs = await Blog.find(query).sort({ timeCreated: 'desc' });

  response.render('index', { blogs: blogs });
});

app.get('/admin_home', async (request, response) => {
  
  let blogs = await Blog.find().sort({ timeCreated: 'desc' });

  response.render("admin_home", { blogs: blogs });
});

app.get('/login', (request, response) => {
  response.render('login',{message :request.flash('message')});
});
app.get('/register', (req, res) => {
  res.render('register',{message :req.flash('message')});
});

app.post('/register', async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
   req.flash('message','That user already exisits!');
   res.redirect('/register');
    
     // return res.status(400).send('That user already exisits!');
  } else {
      // Insert the new user if they do not exist yet
      user = new User({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password
      });
      await user.save();
      //res.send(user);
      req.flash('message','Successfully register');
   res.redirect('/register');
  }
});



  

      app.post('/admin_login', async (req, res) =>  {
       
let data=await User.findOne({email:req.body.email});
  if(data){
    
  if(data.password==req.body.password){
    var query = { email:req.body.email};
    let blogs = await Blog.find(query).sort({ timeCreated: 'desc' });
              res.render('userprofile', { blogs: blogs});

    }else{
      req.flash('message','Wrong password!');
      res.redirect('/login');      
    }
  }else{
    req.flash('message','No user with that email!');
   res.redirect('/login');
    //return done(null, false, { message: 'No user with that email' })

  }
});
app.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});


app.use(express.static('public'));
app.use('/blogs', blogRouter);
app.use('/category', blogRouter1);
app.use('/regi', blogRouter2);


//listen port
app.listen(5000);
