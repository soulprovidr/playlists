import {
  DateTimeFormatter,
  Instant,
  LocalDateTime,
  ZonedDateTime,
  ZoneId,
} from "@js-joda/core";

const DATE_TIME_PATTERN = DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm:ss");

export const getDatabaseTimestampFromInstant = (
  instant: Instant | undefined,
) => {
  const zonedDateTime = (instant ? instant : Instant.now()).atZone(ZoneId.UTC);
  return zonedDateTime.format(DATE_TIME_PATTERN);
};

// Parses in timezone of local machine for now.
export const getZonedDateTimeFromDatabaseTimestamp = (
  timestamp: string | undefined,
): ZonedDateTime | null => {
  return timestamp
    ? LocalDateTime.parse(timestamp, DATE_TIME_PATTERN).atZone(ZoneId.SYSTEM)
    : null;
};
