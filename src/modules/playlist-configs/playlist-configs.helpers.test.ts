import { LocalDate } from "@js-joda/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getShouldBuildPlaylist } from "./playlist-configs.helpers";
import {
  BuildCadence,
  BuildStatus,
  EntityType,
  PlaylistConfig,
} from "./playlist-configs.types";

function createMockConfig(
  overrides: Partial<PlaylistConfig> = {},
): PlaylistConfig {
  return {
    id: 1,
    name: "Test Playlist",
    spotifyPlaylistId: "spotify123",
    buildStatus: BuildStatus.UNSTARTED,
    buildCadence: BuildCadence.WEEKLY,
    buildDay: "MONDAY",
    lastBuiltDate: null,
    entityType: EntityType.TRACKS,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("getShouldBuildPlaylist", () => {
  beforeEach(() => {
    // Mock LocalDate.now() to return a consistent date for testing
    // Using Wednesday, January 10, 2024
    vi.spyOn(LocalDate, "now").mockReturnValue(
      LocalDate.of(2024, 1, 10), // Wednesday
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("cadence checks", () => {
    it("should return false when build cadence is NONE", () => {
      const config = createMockConfig({
        buildCadence: BuildCadence.NONE,
      });

      expect(getShouldBuildPlaylist(config)).toBe(false);
    });

    it("should continue evaluation when build cadence is WEEKLY", () => {
      const config = createMockConfig({
        buildCadence: BuildCadence.WEEKLY,
        buildDay: "WEDNESDAY",
        lastBuiltDate: null,
      });

      // Should return true because it's never been built
      expect(getShouldBuildPlaylist(config)).toBe(true);
    });
  });

  describe("build day checks", () => {
    it("should return false when buildDay is null", () => {
      const config = createMockConfig({
        buildDay: null,
      });

      expect(getShouldBuildPlaylist(config)).toBe(false);
    });

    it("should return false when buildDay is undefined", () => {
      const config = createMockConfig({
        buildDay: undefined as unknown as string | null,
      });

      expect(getShouldBuildPlaylist(config)).toBe(false);
    });
  });

  describe("never built scenarios", () => {
    it("should return true when lastBuiltDate is null", () => {
      const config = createMockConfig({
        lastBuiltDate: null,
      });

      expect(getShouldBuildPlaylist(config)).toBe(true);
    });
  });

  describe("built today scenarios", () => {
    it("should return false when built today", () => {
      const config = createMockConfig({
        buildDay: "MONDAY",
        lastBuiltDate: "2024-01-10", // Same as mocked "today"
      });

      expect(getShouldBuildPlaylist(config)).toBe(false);
    });
  });

  describe("scheduled day scenarios", () => {
    it("should return true when today is the scheduled day and not built today", () => {
      const config = createMockConfig({
        buildDay: "WEDNESDAY", // Today is Wednesday
        lastBuiltDate: "2024-01-03", // Last Wednesday
      });

      expect(getShouldBuildPlaylist(config)).toBe(true);
    });

    it("should return false when today is the scheduled day but already built today", () => {
      const config = createMockConfig({
        buildDay: "WEDNESDAY",
        lastBuiltDate: "2024-01-10", // Built today
      });

      expect(getShouldBuildPlaylist(config)).toBe(false);
    });
  });

  describe("overdue scenarios", () => {
    it("should return true when past scheduled day and last build was before most recent scheduled day", () => {
      // Today is Wednesday (Jan 10), scheduled day is Monday
      // Last built on Friday Jan 5 (before Monday Jan 8)
      const config = createMockConfig({
        buildDay: "MONDAY",
        lastBuiltDate: "2024-01-05", // Friday before the Monday
      });

      expect(getShouldBuildPlaylist(config)).toBe(true);
    });

    it("should return false when past scheduled day but was built on or after most recent scheduled day", () => {
      // Today is Wednesday (Jan 10), scheduled day is Monday
      // Last built on Monday Jan 8 (the scheduled day)
      const config = createMockConfig({
        buildDay: "MONDAY",
        lastBuiltDate: "2024-01-08", // Monday (the scheduled day)
      });

      expect(getShouldBuildPlaylist(config)).toBe(false);
    });

    it("should return false when past scheduled day but was built after most recent scheduled day", () => {
      // Today is Wednesday (Jan 10), scheduled day is Monday
      // Last built on Tuesday Jan 9 (after the Monday)
      const config = createMockConfig({
        buildDay: "MONDAY",
        lastBuiltDate: "2024-01-09", // Tuesday after the Monday
      });

      expect(getShouldBuildPlaylist(config)).toBe(false);
    });
  });

  describe("not yet due scenarios", () => {
    it("should return false when scheduled day is later in the week", () => {
      // Today is Wednesday (Jan 10), scheduled day is Friday
      // Last built last Friday (Jan 5)
      const config = createMockConfig({
        buildDay: "FRIDAY",
        lastBuiltDate: "2024-01-05",
      });

      expect(getShouldBuildPlaylist(config)).toBe(false);
    });

    it("should return false when scheduled day is tomorrow", () => {
      // Today is Wednesday (Jan 10), scheduled day is Thursday
      const config = createMockConfig({
        buildDay: "THURSDAY",
        lastBuiltDate: "2024-01-04", // Last Thursday
      });

      expect(getShouldBuildPlaylist(config)).toBe(false);
    });
  });

  describe("Sunday edge cases", () => {
    beforeEach(() => {
      // Mock to Sunday, January 14, 2024
      vi.spyOn(LocalDate, "now").mockReturnValue(LocalDate.of(2024, 1, 14));
    });

    it("should return true when today is Sunday and scheduled for Sunday, not built yet this week", () => {
      const config = createMockConfig({
        buildDay: "SUNDAY",
        lastBuiltDate: "2024-01-07", // Last Sunday
      });

      expect(getShouldBuildPlaylist(config)).toBe(true);
    });

    it("should return false when today is Sunday and already built today", () => {
      const config = createMockConfig({
        buildDay: "SUNDAY",
        lastBuiltDate: "2024-01-14", // Built today
      });

      expect(getShouldBuildPlaylist(config)).toBe(false);
    });

    it("should return true when today is Sunday and was scheduled for Monday (overdue)", () => {
      // Today is Sunday Jan 14, scheduled for Monday
      // Last built on Sunday Jan 7 (before Monday Jan 8)
      const config = createMockConfig({
        buildDay: "MONDAY",
        lastBuiltDate: "2024-01-07",
      });

      expect(getShouldBuildPlaylist(config)).toBe(true);
    });
  });

  describe("Monday edge cases", () => {
    beforeEach(() => {
      // Mock to Monday, January 15, 2024
      vi.spyOn(LocalDate, "now").mockReturnValue(LocalDate.of(2024, 1, 15));
    });

    it("should return true when today is Monday and scheduled for Monday, not built yet", () => {
      const config = createMockConfig({
        buildDay: "MONDAY",
        lastBuiltDate: "2024-01-08", // Last Monday
      });

      expect(getShouldBuildPlaylist(config)).toBe(true);
    });

    it("should return true when today is Monday and scheduled for Sunday (overdue by 1 day)", () => {
      // Today is Monday Jan 15, scheduled for Sunday
      // Last built on Saturday Jan 13 (before Sunday Jan 14)
      const config = createMockConfig({
        buildDay: "SUNDAY",
        lastBuiltDate: "2024-01-07", // Previous Sunday
      });

      expect(getShouldBuildPlaylist(config)).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should return false when lastBuiltDate is invalid", () => {
      const config = createMockConfig({
        lastBuiltDate: "invalid-date",
      });

      expect(getShouldBuildPlaylist(config)).toBe(false);
    });

    it("should return true when lastBuiltDate is an empty string (treated as never built)", () => {
      const config = createMockConfig({
        lastBuiltDate: "",
      });

      // Empty string is falsy, so it's treated as "never built"
      expect(getShouldBuildPlaylist(config)).toBe(true);
    });
  });

  describe("week boundary scenarios", () => {
    it("should correctly handle Saturday to Monday transition", () => {
      // Mock to Monday January 15, 2024
      vi.spyOn(LocalDate, "now").mockReturnValue(LocalDate.of(2024, 1, 15));

      const config = createMockConfig({
        buildDay: "SATURDAY",
        lastBuiltDate: "2024-01-06", // Saturday of previous week
      });

      // Saturday Jan 13 has passed, last build was Jan 6 (before Jan 13)
      expect(getShouldBuildPlaylist(config)).toBe(true);
    });

    it("should not flag as overdue when built on the expected day of the current week", () => {
      // Mock to Monday January 15, 2024
      vi.spyOn(LocalDate, "now").mockReturnValue(LocalDate.of(2024, 1, 15));

      const config = createMockConfig({
        buildDay: "SATURDAY",
        lastBuiltDate: "2024-01-13", // Saturday of current week
      });

      expect(getShouldBuildPlaylist(config)).toBe(false);
    });
  });
});
