const express = require('express');
const router = express.Router();

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

// Creating the Secret for JWT
const JWT_SECRET = 'sauravpianist';



router.post('/createuser', [
  body('name', 'Enter Valid Name').isLength({ min: 3 }),
  body('email', 'Enter valid email adress').isEmail(),
  body('password', 'Password must be atleast min 5 characters').isLength({ min: 5 })
], async (req, res) => {
  // If there are errors, return bad request and the error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  //check wheather the user email is already exist or not
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "User with this email already exist" });
    }
    const salt = await bcrypt.genSalt(10);
    // console.log(salt);
    const secPass = await bcrypt.hash(req.body.password, salt);

    //create a new user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
    })
    const data = {
      user: {
        id: user.id
      }
    }

    //Authentication by using Json Web Token

    const authtoken = jwt.sign(data, JWT_SECRET);
    // console.log(jwtData);
    // res.json(user);
    res.json({ authtoken });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occured");
  }

});

// Authenticate the user using: Post "/api/auth/login" . No-login required

router.post('/login', [
  body('email', 'Enter valid email address').isEmail(),
  body('password', 'Password can not be blank').exists()
], async (req, res) => {
  // If there are errors, return bad request and the error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(400).json({ error: "Please Enter a valid email" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: "Please Enter a valid Credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    }

    const authtoken = jwt.sign(data, JWT_SECRET);
    // console.log(jwtData);
    // res.json(user);
    res.json({ authtoken });


  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server error");
  }


});

// Get the user using: Post "/api/auth/getuser" . Login required
router.post('/getuser', fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server error");
  }

});



module.exports = router;