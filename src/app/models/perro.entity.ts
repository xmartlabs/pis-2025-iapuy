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

import {
  InferAttributes,
  InferCreationAttributes,
  type CreationOptional
} from "sequelize"

import { User } from "./user.entity";

@Table({ tableName: "perros" })
export class Perro extends Model{
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 }) //! consultar si no conviene nueva migration en vez de manejarlo del modelo
  declare id: CreationOptional<string>; // este objeto de sequelize permite que no le pasemos el campo y que lo cree solo, los que no lo tienen debemos pasarlos

  @Column({ type: DataType.STRING })
  declare nombre: string;

  @Column({ type: DataType.STRING })
  declare descripcion: string;

  @Column({ type: DataType.STRING })
  declare fortalezas: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING })
  declare duenioId: string;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @DeletedAt
  declare deletedAt: CreationOptional<Date>;
}
