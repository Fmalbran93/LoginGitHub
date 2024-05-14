import { Router } from "express";
import passport from "passport";

const authRouter = Router();

authRouter.post(
  "/",
  passport.authenticate("register", {
    failureRedirect: "/failedRegister",
  }),
  async (req, res) => {
    if (!req.user) {
      return res.status(400).send("Datos incorrectos");
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

authRouter.get("/failedRegister", (req, res) => {
  res.send("registro fallido");
});

export default authRouter;