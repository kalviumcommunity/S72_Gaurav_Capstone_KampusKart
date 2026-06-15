const express = require('express');
const request = require('supertest');
const { sanitizeInput, validateComplaint } = require('../../middleware/validation');

describe('complaint validation', () => {
  it('accepts complaint titles with 3 characters', async () => {
    const app = express();
    app.use(express.json());
    app.post('/', sanitizeInput, validateComplaint, (req, res) => {
      res.status(201).json({ ok: true });
    });

    const response = await request(app)
      .post('/')
      .send({
        title: 'noo',
        description: 'This complaint description is long enough to pass validation.',
        category: 'Academic',
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ ok: true });
  });
});
