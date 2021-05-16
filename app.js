// express
const express = require("express");
const app = express();
// node
const http = require("http");
const server = http.createServer(app);
const path = require("path");
// Socket.io
const { Server } = require("socket.io");
const io = new Server(server);
// middlewares
app.use(express.static(path.join(__dirname, "public")));
// imports
const { getQuestions, shuffle } = require("./utils/methods");

let data;
let isJoined = false;

getQuestions().then(questions => (data = questions));

io.on("connection", socket => {
  // Player status: connected
  console.log(`${socket.id} connected`);
  socket.emit("playerConnected");

  // Determining the room name
  let currentRoom;

  if (!isJoined) {
    currentRoom = "Player";
    socket.join(currentRoom);
    isJoined = false;
  } else {
    currentRoom = "Spectators";
    socket.join(currentRoom);
  }

  socket.emit("currentRoom", currentRoom);

  // sending the data to the client
  if (data) {
    data.forEach(value => {
      const correctAnswer = value.correct_answer;
      const incorrectAnswers = value.incorrect_answers;
      if (incorrectAnswers.length < 4) {
        incorrectAnswers.push(correctAnswer);
      }
      value.allAnswers = shuffle(incorrectAnswers);
    });

    if (currentRoom === "Player") {
      io.in(currentRoom).emit("questions", data);
    } else {
      io.in(currentRoom).emit("spectator", "You are in the Spectators room");
    }
  }

  // Player status: disconnected
  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
  });
});

app.all("*", (req, res) => {
  res.status(404).send("<h1>404: Page not found</h1>");
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
