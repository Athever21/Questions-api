const { makeQuestionRepository } = require('../repositories/question')

module.exports = fileName => async(req, res, next) => {
  const questionRepo = await makeQuestionRepository(fileName);
  req.repositories = { questionRepo }
  next()
}
