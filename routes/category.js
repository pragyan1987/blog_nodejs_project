const express = require('express');
const Blog = require('./../models/Blog');
const router = express.Router();



router.get('/:category', async (req, res) => {
  const blogs= await Blog.find({category: req.params.category}).sort({ createdAt: 'desc' })
  

  if (blogs == null) res.redirect('/')
  res.render('category', { blogs: blogs })
})






module.exports = router