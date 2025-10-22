/* eslint-disable new-cap */
import {
  DataType,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { User } from "./user.entity";
import { Intervention } from "./intervention.entity";

@Table({ tableName: "acompaniantes" })
export class Acompania extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING })
  declare userId: string;

  @ForeignKey(() => Intervention)
  @Column
  declare intervencionId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  declare User?: User;
}
