/* eslint-disable new-cap */

import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { User } from "./user.entity";
import { Intervencion } from "./intervencion.entity";
import { Perro } from "./perro.entity";

@Table({ tableName: "usrperros" })
export class UsrPerro extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING })
  declare userId: string;

  @ForeignKey(() => Perro)
  @Column({ type: DataType.STRING })
  declare perroId: string;

  @ForeignKey(() => Intervencion)
  @Column({ type: DataType.STRING })
  declare intervencionId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
