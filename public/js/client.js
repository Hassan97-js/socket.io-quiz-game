const socket = io();

const mainSection = document.querySelector("main");
const questionSection = document.querySelector("section#question");

const playerStatus = document.querySelector("span.p__connecting");

const resultSection = document.querySelector("section#result");
const playerResult = document.querySelector("div.result-content");
const playerScore = document.querySelector("div.score");

const playerChoices = document.querySelector("section#choices");

let currentRoom;
let spec_info;
let current_i;
let global_qNumber = 1;

socket.on("playerConnected", name => {
  playerStatus.textContent = `${name} connected!`;
});

socket.on("currentRoom", (room, number) => {
  global_qNumber = number;
  currentRoom = room;
  console.log("You are in room: " + room);
  if (room === "Spectators") {
    questionSection.innerHTML =
      "Waiting for the player to answer the question...";
    playerResult.style = "overflow: scroll; height: 550px";
  }
});

// -- on connection
socket.on("questions", question => {
  removeAllChilds(playerChoices);

  questionSection.innerHTML = `${global_qNumber}. ${question.question}`;

  if (currentRoom === "Player") {
    // send the answer to the client
    for (const answer of question.all_answers) {
      const button = document.createElement("button");
      button.className = "btn btn-lg btn-outline-dark d-block my-2";
      button.innerHTML = decodeURIComponent(answer);
      playerChoices.appendChild(button);
      button.addEventListener("click", () => {
        socket.emit("answer", button.textContent);

        removeAllChilds(playerChoices);
      });
    }
    playerResult.innerHTML = "";
  } else if (currentRoom === "Spectators") {
    playerChoices.innerHTML = "";
  }
});

socket.on("spectatorsLog", payload => {
  createSpectatorsLog(payload);
  playerResult.scrollTo(0, playerResult.scrollHeight);
});

socket.on("answerStatus", (payload, number) => {
  global_qNumber = number;
  spec_info = payload;
  if (currentRoom === "Player") {
    playerScore.textContent = `Your score is: ${payload.score}`;
  } else {
    playerScore.innerHTML = `Player has score: ${payload.score}`;
  }
});

socket.on("clearTheLog", () => {
  removeAllChilds(playerResult);
  spec_info.score = 0;
  if (currentRoom === "Spectators") {
    playerScore.textContent = `Player score is: ${spec_info.score}`;
  }
});

// -- on connection
