const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');


router.post('/createuser',[
    body('name', 'Enter Valid Name').isLength({ min: 3 }),
    body('email', 'Enter valid email adress').isEmail(),
    body('password','Password must be atleast min 5 characters').isLength({ min: 5 })
] , async(req, res)=>{
  // If there are errors, return bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //check wheather the user email is already exist or not
    try {
      
    
    let user = await User.findOne({email: req.body.email});
    if(user){
      return res.status(400).json({error: "User with this email already exist"});
    }

    //create a new user
     user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      })
      res.json(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occured");
    }

      } );

module.exports = router;