const request = require('supertest');
const app = require('../src/app');

describe('Auth — Register', () => {
  it('registers a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('returns 409 when email already registered', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('Email already registered');
  });

  it('returns 400 when validation fails', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: '', email: 'not-an-email', password: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('Auth — Login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('returns 401 with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('returns 401 with wrong email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.statusCode).toBe(401);
  });
});