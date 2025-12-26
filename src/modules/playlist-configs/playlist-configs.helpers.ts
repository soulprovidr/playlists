import { DayOfWeek, LocalDate } from "@js-joda/core";
import { BuildCadence, PlaylistConfig } from "./playlist-configs.types";

/**
 * Calculate the number of days between two days of the week
 * Using Sunday as the last day of the week (week ends on Sunday)
 * @param from - The starting day of the week
 * @param to - The ending day of the week
 * @returns The number of days from 'from' to 'to' (0-6)
 */
function daysBetween(from: DayOfWeek, to: DayOfWeek): number {
  // Convert DayOfWeek to numeric value where Sunday = 0, Monday = 1, etc.
  const fromValue = from.value() % 7; // Sunday becomes 0 instead of 7
  const toValue = to.value() % 7;

  // Calculate days forward
  let days = toValue - fromValue;
  if (days < 0) {
    days += 7;
  }

  return days;
}

/**
 * Check if a playlist config is overdue for a build based on its schedule
 * Using Sunday as the last day of the week
 *
 * @param config - The playlist configuration to check
 * @returns true if the playlist should have been built but wasn't, false otherwise
 */
export function getShouldBuildPlaylist(config: PlaylistConfig): boolean {
  // If cadence is not WEEKLY, it can't be overdue
  if (config.buildCadence !== BuildCadence.WEEKLY) {
    return false;
  }

  // If no build day is set, it can't be overdue
  if (!config.buildDay) {
    return false;
  }

  // If it has never been built, build it now.
  if (!config.lastBuiltDate) {
    return true;
  }

  try {
    const scheduledDay = config.buildDay as unknown as DayOfWeek;
    const lastBuiltDate = LocalDate.parse(config.lastBuiltDate);
    const today = LocalDate.now();

    // If last built today, definitely not overdue
    if (lastBuiltDate.equals(today)) {
      return false;
    }

    // Get the day of week for today
    const todayDayOfWeek = today.dayOfWeek();

    if (todayDayOfWeek == scheduledDay) {
      return true;
    }

    // If we're past the scheduled day and haven't built
    // in the current week (since the last scheduled day), it's overdue
    const daysSinceLastScheduledDay = daysBetween(scheduledDay, todayDayOfWeek);

    // If today is past the scheduled day (but not on the scheduled day)
    if (daysSinceLastScheduledDay > 0) {
      // Calculate the most recent scheduled day
      const mostRecentScheduledDay = today.minusDays(daysSinceLastScheduledDay);

      // If last build was before the most recent scheduled day, it's overdue
      if (lastBuiltDate.isBefore(mostRecentScheduledDay)) {
        return true;
      }
    }

    return false;
  } catch {
    // If there's any error parsing dates or days, return false
    return false;
  }
}

/**
 * Get all overdue playlist configs from a list of configs
 * @param configs - Array of playlist configurations to check
 * @returns Array of configs that are overdue for a build
 */
export function getOverduePlaylistConfigs(
  configs: PlaylistConfig[],
): PlaylistConfig[] {
  return configs.filter(getShouldBuildPlaylist);
}
