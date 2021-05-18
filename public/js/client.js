const socket = io();

// player namespace (multiplexing)
const questionSection = document.querySelector("section#question");
const playerStatus = document.querySelector("span.p__connecting");
const playerChoices = document.querySelector("section#choices");
const resultSection = document.querySelector("section#result");
const playerResult = document.querySelector("div.result-content");
const playerScore = document.querySelector("div.score");

let currentRoom;
let spec_info;

socket.on("playerConnected", name => {
  playerStatus.textContent = `${name} connected!`;
});

socket.on("currentRoom", room => {
  currentRoom = room;
  console.log("You are in room: " + room);
});

// -- on connection
socket.on("questions", question => {
  console.log(question);

  removeAllChilds(playerChoices);
  removeAllChilds(playerResult);

  if (question !== "No questions left") {
    questionSection.innerHTML = question.question;
    if (currentRoom !== "Spectators") {
      for (const answer of question.all_answers) {
        const button = document.createElement("input");
        button.setAttribute("type", "button");
        button.className =
          "btn btn-lg btn-outline-dark w-50 d-block mx-auto my-2";
        const decodedAnswer = decodeHTML(answer);
        button.value = decodedAnswer;
        playerChoices.appendChild(button);

        button.addEventListener("click", () => {
          socket.emit("answer", button.value);
          removeAllChilds(playerChoices);
        });
      }
    } else {
      spec_info
        ? (playerResult.innerHTML = `Player has answered ${
            spec_info.q_status ? "Correct" : "Wrong"
          }.`)
        : (playerChoices.innerHTML = "Waiting for player to answer...");

      spec_info
        ? (playerScore.innerHTML = `Player has score ${spec_info.score}.`)
        : (playerChoices.innerHTML = "Waiting for player to answer...");
    }
  }
});

socket.on("answerStatus", payload => {
  spec_info = payload;
  console.log(payload);
  playerScore.textContent = `Your score is: ${payload.score}`;
});

// -- on connection

// remove all childnodes
function removeAllChilds(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

// decode HTML entities
function decodeHTML(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
