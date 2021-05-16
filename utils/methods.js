// axios
const axios = require("axios").default;

// get the questions
const getQuestions = async () => {
  try {
    const response = await axios.get(
      "https://opentdb.com/api.php?amount=5&category=9&difficulty=medium&type=multiple"
    );
    const questions = response.data.results;
    return questions;
  } catch (error) {
    console.error(error);
  }
};

// shuffle the items in the array
const shuffle = array => {
  let shuffledArray = [...array];
  let currentIndex = shuffledArray.length;
  let tempVal;
  let randIndex;

  while (currentIndex) {
    randIndex = Math.floor(Math.random() * currentIndex--);

    tempVal = shuffledArray[currentIndex];
    shuffledArray[currentIndex] = shuffledArray[randIndex];
    shuffledArray[randIndex] = tempVal;
  }

  return shuffledArray;
};

module.exports = { getQuestions, shuffle };
