const request = require('supertest');
const app = require('../src/app');

let token;

beforeEach(async () => {
  await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });

  token = res.body.data.token;
});

describe('URL — Create', () => {
  it('creates a short URL successfully', async () => {
    const res = await request(app)
      .post('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'https://www.google.com' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.shortCode).toBeDefined();
    expect(res.body.data.shortUrl).toContain('localhost');
  });

  it('creates a short URL with custom alias', async () => {
    const res = await request(app)
      .post('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'https://github.com', customAlias: 'mygithub' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.shortCode).toBe('mygithub');
  });

  it('returns 409 for duplicate custom alias', async () => {
    await request(app)
      .post('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'https://github.com', customAlias: 'mygithub' });

    const res = await request(app)
      .post('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'https://gitlab.com', customAlias: 'mygithub' });

    expect(res.statusCode).toBe(409);
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/urls')
      .send({ originalUrl: 'https://www.google.com' });

    expect(res.statusCode).toBe(401);
  });

  it('returns 400 for invalid URL', async () => {
    const res = await request(app)
      .post('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'not-a-url' });

    expect(res.statusCode).toBe(400);
  });
});

describe('URL — List and Get', () => {
  it('returns empty array when no URLs created', async () => {
    const res = await request(app)
      .get('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.urls).toHaveLength(0);
  });

  it('lists created URLs', async () => {
    await request(app)
      .post('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'https://www.google.com' });

    const res = await request(app)
      .get('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.urls).toHaveLength(1);
  });
});

describe('URL — Redirect', () => {
  it('redirects to original URL', async () => {
    await request(app)
      .post('/api/v1/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'https://www.google.com', customAlias: 'testlink' });

    const res = await request(app)
      .get('/testlink');

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('https://www.google.com');
  });

  it('returns 404 for unknown short code', async () => {
    const res = await request(app).get('/doesnotexist');
    expect(res.statusCode).toBe(404);
  });
});