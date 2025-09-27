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
import { RegistroSanidad } from "./registro-sanidad.entity";

@Table({ tableName: "vacunas" })
export class Vacuna extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING })
  declare id: string;

  @Column({ type: DataType.DATE })
  declare fecha: Date;

  @Column({ type: DataType.STRING })
  declare vac: string;

  @ForeignKey(() => RegistroSanidad)
  @Column({ type: DataType.STRING })
  declare registroSanidadId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
