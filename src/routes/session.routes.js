import { Router } from "express";
import passport from "passport";

const sessionRouter = Router();

sessionRouter.post("/login", authenticateAndRedirect);
sessionRouter.get("/failLogin", sendErrorMessage);
sessionRouter.get("/logout", destroySessionAndRedirect);
sessionRouter.get("/github", authenticateGithubAndRedirect);
sessionRouter.get("/githubcallback", authenticateGithubAndRedirect);

export default sessionRouter;

function authenticateAndRedirect(req, res, next) {
  passport.authenticate("login", { failureRedirect: "/api/session/failLogin" })(req, res, () => {
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
  });
}

function sendErrorMessage(req, res) {
  res.send("Hubo un problema al iniciar sesion");
}

function destroySessionAndRedirect(req, res) {
  if (req.session.login) {
    req.session.destroy();
  }
  res.redirect("/login");
}

function authenticateGithubAndRedirect(req, res, next) {
  passport.authenticate("github", { scope: ["user: email"] })(req, res, () => {
    if (!req.user) {
      return res.redirect("/login");
    }
    req.session.user = req.user;
    req.session.login = true;
    res.redirect("/userProfile");
  });
}
