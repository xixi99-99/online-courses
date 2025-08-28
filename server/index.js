const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRoute = require('./routes').auth
const courseRoute = require('./routes').course
const passport = require("passport")
require("./config/passport")(passport) //import 這個function並輸入參數 : function(passport)
const cors = require('cors')

// connect to DB
mongoose.connect(process.env.DB_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connect to MongoDB Atlas");
}).catch((err) => {
  console.log(err);
})

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use('/api/user', authRoute)
app.use('/api/course', passport.authenticate("jwt", { session: false }), courseRoute)

// listen
app.listen(8080, () => {
  console.log("Server running on port 8080.");
});