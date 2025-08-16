import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  qk,
  type ExtractParamsFromID,
  type HasParams,
} from "../../src/query-keys";

// Extend RegisteredPaths for testing purposes
declare module "../../src/query-keys" {
  interface RegisteredPaths {
    users: never;
    "users/$userId": never;
    "users/$userId/posts": never;
    "users/$userId/posts/$postId": never;
    posts: never;
    "posts/$postId": never;
    "posts/$postId/comments": never;
    settings: never;
    "teams/$teamId/members/$memberId": never;
  }
}

describe("query-keys", () => {
  describe("qk function", () => {
    beforeEach(() => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    it("should create a simple query key with no parameters", () => {
      const result = qk("users");
      expect(result).toEqual(["users"]);
    });

    it("should create a query key with parameters", () => {
      const result = qk("users/$userId", { params: { userId: "123" } });
      expect(result).toEqual(["users", "123"]);
    });

    it("should create a nested query key with multiple parameters", () => {
      const result = qk("users/$userId/posts/$postId", {
        params: { userId: "123", postId: "456" },
      });
      expect(result).toEqual(["users", "123", "posts", "456"]);
    });

    it("should warn about missing parameters", () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const result = qk("users/$userId/posts", { params: {} as any });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Missing optional parameter: userId",
      );
      expect(result).toEqual(["users", "posts"]);
    });

    it("should handle numeric parameter values", () => {
      const result = qk("users/$userId", { params: { userId: 123 } });
      expect(result).toEqual(["users", 123]);
    });

    it("should handle boolean parameter values", () => {
      const result = qk("posts/$isPublished", {
        params: { isPublished: true },
      });
      expect(result).toEqual(["posts", true]);
    });

    it("should include search parameters as the last item", () => {
      const result = qk("users", {
        search: { sort: "name", order: "asc" },
      });
      expect(result).toEqual(["users", { sort: "name", order: "asc" }]);
    });

    it("should combine parameters and search", () => {
      const result = qk("users/$userId/posts", {
        params: { userId: "123" },
        search: { sort: "date", limit: 10 },
      });
      expect(result).toEqual([
        "users",
        "123",
        "posts",
        { sort: "date", limit: 10 },
      ]);
    });

    it("should handle empty path segments correctly", () => {
      const result = qk("users//posts");
      expect(result).toEqual(["users", "", "posts"]);
    });
  });

  describe("qk.use function", () => {
    it("should create a query key from a registered path", () => {
      const result = qk.use("users/$userId", { params: { userId: "123" } });
      expect(result).toEqual(["users", "123"]);
    });

    it("should create a nested query key with multiple parameters", () => {
      const result = qk.use("teams/$teamId/members/$memberId", {
        params: { teamId: "team1", memberId: "member2" },
      });
      expect(result).toEqual(["teams", "team1", "members", "member2"]);
    });

    it("should include search parameters", () => {
      const result = qk.use("posts", {
        search: { published: true, limit: 20 },
      });
      expect(result).toEqual(["posts", { published: true, limit: 20 }]);
    });
  });

  describe("ExtractParamsFromID type", () => {
    it("should extract parameters correctly", () => {
      type Test1 = ExtractParamsFromID<"users/$userId">;
      const test1: Test1 = { userId: "123" };
      expect(test1.userId).toBe("123");

      // This would fail TypeScript compilation if the type is incorrect
      // @ts-expect-error - Property 'invalid' does not exist
      const invalid1: Test1 = { invalid: "123" };
    });

    it("should extract multiple parameters", () => {
      type Test2 = ExtractParamsFromID<"users/$userId/posts/$postId">;
      const test2: Test2 = { userId: "123", postId: "456" };
      expect(test2.userId).toBe("123");
      expect(test2.postId).toBe("456");

      // These would fail TypeScript compilation
      // @ts-expect-error - Missing property 'postId'
      const invalid2a: Test2 = { userId: "123" };
      // @ts-expect-error - Missing property 'userId'
      const invalid2b: Test2 = { postId: "456" };
    });

    it("should handle empty parameters list", () => {
      type Test3 = ExtractParamsFromID<"settings">;
      // This should be an empty record
      const test3: Test3 = {};
      expect(Object.keys(test3).length).toBe(0);
    });
  });

  describe("HasParams type", () => {
    it("should identify paths with parameters", () => {
      type Test1 = HasParams<"users/$userId">;
      // This would fail if HasParams returned false
      const test1: Test1 = true;
      expect(test1).toBe(true);
    });

    it("should identify paths without parameters", () => {
      type Test2 = HasParams<"users">;
      // This would fail if HasParams returned true
      const test2: Test2 = false;
      expect(test2).toBe(false);
    });
  });
});
