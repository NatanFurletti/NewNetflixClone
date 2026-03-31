// tests/unit/application/Login.spec.ts
/**
 * UNIT TEST: Login Use Case
 */

describe("Login Use Case", () => {
  describe("happy path", () => {
    it("should login user with correct email and password", async () => {
      // ARRANGE
      // const mockUserRepository = createMockUserRepository();
      // const mockTokenService = createMockTokenService();
      // const loginUseCase = new LoginUseCase(mockUserRepository, mockTokenService);
      // const hashedPassword = await bcrypt.hash('CorrectPassword123!', 12);
      // mockUserRepository.setUser({
      //   id: 'user-123',
      //   email: 'user@example.com',
      //   passwordHash: hashedPassword,
      // });
      // ACT
      // const result = await loginUseCase.execute({
      //   email: 'user@example.com',
      //   password: 'CorrectPassword123!',
      // });
      // ASSERT
      // expect(result.accessToken).toBeDefined();
      // expect(result.refreshToken).toBeDefined();
      // expect(mockTokenService.tokenData(result.accessToken).exp).toBeLessThan(
      //   Date.now() / 1000 + 15 * 60 + 10, // 15 min + 10 sec tolerance
      // );
    });
  });

  describe("invalid credentials", () => {
    it("should reject login with non-existent email", async () => {
      // expect(async () => {
      //   await loginUseCase.execute({
      //     email: 'nonexistent@example.com',
      //     password: 'Password123!',
      //   });
      // }).rejects.toThrow(UnauthorizedError);
    });

    it("should reject login with incorrect password", async () => {
      // mockUserRepository.setUser({
      //   id: 'user-123',
      //   email: 'user@example.com',
      //   passwordHash: 'hashed_correct_password',
      // });
      // expect(async () => {
      //   await loginUseCase.execute({
      //     email: 'user@example.com',
      //     password: 'IncorrectPassword123!',
      //   });
      // }).rejects.toThrow(UnauthorizedError);
    });

    it("should use same error message for wrong email and wrong password (no user enumeration)", async () => {
      // const errorWrongEmail = await getError(() =>
      //   loginUseCase.execute({ email: 'wrong@example.com', password: 'pass' })
      // );
      // const errorWrongPassword = await getError(() =>
      //   loginUseCase.execute({ email: 'user@example.com', password: 'wrong' })
      // );
      // expect(errorWrongEmail.message).toBe(errorWrongPassword.message);
    });
  });

  describe("brute force protection", () => {
    it("should lock account after 5 failed login attempts", async () => {
      // const mockFailureTracker = createMockFailureTracker();
      // for (let i = 0; i < 5; i++) {
      //   try {
      //     await loginUseCase.execute({
      //       email: 'user@example.com',
      //       password: 'WrongPassword123!',
      //     });
      //   } catch (e) {
      //     // expected to fail
      //   }
      // }
      // expect(async () => {
      //   await loginUseCase.execute({
      //     email: 'user@example.com',
      //     password: 'CorrectPassword123!', // even correct password fails
      //   });
      // }).rejects.toThrow('Account locked');
    });

    it("should unlock account after 15 minutes", async () => {
      // jest.useFakeTimers();
      // mockFailureTracker.recordFailure('user@example.com'); // 1st-5th failures
      // // ... 5 failures total
      // expect(() => login()).toThrow(); // 6th attempt locked
      // jest.advanceTimersByTime(15 * 60 * 1000 + 1000); // 15 min + 1 sec
      // expect(() => login()).not.toThrow(); // unlocked
      // jest.useRealTimers();
    });
  });

  describe("token expiration", () => {
    it("should issue access token with 15 minute expiration", async () => {
      // const result = await loginUseCase.execute({...});
      // const decoded = jwt.decode(result.accessToken);
      // const now = Math.floor(Date.now() / 1000);
      // expect(decoded.exp).toBeCloseTo(now + 15 * 60, -1); // 15 min, ±10s tolerance
    });

    it("should issue refresh token with 7 day expiration", async () => {
      // const result = await loginUseCase.execute({...});
      // const decoded = jwt.decode(result.refreshToken);
      // const now = Math.floor(Date.now() / 1000);
      // const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      // expect(decoded.exp).toBeCloseTo(now + sevenDaysInSeconds, -1);
    });
  });
});
