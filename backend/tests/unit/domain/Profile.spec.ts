// tests/unit/domain/Profile.spec.ts
/**
 * UNIT TEST: Profile Entity
 */
import { Profile } from "@/domain/entities/Profile";

describe("Profile Entity", () => {
  describe("createProfile", () => {
    it("should create profile with name and userId", () => {
      // ARRANGE
      const profileId = "profile-123";
      const userId = "user-123";
      const name = "My Profile";

      // ACT
      const profile = Profile.create(profileId, userId, name);

      // ASSERT
      expect(profile.id).toBe(profileId);
      expect(profile.userId).toBe(userId);
      expect(profile.name).toBe(name);
    });

    it("should require name to have 3-20 characters", () => {
      expect(() => Profile.create("id", "u1", "ab")).toThrow();
      expect(() => Profile.create("id", "u1", "a".repeat(21))).toThrow();
      expect(() => Profile.create("id", "u1", "Valid")).not.toThrow();
    });

    it("should have isKids property set to false by default", () => {
      const profile = Profile.create("id", "u1", "Profile");
      expect(profile.isKids).toBe(false);
    });

    it("should allow setting isKids to true", () => {
      const profile = Profile.create("id", "u1", "Kids Profile", {
        isKids: true,
      });
      expect(profile.isKids).toBe(true);
    });
  });

  describe("avatar management", () => {
    it("should allow optional avatar URL", () => {
      const profileNoAvatar = Profile.create("id", "u1", "Profile");
      expect(profileNoAvatar.avatarUrl).toBeUndefined();
      const profileWithAvatar = Profile.create("id", "u1", "Profile", {
        avatarUrl: "https://example.com/avatar.jpg",
      });
      expect(profileWithAvatar.avatarUrl).toBe(
        "https://example.com/avatar.jpg",
      );
    });
  });
});
