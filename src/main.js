import express from "express";
import { __dirname } from "./path.js";
import "dotenv/config";
import handlebars from "express-handlebars";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import bodyParser from "body-parser";

import connectToDB from "./config/configServer.js";
import { Server } from "socket.io";
import socketChat from "./listeners/socketChat.js";
import socketProducts from "./listeners/socketProducts.js";
import initializePassport from "./config/passport.config.js";

import routerViews from "./routes/views.routes.js";
import sessionRouter from "./routes/session.routes.js";
import authRouter from "./routes/auth.routes.js";
import routerCart from "./routes/cart.routes.js";
import routerProducts from "./routes/productos.routes.js";

const app = express();
const PORT = process.env.PORT || 8080;

console.log('MongoDB URI:', process.env.URI);
console.log('Session Secret:', process.env.SECRET);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { path: "/", httpOnly: true, maxAge: 600000 },
    name: "Tienda",
    rolling: true,
    store: MongoStore.create({ 
        mongoUrl: process.env.URI, 
        ttl: 100 
    })
}));

app.use(passport.initialize());
app.use(passport.session());
initializePassport();

app.use((req, res, next) => {
  app.locals.user = req.user;
  next();
});

app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use("/api/products", routerProducts);
app.use("/", routerViews);
app.use("/api/carts", routerCart);
app.use("/api/auth", authRouter);

app.use("/api/session", sessionRouter);

connectToDB();

const httpServer = app.listen(PORT, () => {
  console.log(`Listening on the port http://localhost:${PORT}`);
});

httpServer.on('error', (err) => {
  console.error('Server error:', err);
});

const socketServer = new Server(httpServer);

socketProducts(socketServer);
socketChat(socketServer);