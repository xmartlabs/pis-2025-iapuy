import {
  Column,
  CreatedAt,
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
  @Column
  declare id: string;

  @Column
  declare fecha: Date;

  @Column
  declare vac: string;

  @ForeignKey(() => RegistroSanidad)
  @Column
  declare registroSanidadId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
