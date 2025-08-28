const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../models').userModel

module.exports = (passport) => {
  let opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt"); //從header中獲取token的value
  opts.secretOrKey = process.env.PASSPORT_SECRET
  passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false); //若有error下面就不執行
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }));
}