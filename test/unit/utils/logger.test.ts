import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createLogger } from "../../../src/utils/logger";

describe("logger", () => {
  beforeEach(() => {
    // Mock console methods
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("createLogger", () => {
    it("should create a logger function", () => {
      const logger = createLogger(true, false);
      expect(typeof logger).toBe("function");
    });

    it("should log debug messages when verbose is true", () => {
      const logger = createLogger(true, false);
      logger("debug", "test message");
      expect(console.debug).toHaveBeenCalledWith("[] [DEBUG]", "test message");
    });

    it("should log info messages when verbose is true", () => {
      const logger = createLogger(true, false);
      logger("info", "test message");
      expect(console.info).toHaveBeenCalledWith("[] [INFO]", "test message");
    });

    it("should not log debug messages when verbose is false", () => {
      const logger = createLogger(false, false);
      logger("debug", "test message");
      expect(console.debug).not.toHaveBeenCalled();
    });

    it("should not log info messages when verbose is false", () => {
      const logger = createLogger(false, false);
      logger("info", "test message");
      expect(console.info).not.toHaveBeenCalled();
    });

    it("should log warn messages regardless of verbose setting", () => {
      const loggerVerbose = createLogger(true, false);
      const loggerNonVerbose = createLogger(false, false);

      loggerVerbose("warn", "test message");
      expect(console.warn).toHaveBeenCalledWith("[] [WARN]", "test message");

      vi.clearAllMocks();

      loggerNonVerbose("warn", "test message");
      expect(console.warn).toHaveBeenCalledWith("[] [WARN]", "test message");
    });

    it("should log error messages regardless of verbose setting", () => {
      const loggerVerbose = createLogger(true, false);
      const loggerNonVerbose = createLogger(false, false);

      loggerVerbose("error", "test message");
      expect(console.error).toHaveBeenCalledWith("[] [ERROR]", "test message");

      vi.clearAllMocks();

      loggerNonVerbose("error", "test message");
      expect(console.error).toHaveBeenCalledWith("[] [ERROR]", "test message");
    });

    it("should include timestamp when showTimestamp is true", () => {
      // Mock Date.toISOString to return a fixed timestamp
      const mockDate = new Date("2023-01-01T12:00:00Z");
      vi.spyOn(global, "Date").mockImplementation(() => mockDate);
      vi.spyOn(mockDate, "toISOString").mockReturnValue(
        "2023-01-01T12:00:00.000Z",
      );

      const logger = createLogger(true, true);
      logger("info", "test message");

      expect(console.info).toHaveBeenCalledWith(
        "[2023-01-01T12:00:00.000Z] [INFO]",
        "test message",
      );
    });

    it("should handle multiple message arguments", () => {
      const logger = createLogger(true, false);
      logger("info", "message 1", "message 2", { key: "value" });

      expect(console.info).toHaveBeenCalledWith(
        "[] [INFO]",
        "message 1",
        "message 2",
        { key: "value" },
      );
    });
  });
});
