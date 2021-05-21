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
  }
});

// -- on connection
socket.on("questions", question => {
  console.log(question);

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
        console.log(button.textContent);
        removeAllChilds(playerChoices);
      });
    }
    playerResult.innerHTML = "";
  } else if (currentRoom === "Spectators") {
    playerChoices.innerHTML = "";
  }
});

socket.on("spectatorsLog", ({ q_toSend, q_number, answerStatus }) => {
  console.log(q_toSend);
  console.log(q_number);
  console.log(answerStatus);
  if (answerStatus.q_status === true) {
    answerStatus.q_status = "Correct";
  } else if (answerStatus.q_status === false) {
    answerStatus.q_status = "Wrong";
  }

  const div = document.createElement("div");
  const questionSpan = document.createElement("span");
  const answerStatusSpan = document.createElement("span");

  questionSpan.className = "d-block mt-3";
  answerStatusSpan.className = "d-block mt-2";
  div.className = "log";

  questionSpan.innerHTML = `${q_number - 1}. ${q_toSend.question}`;
  answerStatusSpan.innerHTML = `Player has answered ${answerStatus.q_status}`;

  div.appendChild(questionSpan);
  div.appendChild(answerStatusSpan);
  playerResult.appendChild(div);

  // removeOneChild(mainSection, questionSection);
  questionSection.innerHTML = "";
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
  console.log("Run");
});

// -- on connection

function removeOneChild(parent, child) {
  parent.removeChild(child);
}

function removeAllChilds(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function sendAnswer() {
  socket.emit("answer", choices[current_i].textContent);
  console.log(choices[current_i].textContent, current_i);
}
