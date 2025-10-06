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
import type { CreationOptional } from "sequelize";

@Table({ tableName: "desparasitaciones" })
export class Desparasitacion extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: CreationOptional<string>;

  @Column
  declare fecha: Date;

  @Column
  declare medicamento: string;

  @ForeignKey(() => RegistroSanidad)
  @Column
  declare registroSanidadId: string;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @DeletedAt
  declare deletedAt: CreationOptional<Date>;

  @Column({
  type: DataType.ENUM('Externa', 'Interna'),
  allowNull: false,
  defaultValue: 'Externa'
  })
  declare tipoDesparasitacion: 'Externa' | 'Interna';
}
