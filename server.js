const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const bodyParser = require("body-parser");
const { userJoin, userLeave, getRoomUsers } = require("./utils/users");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const JWT_SECRET_KEY = process.env.MY_CUSTOM_SECRET_KEY;
app.use((req, res, next) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

app.get("/", (req, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
});
app.post("/chat.html", (req, res) => {
  const username = req.body.username;
  const room = req.body.room;
  const password = req.body.password;

 console.log('req', req);
  //assuming username and password correct

  if (!username || !room) {
    res.redirect(`/`);
    return;
  }
  // Create and send JWT token upon successful login
  const token = jwt.sign({ username, room }, JWT_SECRET_KEY);
 
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");

  res.redirect(`/chat.html?token=${token}`);
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (token) => {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET_KEY);
      const { username, room } = decoded;
      const user = userJoin(socket.id, username, room);
      socket.join(user.room);
      socket.emit("message", formatMessage("BOT", `Welcome ${user.username}!`));
      socket.broadcast
        .to(user.room)
        .emit("message", formatMessage("BOT", `${user.username} has joined!`));

      io.to(user.room).emit("usersInRoom", {
        room: user.room,
        usersList: getRoomUsers(user.room),
      });
    } catch (error) {
      // socket.emit("message", formatMessage("BOT", "Invalid token."));
      setTimeout(() => {
        socket.emit("redirect", {
          msg: "Invalid token. Please log in again.",
          url: "/",
        });
      }, 2000);
    }
  });

  socket.on("chatMsg", (data) => {
    const { msg, token } = data;
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET_KEY);
      const { username, room } = decoded;
      io.to(room).emit("message", formatMessage(username, msg));
    } catch (error) {
      console.error(error);
      // Handle invalid token

      // socket.emit("message", formatMessage("BOT", "Invalid token."));
      setTimeout(() => {
        socket.emit("redirect", {
          msg: "Invalid token. Please log in again.",
          url: "/",
        });
      }, 2000);
    }
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("BOT", `${user.username} has just left!`)
      );
      io.to(user.room).emit("usersInRoom", {
        room: user.room,
        usersList: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listens to the port ${PORT}`);
});
// const crypto = require("crypto");
// const secretKey = crypto.randomBytes(32).toString("hex");
// console.log(secretKey);