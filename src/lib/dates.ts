import {
  DateTimeFormatter,
  LocalDateTime,
  ZonedDateTime,
  ZoneId,
} from "@js-joda/core";
import "@js-joda/locale_en";
import { Locale } from "@js-joda/locale_en";
import "@js-joda/timezone";

const DATE_TIME_PATTERN = DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm:ss");

export function formatZonedDateTime(
  zonedDateTime: ZonedDateTime,
  pattern: string,
): string {
  if (!zonedDateTime) {
    return "";
  }
  return zonedDateTime.format(
    DateTimeFormatter.ofPattern(pattern).withLocale(Locale.ENGLISH),
  );
}

export function getZonedDateTimeFromDatabaseTimestamp(
  timestamp: string | undefined,
): ZonedDateTime | null {
  try {
    return timestamp
      ? LocalDateTime.parse(timestamp, DATE_TIME_PATTERN).atZone(ZoneId.UTC)
      : null;
  } catch (e) {
    console.error(e);
    return null;
  }
}
