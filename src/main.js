import express from "express";
import { __dirname } from "./path.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import passport from "passport";
import routerProduct from "./routes/productos.routes.js";
import routerViews from "./routes/views.routes.js";
import routerCart from "./routes/cart.routes.js";
import socketProducts from "./listeners/socketProducts.js";
import socketChat from "./listeners/socketChat.js";
import "./database.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from 'connect-mongo'; // Importa connect-mongo
import mongoose from "mongoose"; // Asegúrate de importar mongoose
import { createRoles } from "./config/initialSetup.js";
import initializePassport from "./config/passport.config.js"
import authRouter from "./routes/auth.routes.js";
import cookieRouter from "./routes/cookies.routes.js";
import sessionRouter from "./routes/session.routes.js";


const app = express();
createRoles();
const PUERTO = 8080;

app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
app.use(cookieParser(process.env.SECRETCOOKIE));
app.use(bodyParser.urlencoded({ extended: true }))


// Crea una instancia de MongoStore utilizando la conexión de mongoose
const store = MongoStore.create({
  mongoUrl: "mongodb+srv://fmalbran93:coderhouse@clustercoder.nqsqgsl.mongodb.net/E-commerce?retryWrites=true&w=majority&appName=ClusterCoder",
  collection: 'sessions' // Nombre de la colección para las sesiones
});

app.use(
session({
  secret: "SECRETSESSION",
  resave: true,
  saveUninitialized: true,
  store: store
})
);

app.use(passport.initialize());
app.use(passport.session());
initializePassport();
 
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use("/api/products", routerProduct);
app.use("/", routerViews);
app.use("/api/carts", routerCart);
app.use("/api/auth", authRouter);
app.use("/api/cookie", cookieRouter);
app.use("/api/session", sessionRouter);

app.get("/userProfile", (req, res) => {
  // Verifica si el usuario está autenticado
  if (req.isAuthenticated()) {
    // Renderiza la vista userProfile.handlebars y pasa los datos del usuario como contexto
    res.render("userProfile", { user: req.user });
  } else {
    // Si el usuario no está autenticado, redirige a la página de inicio de sesión
    res.redirect("/login");
  }
});

const httpServer = app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});


const socketServer = new Server(httpServer); // Creamos una nueva instancia de 'Server' con 'httpServer'

socketProducts(socketServer);
socketChat(socketServer);

