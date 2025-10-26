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

@Table({ tableName: "banios" })
export class Banio extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: CreationOptional<string>;

  @Column({ type: DataType.DATE })
  declare fecha: Date;

  @ForeignKey(() => RegistroSanidad)
  @Column({ type: DataType.UUID })
  declare registroSanidadId: string;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @DeletedAt
  declare deletedAt: CreationOptional<Date>;
}
