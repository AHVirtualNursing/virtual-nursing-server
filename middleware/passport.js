const passport = require("passport");
const { getUserModel } = require("../helper/auth");
const user = require("../models/user");
const LocalStrategy = require("passport-local").Strategy;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    user.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new LocalStrategy(
    { usernameField: "identifier", passReqToCallback: true },
    async (req, identifier, password, done) => {
      const userType = getUserModel(req.headers["x-usertype"]);
      try {
        const user = await userType.findOne({
          $or: [{ email: identifier }, { username: identifier }],
        });

        if (!user) {
          return done(null, false, { message: "Invalid email or username." });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          return done(null, false, { message: "Invalid password." });
        }

        return done(null, user);
      } catch (err) {
        console.error(err);
      }
    }
  )
);

module.exports = passport;
