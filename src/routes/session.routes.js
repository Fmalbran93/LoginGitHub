import { Router } from "express";
import passport from "passport";

const sessionRouter = Router();

sessionRouter.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/api/session/failLogin",
  }),
  async (req, res) => {
    if (!req.user) {
      return res.status(400).send("Datos oncorrectos");
    }
    req.session.user = {
      name: req.user.name,
      surName: req.user.surName,
      age: req.user.age,
      email: req.user.email,
    };
    req.session.login = true;
    res.redirect("/userProfile");
  }
);

sessionRouter.get("/failLogin", async (req, res) => {
  res.send("Hubo un problema al iniciar sesion");
});

sessionRouter.get("/logout", (req, res) => {
  if (req.session.login) {
    req.session.destroy();
  }
  res.redirect("/login");
});

sessionRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user: email"] }),
  async (req, res) => {}
);

sessionRouter.get(
  "/githubcallback",
  passport.authenticate("github", {
    failureRedirect: "/login",
  }),
  async (req, res) => {
    req.session.user = req.user;
    (req.session.login = true), res.redirect("/userProfile");
  }
);

export default sessionRouter;