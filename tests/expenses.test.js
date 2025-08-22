const request = require('supertest');
const express = require('express');
const expensesRouter = require('../routes/expenses');
const pool = require('../db/connect');

const app = express();
app.use(express.json());
app.use('/api/expenses', expensesRouter);

describe('Expenses API', () => {
  let createdId;

  // ✅ Test creating a new expense
  it('POST /api/expenses → should create a new expense', async () => {
    const response = await request(app).post('/api/expenses').send({
      status: 'submitted',
      user_id: 1,
      expense_type: 'Travel',
      description: 'Test Uber',
      amount: 50.75
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('expense_id');
    expect(response.body.amount).toBe('50.75');
    createdId = response.body.expense_id;
  });

  // ✅ Test fetching all expenses
  it('GET /api/expenses → should return list of expenses', async () => {
    const response = await request(app).get('/api/expenses');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // ✅ Test fetching one expense by ID
  it('GET /api/expenses/:id → should return a specific expense', async () => {
    const response = await request(app).get(`/api/expenses/${createdId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.expense_id).toBe(createdId);
  });

  // ✅ Test updating an expense
  it('PUT /api/expenses/:id → should update an expense', async () => {
    const response = await request(app).put(`/api/expenses/${createdId}`).send({
      status: 'approved',
      expense_type: 'Lodging',
      description: 'Updated Test',
      amount: 88.88
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('approved');
  });

  // ✅ Test deleting the expense
  it('DELETE /api/expenses/:id → should delete the expense', async () => {
    const response = await request(app).delete(`/api/expenses/${createdId}`);
    expect(response.statusCode).toBe(204);
  });
});

afterAll(async () => {
    const pool = require('../db/connect');
    await pool.end(); // closes the DB connection pool
  });
  
