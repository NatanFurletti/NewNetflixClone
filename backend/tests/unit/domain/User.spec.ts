// tests/unit/domain/User.spec.ts
/**
 * UNIT TEST: User Entity
 * Tests domain logic of User entity (no database, no external dependencies)
 */
import { User } from "@/domain/entities/User";
import { InvalidEmailError } from "@/domain/errors/DomainError";

describe("User Entity", () => {
  describe("createUser", () => {
    it("should create user with valid email and id", () => {
      // ARRANGE
      const userId = "user-123";
      const email = "user@example.com";
      const passwordHash = "hashed_password_bcrypt";

      // ACT
      const user = User.create(userId, email, passwordHash);

      // ASSERT
      expect(user.id).toBe(userId);
      expect(user.email).toBe(email);
      expect(user.passwordHash).toBe(passwordHash);
    });

    it("should set createdAt to current date on creation", () => {
      // ARRANGE
      const beforeCreation = new Date();

      // ACT
      const user = User.create("user-123", "user@example.com", "hash");

      // ASSERT
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(
        new Date().getTime(),
      );
    });

    it("should throw error if email is invalid", () => {
      // ARRANGE & ACT & ASSERT
      expect(() => {
        User.create("user-123", "invalid-email", "hash");
      }).toThrow(InvalidEmailError);
    });
  });

  describe("email validation", () => {
    it("should validate correct email format", () => {
      const validEmails = ["user@example.com", "test.user@domain.co.uk"];
      validEmails.forEach((email) => {
        expect(() => User.create("id", email, "hash")).not.toThrow();
      });
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = ["invalid", "user@", "@example.com", "user@.com"];
      invalidEmails.forEach((email) => {
        expect(() => User.create("id", email, "hash")).toThrow(
          InvalidEmailError,
        );
      });
    });
  });

  describe("password verification", () => {
    it("should never expose raw password", () => {
      const user = User.create("id", "user@example.com", "bcrypt_hash");
      expect(user.passwordHash).not.toBe("rawPassword");
      expect(user).not.toHaveProperty("password");
    });
  });
});
