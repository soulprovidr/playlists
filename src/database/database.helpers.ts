/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DateTimeFormatter,
  Instant,
  LocalDateTime,
  ZonedDateTime,
  ZoneId,
} from "@js-joda/core";
import "@js-joda/locale_en";
import "@js-joda/timezone";
import { CreateTableBuilder, sql } from "kysely";

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
  try {
    return timestamp
      ? LocalDateTime.parse(timestamp, DATE_TIME_PATTERN).atZone(ZoneId.UTC)
      : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const withAutoIncrementingId = (
  qb: CreateTableBuilder<any, any>,
): CreateTableBuilder<any, any> => {
  return qb.addColumn("id", "integer", (col) =>
    col.primaryKey().autoIncrement(),
  );
};

export const withTimestamps = (
  qb: CreateTableBuilder<any, any>,
): CreateTableBuilder<any, any> => {
  return qb
    .addColumn("created_at", "varchar", (col) =>
      col.defaultTo(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`).notNull(),
    )
    .addColumn("updated_at", "varchar", (col) =>
      col.defaultTo(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`).notNull(),
    );
};
