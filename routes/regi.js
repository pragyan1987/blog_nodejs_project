const express = require('express');
const User= require('./../models/data');
const router = express.Router();
const session = require('express-session');
const flash = require('connect-flash');
//const res = require('express/lib/response');


const app = express();
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

router.get('/admin_login', (request, response) => {
    response.render('admin_login');
  });
  router.get('/register', (req, res) => {
    res.render('register',{message :req.flash('message')});
  });
  
  router.post('/', async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
     req.flash('message','That user already exisits!');
     res.redirect('regi/register');
      
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
     res.redirect('regi/register');
    }
});



    
  
        router.post('/login', async (req, res) =>  {
    
	let data=await User.findOne({email:req.body.email});
		if(data){
			
		if(data.password==req.body.password){
               
                res.render('userprofile', { data: data});

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


module.exports = router;
