// axios
const axios = require("axios").default;

// get the questions
const getQuestion = async () => {
  try {
    const response = await axios.get(
      "https://opentdb.com/api.php?amount=1&category=9&difficulty=medium&type=multiple",
      {
        params: { encode: "url3986" }
      }
    );
    const question = response.data.results[0];
    return question;
  } catch (error) {
    console.error(error);
  }
};

// shuffle the items in the array
const shuffle = array => {
  const shuffledArray = [...array];
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

module.exports = { getQuestion, shuffle };
