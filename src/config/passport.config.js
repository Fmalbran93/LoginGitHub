import passport from "passport";
import local from "passport-local"

import GitHubStrategy from "passport-github2";
import userModel from "../models/user.model.js";
import { createHash, isValidPassword } from "../config/hash.js";


const localStrategy = local.Strategy;

const initializePassport = () => {
  passport.use(
    "register",
    new localStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        const { name, surName, email, age, roles } = req.body;
        try {
          let user = await userModel.findOne({ email });
          if (user) {
            return done(null, false);
          }
          let newUser = {
            name,
            surName,
            email,
            age,
            roles,
            password: createHash(password),
          };
          let result = await userModel.create(newUser);
          return done(null, result);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new localStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        try {
          let user = await userModel.findOne({ email });
          if (!user) {
            console.log("EL usuario no existe");
            return done(null, false);
          }
          if (!isValidPassword(password, user)) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    let user = await userModel.findById({ _id: id });
    done(null, user);
  });

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: "Iv23li8xI9MAQeTs42TA",
        clientSecret: "ba77c1767357f7bb1a85161d638387d5f9990893",
        callbackURL: "http://localhost:8080/api/session/githubcallback"
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("Profile", profile);
        try {
          let user = await userModel.findOne({ email: profile._json.email });
          if (!user) {
            let newUser = {
              name: profile._json.name,
              surName: "",
              age: 36,
              email: profile._json.email,
              password: "",
            };
            let result = await userModel.create(newUser);
            done(null, result);
          } else {
            done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

export default initializePassport;