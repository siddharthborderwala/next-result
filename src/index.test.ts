import { describe, it, expect } from "vitest";
import {
  Ok,
  Err,
  isOk,
  isErr,
  optionOk,
  optionErr,
  unwrap,
  unwrapOrDefault,
  unwrapPromise,
  unwrapPromiseOrDefault,
  type Result,
  type Option,
  type Err as ErrType,
} from "./index";

describe("Result Type", () => {
  // Type tests using TypeScript type assertions
  it("should have correct type inference", () => {
    const ok: Result<number> = Ok(42);
    const err: Result<string> = Err("error");

    // @ts-expect-error - Cannot assign string to number
    const invalidOk: Result<number> = Ok("42");

    // Type narrowing should work with type guards
    if (isOk(ok)) {
      const value: number = ok.value;
      // @ts-expect-error - Cannot access error on Ok type
      const error = ok.error;
    }

    if (isErr(err)) {
      const error: string = err.error;
      // @ts-expect-error - Cannot access value on Err type
      const value = err.value;
    }
  });

  describe("Ok", () => {
    it("should create a successful result", () => {
      const result = Ok(42);
      expect(result).toEqual({ ok: true, value: 42 });
    });

    it("should work with different types", () => {
      expect(Ok("string")).toEqual({ ok: true, value: "string" });
      expect(Ok({ foo: "bar" })).toEqual({ ok: true, value: { foo: "bar" } });
      expect(Ok([1, 2, 3])).toEqual({ ok: true, value: [1, 2, 3] });
    });
  });

  describe("Err", () => {
    it("should create an error result", () => {
      const result = Err("error message");
      expect(result).toEqual({ ok: false, error: "error message" });
    });

    it("should include an error code when provided", () => {
      const result = Err("error message", "NOT_FOUND");
      expect(result).toEqual({ ok: false, error: "error message", code: "NOT_FOUND" });
    });

    it("should have undefined code when not provided", () => {
      const result = Err("error message");
      expect(result.code).toBeUndefined();
    });
  });

  describe("Type Guards", () => {
    describe("isOk", () => {
      it("should return true for Ok results", () => {
        expect(isOk(Ok(42))).toBe(true);
      });

      it("should return false for Err results", () => {
        expect(isOk(Err("error"))).toBe(false);
      });
    });

    describe("Error with code", () => {
      it("should correctly type-narrow to access the code property", () => {
        const result = Err("Permission denied", "FORBIDDEN");
        
        if (isErr(result)) {
          // If type narrowing works, we can access the code property
          const errorCode: string | undefined = result.code;
          expect(errorCode).toBe("FORBIDDEN");
        } else {
          // This should never execute
          expect(true).toBe(false);
        }
      });
    });

    describe("isErr", () => {
      it("should return true for Err results", () => {
        expect(isErr(Err("error"))).toBe(true);
      });

      it("should return false for Ok results", () => {
        expect(isErr(Ok(42))).toBe(false);
      });
    });
  });

  describe("Value Extractors", () => {
    describe("optionOk", () => {
      it("should return value for Ok results", () => {
        const result: Option<number> = optionOk(Ok(42));
        expect(result).toBe(42);
      });

      it("should return null for Err results", () => {
        const result: Option<number> = optionOk(Err("error"));
        expect(result).toBeNull();
      });
    });

    describe("optionErr", () => {
      it("should return error message for Err results", () => {
        const result: Option<string> = optionErr(Err("error"));
        expect(result).toBe("error");
      });

      it("should return null for Ok results", () => {
        const result: Option<string> = optionErr(Ok(42));
        expect(result).toBeNull();
      });
    });

    describe("unwrap", () => {
      it("should return value for Ok results", () => {
        expect(unwrap(Ok(42))).toBe(42);
      });

      it("should throw error for Err results", () => {
        expect(() => unwrap(Err("error"))).toThrow("error");
      });
    });

    describe("unwrapOrDefault", () => {
      it("should return value for Ok results", () => {
        expect(unwrapOrDefault(Ok(42), 0)).toBe(42);
      });

      it("should return default value for Err results", () => {
        expect(unwrapOrDefault(Err("error"), 0)).toBe(0);
      });
    });
  });

  describe("Async Utilities", () => {
    describe("unwrapPromise", () => {
      it("should unwrap Ok promise results", async () => {
        const promise = Promise.resolve(Ok(42));
        const result = await unwrapPromise(promise);
        expect(result).toBe(42);
      });

      it("should unwrap Ok promise function results", async () => {
        const fn = async () => Ok(42);
        const result = await unwrapPromise(fn);
        expect(result).toBe(42);
      });

      it("should throw for Err promise results", async () => {
        const promise = Promise.resolve(Err("error"));
        await expect(unwrapPromise(promise)).rejects.toThrow("error");
      });

      it("should throw for Err promise function results", async () => {
        const fn = async () => Err("error");
        await expect(unwrapPromise(fn)).rejects.toThrow("error");
      });
    });

    describe("unwrapPromiseOrDefault", () => {
      it("should unwrap Ok promise results", async () => {
        const promise = Promise.resolve(Ok(42));
        const result = await unwrapPromiseOrDefault(promise, 0);
        expect(result).toBe(42);
      });

      it("should unwrap Ok promise function results", async () => {
        const fn = async () => Ok(42);
        const result = await unwrapPromiseOrDefault(fn, 0);
        expect(result).toBe(42);
      });

      it("should return default for Err promise results", async () => {
        const promise = Promise.resolve(Err("error"));
        const result = await unwrapPromiseOrDefault(promise, 0);
        expect(result).toBe(0);
      });

      it("should return default for Err promise function results", async () => {
        const fn = async () => Err("error");
        const result = await unwrapPromiseOrDefault(fn, 0);
        expect(result).toBe(0);
      });
    });
  });

  // Real-world usage examples
  describe("Usage Examples", () => {
    it("should handle division example", () => {
      function divide(a: number, b: number): Result<number> {
        if (b === 0) {
          return Err("Cannot divide by zero", "DIVISION_BY_ZERO");
        }
        return Ok(a / b);
      }

      expect(unwrap(divide(10, 2))).toBe(5);
      expect(() => unwrap(divide(10, 0))).toThrow("Cannot divide by zero");
      
      const errorResult = divide(10, 0);
      if (isErr(errorResult)) {
        expect(errorResult.code).toBe("DIVISION_BY_ZERO");
      }
    });

    it("should handle async operations", async () => {
      async function fetchUser(
        id: string
      ): Promise<Result<{ id: string; name: string }>> {
        if (id === "1") {
          return Ok({ id: "1", name: "John" });
        }
        return Err("User not found", "USER_NOT_FOUND");
      }

      const user = await unwrapPromiseOrDefault(fetchUser("1"), {
        id: "0",
        name: "Anonymous",
      });
      expect(user).toEqual({ id: "1", name: "John" });

      const defaultUser = await unwrapPromiseOrDefault(fetchUser("999"), {
        id: "0",
        name: "Anonymous",
      });
      expect(defaultUser).toEqual({ id: "0", name: "Anonymous" });
      
      // Test error code in async context
      const errorResult = await fetchUser("999");
      if (isErr(errorResult)) {
        expect(errorResult.code).toBe("USER_NOT_FOUND");
      }
    });
  });
});
