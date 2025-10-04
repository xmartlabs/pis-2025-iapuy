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
import type { CreationOptional } from "sequelize";

@Table({ tableName: "usrperros" })
export class UsrPerro extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: CreationOptional<string>;

  @ForeignKey(() => User)
  @Column
  declare userId: string;

  @ForeignKey(() => Perro)
  @Column
  declare perroId: string;

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
