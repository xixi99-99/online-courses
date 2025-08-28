const router = require('express').Router()
const registerValidation = require('../validation').registerValidation
const loginValidation = require('../validation').loginValidation
const User = require('../models').userModel
const jwt = require('jsonwebtoken')

router.use((req, res, next) => {
  console.log("A request is coming in to auth.js");
  next()
})

router.get('/testAPI', (req, res, next) => {
  const msgObj = {
    message: "Test API is working."
  }
  return res.json(msgObj)
})

router.post('/register', async (req, res) => {
  console.log("Register!!!");
  // console.log(registerValidation(req.body));
  const { error } = registerValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)  //如果有error就顯示其中的message, 若register成功就不會有error

  // if email exsit
  const emailExist = await User.findOne({ email: req.body.email })
  if (emailExist) return res.status(400).send("Email has already been registered.")

  // register user
  const newUser = new User({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    role: req.body.role
  })
  try {
    const saveUser = await newUser.save()
    res.status(200).send({
      msg: "success",
      savedObject: saveUser,
    })
  }
  catch (error) {
    res.status(400).send("User not saved.")
  }
})

router.post('/login', (req, res) => {
  // check the validation of data
  const { error } = loginValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      return res.status(400).send(err)
    }
    if (!user) {
      res.status(401).send("User not found.")
    } else {
      user.comparePassword(req.body.password, function (error, isMatch) { // user-model中寫的comparePassword方法, 需要放入未加密的密碼和一個Callback function
        if (err) return res.status(400).send(err)
        if (isMatch) {
          const tokenObj = { _id: user._id, email: user.email }
          const token = jwt.sign(tokenObj, process.env.PASSPORT_SECRET)
          res.send({
            success: true,
            token: "JWT " + token, user  //回傳給使用者, 注意空格
          })
        } else {
          console.log(err);
          res.status(401).send("wrong Password.")
        }
      })
    }
  })
})

module.exports = router