import {
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { User } from "./user.entity";
import { Intervencion } from "./intervention.entity";

@Table({ tableName: "acompaniantes" })
export class Acompania extends Model {
  @ForeignKey(() => User)
  @Column
  declare userId: string;

  @ForeignKey(() => Intervencion)
  @Column
  declare intervencionId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
