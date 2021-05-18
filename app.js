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
const { getQuestion, shuffle } = require("./utils/methods");

// name generator
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals
} = require("unique-names-generator");

// global variables
let q_toSend;
let isJoined = false;
let score = 0;
let currentRoom;
let currentQuestion;

// function to send the question
function sendNextQuestion() {
  getQuestion().then(question => {
    const correctAnswer = question.correct_answer;
    const incorrectAnswers = question.incorrect_answers;
    if (incorrectAnswers.length < 4) {
      incorrectAnswers.push(correctAnswer);
    }

    currentQuestion = question;
    question.all_answers = shuffle(incorrectAnswers);

    q_toSend = {
      all_answers: question.all_answers,
      category: question.category,
      difficulty: question.difficulty,
      question: question.question
    };

    io.emit("questions", q_toSend);
  });
}

io.on("connection", socket => {
  // send the question to the client
  sendNextQuestion();

  // generate a random name
  const shortName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    length: 2,
    style: "capital"
  });

  // assign the random name to the socket.id
  socket.id = shortName;
  console.log(socket.id, "Connected");

  socket.emit("playerConnected", socket.id);

  // Determining the room name
  if (isJoined === false) {
    currentRoom = "Player";
    socket.join(currentRoom);
    isJoined = true;
  } else {
    currentRoom = "Spectators";
    socket.join(currentRoom);
  }

  socket.emit("currentRoom", currentRoom);

  socket.on("answer", answer => {
    // send a new question when the player send the answer
    sendNextQuestion();

    if (currentQuestion.correct_answer === answer) {
      score++;
      console.log("Your score:", score);
      io.emit("answerStatus", { q_status: true, score });
    } else {
      console.log("Wrong");
      io.emit("answerStatus", { q_status: false, score });
    }
  });

  console.log("score ", score);

  // Player status: disconnected
  socket.on("disconnect", () => {
    if (currentRoom === "Player") {
      isJoined = false;
    }
    score = 0;
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
