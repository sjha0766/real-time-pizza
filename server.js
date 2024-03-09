const express = require("express");
const app = express();
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path");
const allRoutes = require("./routes/web");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("express-flash");
require("dotenv").config();
const passport = require('passport');
const Emitter = require('events')

// Set up MongoDB connection
const url = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Pizza";
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;

connection.on("error", console.error.bind(console, "MongoDB connection error:"));
connection.once("open", () => {
  console.log("Connected to the MongoDB database!");
});

// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

// Event listeners for database connection

app.use(
  session({
    secret: process.env.session_Key,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: connection }),
  })
);

const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Set up middlewares
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.session_Key));
app.use(expressLayout);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

// Register routes
allRoutes(app);

const PORT = process.env.PORT || 3000;

const server=app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

const io = require('socket.io')(server)
io.on('connection', (socket) => {
      // Join
      socket.on('join', (orderId) => {
        socket.join(orderId)
      })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})
