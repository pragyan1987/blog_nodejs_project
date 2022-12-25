//blog routes

const express = require('express');
const Blog = require('./../models/Blog');
const router = express.Router();
const multer = require('multer');
const res = require('express/lib/response');
const { route } = require('./category');
const User = require('./../models/data');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();
app.use(session({
  secret: 'secret',
  saveUninitialized: false,
  resave: false
}));
app.use(flash());
//define storage for the images

app.use((req, res, next)=>{
  res.locals.message = req.session.message
  delete req.session.message
  next()
})
const storage = multer.diskStorage({
  //destination for files
  destination: function (request, file, callback) {
    callback(null, './public/uploads/images');
  },

  //add back the extension
  filename: function (request, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

//upload parameters for multer
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});

router.get('/new', (request, response) => {
  response.render('new');
});

router.get('/admin_login', (request, response) => {
  response.render('admin_login');
});
router.get('/register', (request, response) => {
  response.render('register');
});
router.post('/register', async (req, res) => {
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


router.post('/admin_login', async (req, res) =>  {
    
  const{email,password}=req.body;
  if(email == 'p1@gmail.com' && password =='1234')
  {
    
      
      res.redirect("/blogs/admin_home");
    
  }
  else
  {
      res.render("admin_login");
  }
      
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


router.get('/category', (request, response) => {
  response.render('category');
});



router.get('/admin_home', async (request, response) => {
  
  let blogs = await Blog.find().sort({ timeCreated: 'desc' });

  response.render('admin_home', { blogs: blogs });
})

//view route user
router.get('/:slug', async (request, response) => {
  let blog = await Blog.findOne({ slug: request.params.slug });

  if (blog) {
    response.render('show', { blog: blog });
  } else {
    response.redirect('/');
  }
});
  
//view route register user
router.get('/user/:slug', async (request, response) => {
  let blog = await Blog.findOne({ slug: request.params.slug });

  if (blog) {
    response.render('show_user', { blog: blog });
  } else {
    response.redirect('/');
  }
});
//route that handles new post
router.post('/', upload.single('image'), async (request, response) => {
  console.log(request.file);
  // console.log(request.body);
  let blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    category:request.body.category,
    description: request.body.description,
    img: request.file.filename,
    email:request.body.email,
  });

  try {
    blog = await blog.save();

    response.redirect(`blogs/${blog.slug}`);
  } catch (error) {
    res.render("error");
    console.log(error);
  }
});

// route that handles edit admin view
router.get('/edit/:id', async (request, response) => {
  let blog = await Blog.findById(request.params.id);
  response.render('edit', { blog: blog });
});
// route that handles edit user view
router.get('/editu/:id', async (request, response) => {
  let blog = await Blog.findById(request.params.id);
  response.render('edit_user', { blog: blog });
});

router.get('/showu/:author', async (request, response) => {
  var query = { author:request.params.author};
  let blogs = await Blog.find(query).sort({ timeCreated: 'desc' });
  response.render('userprofile', { blogs: blogs });
});
//route to handle updates
router.put('/:id', async (request, response) => {
  request.blog = await Blog.findById(request.params.id);
  let blog = request.blog;
  blog.title = request.body.title;
  blog.author = request.body.author;
  blog.email = request.body.email;
  blog.description = request.body.description;
  blog.status=request.body.status;
  
  try {
    blog = await blog.save();
    //redirect to the view route
    response.redirect(`/blogs/${blog.slug}`);
  } catch (error) {
    console.log(error);
    response.redirect(`/seblogs/edit/${blog.id}`, { blog: blog });
  }
});

router.put('/user/:id', async (request, response) => {
  request.blog = await Blog.findById(request.params.id);
  let blog = request.blog;
  blog.title = request.body.title;
 
  blog.description = request.body.description;
  //blog.status=request.body.status;
  
  try {
    blog = await blog.save();
    //redirect to the view route
    response.redirect(`/blogs/user/${blog.slug}`);
  } catch (error) {
    console.log(error);
    response.redirect(`/seblogs/edit/${blog.id}`, { blog: blog });
  }
});


///route to handle delete
router.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.redirect("/blogs/admin_home");
});

router.delete('/user/:id', async (request, response) => {
  let blogs=await Blog.findByIdAndDelete(request.params.id);
  response.render('userprofile', { blogs: blogs });});

module.exports = router;
