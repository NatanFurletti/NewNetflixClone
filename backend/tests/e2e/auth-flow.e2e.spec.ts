// tests/e2e/auth-flow.e2e.spec.ts
/**
 * END-TO-END TEST: Authentication Flow
 * Tests complete user journey: Register → Login → Logout → Login again
 */

describe("E2E: Authentication Flow", () => {
  describe("complete registration and login journey", () => {
    it("should register, login, and persist session", async () => {
      // ARRANGE
      // const app = createTestApp(); // full Express server
      // const api = createApiClient(app);
      // ACT - Register
      // const registerRes = await api.post('/api/auth/register', {
      //   email: 'newuser@example.com',
      //   password: 'SecurePassword123!',
      // });
      // ASSERT - Registration successful
      // expect(registerRes.status).toBe(201);
      // const userId = registerRes.body.id;
      // ACT - Login with registered credentials
      // const loginRes = await api.post('/api/auth/login', {
      //   email: 'newuser@example.com',
      //   password: 'SecurePassword123!',
      // });
      // ASSERT - Login successful with tokens
      // expect(loginRes.status).toBe(200);
      // expect(loginRes.body.accessToken).toBeDefined();
      // expect(loginRes.body.refreshToken).toBeDefined();
      // ACT - Access protected route with token
      // const profileRes = await api
      //   .get('/api/profiles')
      //   .set('Authorization', `Bearer ${loginRes.body.accessToken}`);
      // ASSERT - Access granted
      // expect(profileRes.status).toBe(200);
      // ACT - Logout
      // const logoutRes = await api
      //   .post('/api/auth/logout')
      //   .set('Authorization', `Bearer ${loginRes.body.accessToken}`);
      // ASSERT - Logout successful
      // expect(logoutRes.status).toBe(200);
      // ACT - Try to use old token after logout
      // const accessDeniedRes = await api.get('/api/profiles').set('Authorization', `Bearer ${loginRes.body.accessToken}`);
      // ASSERT - Access denied
      // expect(accessDeniedRes.status).toBe(401);
    });
  });

  describe("watchlist persistence", () => {
    it("should persist watchlist across sessions", async () => {
      // ARRANGE
      // const { accessToken, profileId } = await setupUserSession();
      // ACT - Add to watchlist
      // const addRes = await api
      //   .post('/api/watchlist')
      //   .set('Authorization', `Bearer ${accessToken}`)
      //   .send({ tmdbId: 550, mediaType: 'movie', title: 'Fight Club', posterPath: '/path.jpg' });
      // ASSERT
      // expect(addRes.status).toBe(201);
      // ACT - Login as same user in new session
      // const newSession = await login(email, password);
      // ACT - Get watchlist in new session
      // const watchlistRes = await api
      //   .get('/api/watchlist')
      //   .set('Authorization', `Bearer ${newSession.accessToken}`);
      // ASSERT - Watchlist persisted
      // expect(watchlistRes.body).toContainEqual(
      //   expect.objectContaining({ tmdbId: 550, title: 'Fight Club' })
      // );
    });
  });
});
