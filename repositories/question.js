const { readFile, writeFile } = require('fs/promises');
const { v4 } = require('uuid');
const { ValidationError } = require('joi');
const filterAsync = require('../utils/filterAsync');

const makeQuestionRepository = async fileName => {
  const fileContent = await readFile(fileName, { encoding: 'utf-8' });
  let questions = JSON.parse(fileContent);

  const saveQuestionsToFile = async () => {
    await writeFile(fileName, JSON.stringify(questions, null, 4), {
      encoding: 'utf-8'
    });
  };

  const getQuestions = async () => {
    return questions;
  };

  const getQuestionById = async questionId => {
    const question = questions.find(x => x.id === questionId);
    return question ? question : null;
  };

  const addQuestion = async question => {
    if (!question.id) {
      question.id = v4();
    }

    if (!question.answers || !Array.isArray(question.answers)) {
      question.answers = [];
    }

    question.answers = question.answers.map(x => {
      if (!x.id) {
        x.id = v4();
      }

      return x;
    });

    questions.push(question);
    await saveQuestionsToFile();

    return question;
  };

  const getAnswers = async questionId => {
    const question = questions.find(x => x.id === questionId);

    return question ? question.answers : null;
  };

  const getAnswer = async (questionId, answerId) => {
    const question = questions.find(x => x.id === questionId);

    if (!question) {
      throw new ValidationError("Question doesn't exists");
    }

    const answer = question.answers.find(x => x.id === answerId);

    return answer ? answer : null;
  };

  const addAnswer = async (questionId, answer) => {
    for (const [i, question] of questions.entries()) {
      if (question.id === questionId) {
        answer.id = v4();
        question.answers.push(answer);
        questions[i] = question;
        await saveQuestionsToFile();
        return answer;
      }
    }

    throw new ValidationError("Question doesn't exists");
  };

  const reFetch = async () => {
    const fileContent = await readFile(fileName, { encoding: 'utf-8' });
    questions = JSON.parse(fileContent);
  };

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    getAnswers,
    getAnswer,
    addAnswer,
    reFetch
  };
};

module.exports = { makeQuestionRepository };
