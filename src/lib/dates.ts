import { DateTimeFormatter, ZonedDateTime } from "@js-joda/core";
import "@js-joda/locale_en";
import { Locale } from "@js-joda/locale_en";
import "@js-joda/timezone";

export const formatZonedDateTime = (
  zonedDateTime: ZonedDateTime,
  pattern: string,
): string => {
  if (!zonedDateTime) {
    return "";
  }
  return zonedDateTime.format(
    DateTimeFormatter.ofPattern(pattern).withLocale(Locale.ENGLISH),
  );
};
