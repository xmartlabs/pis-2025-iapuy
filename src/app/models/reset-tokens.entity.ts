/* eslint-disable new-cap */
import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
} from "sequelize-typescript";
import { User } from "./user.entity";

@Table({ tableName: "reset_tokens" })
export class ResetToken extends Model {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare tokenHash: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare expiresAt: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare used: boolean;

  @BelongsTo(() => User)
  declare UserToReset?: User;
}
