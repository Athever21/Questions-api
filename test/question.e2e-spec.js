const STORAGE_FILE_PATH = 'test.json';

process.env.STORAGE_FILE_PATH = STORAGE_FILE_PATH;

const supertest = require('supertest');
const server = require('../index');
const { faker } = require('@faker-js/faker');
const { writeFile, rm } = require('fs/promises');

describe('Question (e2e)', () => {
  const api = supertest(server);
  const questionId = faker.datatype.uuid();
  const answerId = faker.datatype.uuid();

  const testQuestions = [
    {
      id: questionId,
      summary: 'What is my name?',
      author: 'Jack London',
      answers: [
        {
          id: answerId,
          author: 'test',
          summary: 'test'
        }
      ]
    },
    {
      id: faker.datatype.uuid(),
      summary: 'Who are you?',
      author: 'Tim Doods',
      answers: []
    }
  ];

  beforeAll(async () => {
    await writeFile(STORAGE_FILE_PATH, JSON.stringify(testQuestions));
  });

  afterAll(done => {
    rm(STORAGE_FILE_PATH);
    server.close(done);
  });

  describe('/questions GET', () => {
    test('should return questions', async () => {
      const res = await api.get('/questions');

      expect(res.body).toEqual(testQuestions);
    });
  });

  describe('/questions/:questionId GET', () => {
    test('should return question', async () => {
      const res = await api.get(`/questions/${questionId}`);

      expect(res.body.id).toEqual(questionId);
    });

    test('should return question', async () => {
      const res = await api.get('/questions/test');

      expect(res.body.error).toEqual('Question not found');
    });
  });

  describe('/questions POST', () => {
    const question = {
      author: 'test',
      summary: 'test'
    };

    test('should add question', async () => {
      const res = await api.post('/questions').send(question);

      expect(res.body.id).toBeDefined();

      const res1 = await api.get('/questions');

      const finded = res1.body.findIndex(x => x.id === res.body.id);
      expect(finded).not.toEqual(-1);
    });

    describe('exceptions', () => {
      test('should fail if author not send', async () => {
        const res = await api.post('/questions').send({ summary: 'a' });

        expect(res.body.error).toEqual('"author" is required');
      });

      test('should fail if summart not send', async () => {
        const res = await api.post('/questions').send({ author: 'a' });

        expect(res.body.error).toEqual('"summary" is required');
      });
    });
  });

  describe('/questions/:questionId/answers GET', () => {
    test('should return answers', async () => {
      const res = await api.get(`/questions/${questionId}/answers`);

      expect(res.body).toHaveLength(1);
    });

    describe('exceptions', () => {
      test("should fail if question doesn't exists", async () => {
        const res = await api.get('/questions/test/answers');
        expect(res.body.error).toEqual('Question not found');
      });
    });
  });

  describe('/questions/:questionId/answers POST', () => {
    const answer = {
      author: 'test',
      summary: 'test'
    };

    test('should add answer', async () => {
      const res = await api
        .post(`/questions/${questionId}/answers`)
        .send(answer);

      expect(res.body.id).toBeDefined();

      const res1 = await api.get('/questions');

      const q = res1.body.find(x => x.id === questionId);

      const index = q.answers.findIndex(x => x.id === res.body.id);
      expect(index).not.toEqual(-1);
    });

    describe('exceptions', () => {
      test("should fail if question doesn't exists", async () => {
        const res = await api.post('/questions/test/answers').send(answer);
        expect(res.body.error).toEqual("Question doesn't exists");
      });

      test('should fail if author not provided', async () => {
        const res = await api
          .post(`/questions/${questionId}/answers`)
          .send({ summary: 'b' });
        expect(res.body.error).toEqual('"author" is required');
      });

      test('should fail if summary not provided', async () => {
        const res = await api
          .post(`/questions/${questionId}/answers`)
          .send({ author: 'b' });
        expect(res.body.error).toEqual('"summary" is required');
      });
    });
  });

  describe('/questions/:questionId/answers/:answerId GET', () => {
    test('should return answer', async () => {
      const res = await api.get(`/questions/${questionId}/answers/${answerId}`);
      expect(res.body.id).toEqual(answerId);
    });

    describe('exceptions', () => {
      test("should fail if question doesn't exists", async () => {
        const res = await api.get(`/questions/test/answers/${answerId}`);
        expect(res.body.error).toEqual("Question doesn't exists");
      });

      test("should fail if answer doesn't exists", async () => {
        const res = await api.get(`/questions/${questionId}/answers/invalid`);
        expect(res.body.error).toEqual('Answer not found');
      });
    });
  });
});
