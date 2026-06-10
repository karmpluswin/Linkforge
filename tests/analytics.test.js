const request = require('supertest');
const app = require('../src/app');

let token;
let shortCode;

beforeEach(async () => {
  await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });

  token = loginRes.body.data.token;

  const urlRes = await request(app)
    .post('/api/v1/urls')
    .set('Authorization', `Bearer ${token}`)
    .send({ originalUrl: 'https://www.google.com', customAlias: 'analyticstest' });

  shortCode = urlRes.body.data.shortCode;
});

describe('Analytics — Summary', () => {
  it('returns summary with zero clicks initially', async () => {
    const res = await request(app)
      .get(`/api/v1/analytics/${shortCode}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalClicks).toBe(0);
    expect(res.body.data.dailyClicks).toBeDefined();
  });

  it('returns 404 for unknown short code', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/doesnotexist')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});

describe('Analytics — Click Log', () => {
  it('returns paginated click log', async () => {
    const res = await request(app)
      .get(`/api/v1/analytics/${shortCode}/clicks?page=1&limit=10`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.clicks).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(10);
  });
});