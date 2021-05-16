const socket = io();

// player namespace (multiplexing)
const questionSection = document.querySelector("section#question");
const playerStatus = document.querySelector("span.p__connecting");

socket.on("playerConnected", () => {
  playerStatus.textContent = "Player Connected !";
});

socket.on("currentRoom", room => {
  console.log("You are in room: " + room);
});

socket.on("questions", questions => {
  questionSection.textContent = questions[0].question;
  // console.log(questions);
});
