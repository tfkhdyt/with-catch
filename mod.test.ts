import assert from "node:assert";
import { describe, it } from "node:test";
import { withCatch, withCatchSync } from "./mod.ts";

class DivideZeroError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "DivideZeroError";
  }
}

class DivideZero2Error extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "DivideZero2Error";
  }
}

function divide(a: number, b: number) {
  if (b === 0) {
    throw new DivideZeroError();
  }

  return a / b;
}

describe("withCatchSync", () => {
  describe("catch all errors", () => {
    it("should return result", () => {
      const json = `{"hello": "world"}`;

      assert.doesNotThrow(() => {
        const [err, result] = withCatchSync(() => JSON.parse(json));

        assert.strictEqual(err, undefined);
        assert.deepStrictEqual(result, { hello: "world" });
      });
    });

    it("should return error", () => {
      const json = `hello world`;

      assert.doesNotThrow(() => {
        const [err, result] = withCatchSync(() => JSON.parse(json));

        assert.ok(err);
        assert.equal(result, undefined);
      });
    });
  });

  describe("catch specific error", () => {
    it("should return result", () => {
      assert.doesNotThrow(() => {
        const [err, result] = withCatchSync(
          () => divide(6, 9),
          [DivideZeroError]
        );

        assert.strictEqual(err, undefined);
        assert.equal(result, 0.6666666666666666);
      });
    });

    it("should return error", () => {
      assert.doesNotThrow(() => {
        const [err, result] = withCatchSync(
          () => divide(6, 0),
          [DivideZeroError]
        );

        assert.ok(err);
        assert.equal(result, undefined);
      });
    });

    it("should throw because unknown error", () => {
      assert.throws(() => {
        withCatchSync(() => divide(6, 0), [DivideZero2Error]);
      });
    });

    it("should not throw because success", () => {
      assert.doesNotThrow(() => {
        withCatchSync(() => divide(6, 9), [DivideZero2Error]);
      });
    });
  });
});

describe("withCatch", () => {
  describe("catch all errors", () => {
    it("should resolve promise", async () => {
      const [err, result] = await withCatch(Promise.resolve(6));

      assert.strictEqual(err, undefined);
      assert.equal(result, 6);
    });

    it("should reject promise", async () => {
      const expectedError = new Error("error");
      const [err, result] = await withCatch(Promise.reject(expectedError));

      assert.strictEqual(err, expectedError);
      assert.equal(result, undefined);
    });
  });

  describe("catch specific error", () => {
    it("should resolve promise", async () => {
      const [err, result] = await withCatch(Promise.resolve(divide(6, 9)), [
        DivideZeroError,
      ]);

      assert.strictEqual(err, undefined);
      assert.equal(result, 0.6666666666666666);
    });

    it("should catch specific error", async () => {
      const [err, result] = await withCatch(Promise.resolve(divide(6, 9)), [
        DivideZeroError,
      ]);

      assert.strictEqual(err, undefined);
      assert.equal(result, 0.6666666666666666);
    });

    it("should throw because unknown error", async () => {
      await assert.rejects(async () => {
        await withCatch(Promise.resolve(divide(6, 0)), [DivideZero2Error]);
      });
    });

    it("should not throw because success", async () => {
      await assert.doesNotReject(async () => {
        await withCatch(Promise.resolve(divide(6, 9)), [DivideZero2Error]);
      });
    });
  });
});
