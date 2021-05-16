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
let counter = 0;
let score = 0;

getQuestions().then(questions => (data = questions));

io.on("connection", socket => {
  // Player status: connected
  console.log(`${socket.id} connected`);
  socket.emit("playerConnected");

  // Determining the room name
  let currentRoom;

  if (isJoined === false) {
    currentRoom = "Player";
    socket.join(currentRoom);
    isJoined = true;
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
      value.all_answers = shuffle(incorrectAnswers);
    });

    if (currentRoom === "Player") {
      io.in(currentRoom).emit("questions", data[counter]);
    } else {
      io.in(currentRoom).emit("spectator", "You are in the Spectators room");
    }
  }

  socket.on("answer", answer => {
    // console.log("answer: ", answer);
    const currentQuestion = data[counter];
    for (const property in currentQuestion) {
      if (property === "correct_answer") {
        if (currentQuestion[property] === answer) {
          score++;
          console.log("Your score:", score);
        } else {
          console.log("Wrong");
        }
      }
    }

    counter++;
    if (counter < 5) {
      io.in(currentRoom).emit("questions", data[counter]);
    } else {
      io.in(currentRoom).emit("questions", "No questions left");
      counter = 0;
    }
  });

  // Player status: disconnected
  socket.on("disconnect", () => {
    if (currentRoom === "Player") {
      isJoined = false;
    }
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
