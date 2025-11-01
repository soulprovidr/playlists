import { ColumnType, Generated, Insertable, Selectable } from "kysely";

export interface UsersTable {
  id: Generated<number>;
  spotifyUserId: string;
  createdAt: ColumnType<string, never, never>;
  updatedAt: ColumnType<string, never, never>;
}

export type User = Selectable<UsersTable>;
export type UserInsert = Insertable<UsersTable>;
export type UserUpdate = Partial<UserInsert>;
