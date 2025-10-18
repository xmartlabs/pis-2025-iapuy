/* eslint-disable new-cap */
import {
  Model,
  Table,
  Column,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
} from "sequelize-typescript";
import { User } from "./user.entity";

@Table({ tableName: "reset_tokens" })
export class ResetToken extends Model {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column
  declare userId: string;

  @Column
  declare tokenHash: string;

  @Column
  declare expiresAt: Date;

  @Column
  declare used: boolean;

  @BelongsTo(() => User)
  declare UserToReset?: User;
}
