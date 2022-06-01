const express = require('express');
const { urlencoded, json } = require('body-parser');
const Joi = require('joi');
const autoCatch = require('./utils/errors/autoCatch');
const errorMiddleware = require('./utils/errors/errorMiddleware');
const CustomError = require('./utils/errors/CustomError');

const makeRepositories = require('./middleware/repositories');

const STORAGE_FILE_PATH = process.env.STORAGE_FILE_PATH || 'questions.json';
const PORT = 3000;

const app = express();

const answerSchema = Joi.object({
  author: Joi.string().required(),
  summary: Joi.string().required()
});

const questionSchema = Joi.object({
  author: Joi.string().required(),
  summary: Joi.string().required(),
  answers: Joi.array().items(answerSchema).optional()
});

app.use(urlencoded({ extended: true }));
app.use(json());
app.use(makeRepositories(STORAGE_FILE_PATH));

app.get('/', (_, res) => {
  res.json({ message: 'Welcome to responder!' });
});

app.get('/questions', async (req, res) => {
  const questions = await req.repositories.questionRepo.getQuestions();
  return res.json(questions);
});

app.get(
  '/questions/:questionId',
  autoCatch(async(req, res) => {
    const { questionId } = req.params;

    const question = await req.repositories.questionRepo.getQuestionById(questionId);

    if (!question) {
      throw new CustomError(400, 'Question not found');
    }

    return res.json(question);
  })
);

app.post('/questions', autoCatch(async(req, res) => {
  const question = await questionSchema.validateAsync(req.body);
  
  const newQ = await req.repositories.questionRepo.addQuestion(question);

  return res.json(newQ);
}));

app.get('/questions/:questionId/answers', autoCatch(async(req, res) => {
  const { questionId } = req.params;

    const question = await req.repositories.questionRepo.getQuestionById(questionId);

    if (!question) {
      throw new CustomError(400, 'Question not found');
    }

    return res.json(question.answers);
}));

app.post('/questions/:questionId/answers', autoCatch(async(req, res) => {
  const { questionId } = req.params;
  const answer = await answerSchema.validateAsync(req.body);
  
  const newA = await req.repositories.questionRepo.addAnswer(questionId, answer);
  
  return res.json(newA);
}));

app.get('/questions/:questionId/answers/:answerId', autoCatch(async(req, res) => {
  const { questionId, answerId } = req.params;

  const answer = await req.repositories.questionRepo.getAnswer(questionId, answerId);

  if (!answer) {
    throw new CustomError(400, "Answer not found");
  }

  return res.json(answer);
}));

app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Responder app listening on port ${PORT}`);
});

module.exports = server;