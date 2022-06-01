const { writeFile, rm } = require('fs/promises');
const { faker } = require('@faker-js/faker');
const { makeQuestionRepository } = require('./question');

describe('question repository', () => {
  const TEST_QUESTIONS_FILE_PATH = 'test-questions.json';
  let questionRepo;

  const reloadQuestions = async (qustions, init = false) => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(qustions));
    if (!init) {
      await questionRepo.reFetch();
    }
  };

  beforeAll(async () => {
    await reloadQuestions([], true);
    questionRepo = await makeQuestionRepository(TEST_QUESTIONS_FILE_PATH);
  });

  afterAll(async () => {
    await rm(TEST_QUESTIONS_FILE_PATH);
  });

  test('should return a list of 0 questions', async () => {
    expect(await questionRepo.getQuestions()).toHaveLength(0);
  });

  test('should return a list of 2 questions', async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: 'What is my name?',
        author: 'Jack London',
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: 'Who are you?',
        author: 'Tim Doods',
        answers: []
      }
    ];

    await reloadQuestions(testQuestions);

    expect(await questionRepo.getQuestions()).toHaveLength(2);
  });

  describe('getQuestionById method', () => {
    const id = faker.datatype.uuid();

    beforeAll(async () => {
      const testQuestions = [
        {
          id,
          summary: 'What is my name?',
          author: 'Jack London',
          answers: []
        },
        {
          id: faker.datatype.uuid(),
          summary: 'Who are you?',
          author: 'Tim Doods',
          answers: []
        }
      ];

      await reloadQuestions(testQuestions);
    });

    test('should return question', async () => {
      const question = await questionRepo.getQuestionById(id);
      expect(question.id).toEqual(id);
    });

    test('should return null if question not present', async () => {
      const question = await questionRepo.getQuestionById('test');
      expect(question).toBeNull();
    });
  });

  describe('addQuestion method', () => {
    const question = {
      author: 'Test',
      summary: 'test'
    };

    test('should add question', async () => {
      const newQuestion = await questionRepo.addQuestion(question);
      let finded = (await questionRepo.getQuestions()).find(
        x => x.id === newQuestion.id
      );
      expect(finded.id).toEqual(newQuestion.id);
      await questionRepo.reFetch();
      finded = (await questionRepo.getQuestions()).find(
        x => x.id === newQuestion.id
      );
      expect(finded.id).toEqual(newQuestion.id);
    });
  });

  describe('getAnswers method', () => {
    const id = faker.datatype.uuid();

    beforeAll(async () => {
      const testQuestions = [
        {
          id,
          summary: 'What is my name?',
          author: 'Jack London',
          answers: [
            {
              id: faker.datatype.uuid(),
              summary: 'test?',
              author: 'Jack London'
            }
          ]
        }
      ];

      await reloadQuestions(testQuestions);
    });

    test('should return answers', async () => {
      const answers = await questionRepo.getAnswers(id);
      expect(answers).toHaveLength(1);
      expect(answers[0].summary).toEqual('test?');
    });

    test('should return null if question not present', async () => {
      const answers = await questionRepo.getAnswers('test');
      expect(answers).toBeNull();
    });
  });

  describe('getAnswer method', () => {
    const questionId = faker.datatype.uuid();
    const answerId = faker.datatype.uuid();

    beforeAll(async () => {
      const testQuestions = [
        {
          id: questionId,
          summary: 'What is my name?',
          author: 'Jack London',
          answers: [
            {
              id: answerId,
              summary: 'test?',
              author: 'Jack London'
            }
          ]
        }
      ];

      await reloadQuestions(testQuestions);
    });

    test('should return answer', async () => {
      const answer = await questionRepo.getAnswer(questionId, answerId);
      expect(answer.id).toEqual(answerId);
    });

    test('should return null if answer not present', async () => {
      const answer = await questionRepo.getAnswer(questionId, 'test');
      expect(answer).toBeNull();
    });

    describe('exceptions', () => {
      test('should throw if question not present', async () => {
        await expect(
          questionRepo.getAnswer('test', answerId)
        ).rejects.toThrow();
      });
    });
  });

  describe('addAnswer method', () => {
    const questionId = faker.datatype.uuid();

    const answer = {
      summary: 'test?',
      author: 'test'
    };

    beforeAll(async () => {
      const testQuestions = [
        {
          id: questionId,
          summary: 'What is my name?',
          author: 'Jack London',
          answers: []
        }
      ];

      await reloadQuestions(testQuestions);
    });

    test('should save answer', async () => {
      const newAnswer = await questionRepo.addAnswer(questionId, answer);
      expect(newAnswer).toHaveProperty('id');
      let finded = await questionRepo.getAnswer(questionId, newAnswer.id);
      expect(finded).toBeTruthy();
      await questionRepo.reFetch();
      findend = await questionRepo.getAnswer(questionId, newAnswer.id);
      expect(finded).toBeTruthy();
    });

    describe('exceptions', () => {
      test('should throw if question not present', async () => {
        await expect(questionRepo.addAnswer('test', answer)).rejects.toThrow();
      });
    });
  });
});
