const mongoose = require('mongoose')
const bcrtpy = require('bcrypt')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50
  },
  email: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 100
  },
  password: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 1024 //hash過後的長度較長
  },

  role: {
    type: String,
    enum: ["student", "instructor"], //enumerate(列舉)的縮寫
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})

// methods : 確認身分
userSchema.methods.isStudent = function () {
  return this.role == "student" // return true or false
}

userSchema.methods.isInstructor = function () {
  return this.role == "instructor"
}

userSchema.methods.isAdmin = function () {
  return this.role == "admin"
}

// middleware : User.save時執行的middleware -> hash password
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const hash = await bcrtpy.hash(this.password, 10)
    this.password = hash
    next()
  } else {
    return next()
  }
})

userSchema.methods.comparePassword = function (password, cb) {
  bcrtpy.compare(password, this.password, (err, isMatch) => {
    if (err) {
      return cb(err, isMatch)
    }
    cb(null, isMatch)
  })
}


// export
module.exports = mongoose.model("User", userSchema)