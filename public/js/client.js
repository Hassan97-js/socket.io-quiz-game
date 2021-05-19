const socket = io();

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
});

// -- on connection
socket.on("questions", question => {
  console.log(question);

  removeAllChilds(playerChoices);

  questionSection.innerHTML = `${global_qNumber}. ${decodeURIComponent(
    question.question
  )}`;

  if (currentRoom !== "Spectators") {
    // send the answer to the client
    for (const answer of question.all_answers) {
      const button = document.createElement("button");
      button.className = "btn btn-lg btn-outline-dark d-block mx-auto my-2";
      button.textContent = decodeURIComponent(answer);
      playerChoices.appendChild(button);
      button.addEventListener("click", () => {
        socket.emit("answer", button.textContent);
        console.log(button.textContent);
        removeAllChilds(playerChoices);
      });
    }

    playerResult.innerHTML = "";
  } else {
    playerChoices.innerHTML = "";
    if (spec_info) {
      playerResult.innerHTML = `Player has answered ${
        spec_info.q_status ? "Correct" : "Wrong"
      }.`;
      playerScore.innerHTML = `Player has score ${spec_info.score}.`;
    }
  }
});

socket.on("answerStatus", (payload, number) => {
  global_qNumber = number;
  spec_info = payload;
  playerScore.textContent = `Your score is: ${payload.score}`;
});

// -- on connection

// remove all childnodes
function removeAllChilds(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

// send the answer to the server
function sendAnswer() {
  socket.emit("answer", choices[current_i].textContent);
  console.log(choices[current_i].textContent, current_i);
}
