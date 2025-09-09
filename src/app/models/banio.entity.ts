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

@Table({ tableName: "banios" })
export class Banio extends Model {
  @PrimaryKey
  @Column
  declare id: string;

  @Column
  declare fecha: Date;

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
