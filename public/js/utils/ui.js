function removeOneChild(parent, child) {
  parent.removeChild(child);
}

function removeAllChilds(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function createSpectatorsLog(payload) {
  if (payload.answerStatus.q_status === true) {
    payload.answerStatus.q_status = "Correct";
  } else if (payload.answerStatus.q_status === false) {
    payload.answerStatus.q_status = "Wrong";
  }

  const div = document.createElement("div");
  const questionSpan = document.createElement("span");
  const answerStatusSpan = document.createElement("span");

  questionSpan.className = "d-block mt-3";
  answerStatusSpan.className = "d-block mt-2";
  div.className = "log";

  questionSpan.innerHTML = `${payload.q_number - 1}. ${
    payload.q_toSend.question
  }`;
  answerStatusSpan.innerHTML = `Player has answered ${payload.answerStatus.q_status}`;

  div.appendChild(questionSpan);
  div.appendChild(answerStatusSpan);
  playerResult.appendChild(div);

  questionSection.innerHTML = "";
}
