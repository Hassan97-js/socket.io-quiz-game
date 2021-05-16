const socket = io();

// player namespace (multiplexing)
const questionSection = document.querySelector("section#question");
const playerStatus = document.querySelector("span.p__connecting");
const playerChoices = document.querySelector("section#choices");
// const button = document.querySelector(".btn");

socket.on("playerConnected", () => {
  playerStatus.textContent = "Player Connected !";
});

socket.on("currentRoom", room => {
  console.log("You are in room: " + room);
});

socket.on("questions", questions => {
  console.log(questions);

  if (questions !== "No questions left") {
    questionSection.textContent = questions.question;

    for (const answer of questions.all_answers) {
      const button = document.createElement("input");
      button.setAttribute("type", "button");
      button.className =
        "btn btn-lg btn-outline-dark w-50 d-block mx-auto my-2";
      button.value = answer;
      playerChoices.appendChild(button);

      button.addEventListener("click", () => {
        socket.emit("answer", button.value);
        removeAllChilds(playerChoices);
      });
    }
  } else {
    questionSection.textContent = questions;
  }
});

// remove all childnodes
function removeAllChilds(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
