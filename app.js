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

// decode html entities
const { decode } = require("html-entities");

// global variables
let q_toSend;
let isJoined = false;
let score = 0;

let currentQuestion;
let q_number = 1;
let answerStatus = { q_status: "No status", score: "No score" };

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

    io.in("Player").emit("questions", q_toSend);
  });
}

io.on("connection", socket => {
  let currentRoom;
  const randomName = uniqueNamesGenerator({
    dictionaries: [colors, adjectives, animals],
    style: "capital"
  });

  console.log(socket.id, "Connected");

  socket.emit("playerConnected", randomName);

  if (isJoined === false) {
    currentRoom = "Player";
    socket.join(currentRoom);
    isJoined = true;
  } else {
    currentRoom = "Spectators";
    socket.join(currentRoom);
  }

  if (currentRoom === "Player") {
    q_number = 1;
    sendNextQuestion();
  }

  socket.emit("currentRoom", currentRoom, q_number);

  socket.on("answer", answer => {
    sendNextQuestion();
    q_number++;

    if (currentQuestion.correct_answer === decode(answer)) {
      score++;
      console.log("Your score:", score);
      answerStatus.q_status = true;
      answerStatus.score = score;
      io.emit("answerStatus", answerStatus, q_number);
      console.log(`You answered with ${answer}`);
      console.log(`Correct answer is ${currentQuestion.correct_answer}`);
    } else {
      console.log("Wrong");
      answerStatus.q_status = false;
      answerStatus.score = score;
      io.emit("answerStatus", answerStatus, q_number);
      console.log(`You answered with ${answer}`);
      console.log(`Correct answer is ${currentQuestion.correct_answer}`);
    }
    io.emit("spectatorsLog", {
      q_toSend,
      q_number,
      answerStatus
    });
  });

  console.log("score ", score);

  // Player status: disconnected
  socket.on("disconnect", () => {
    if (currentRoom === "Player") {
      isJoined = false;
      q_number = 1;
      score = 0;
      io.in("Spectators").emit("clearTheLog");
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
