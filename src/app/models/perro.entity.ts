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
export class Perro extends Model<
  InferAttributes<Perro>,
  InferCreationAttributes<Perro>
> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: CreationOptional<string>;

  @Column
  declare nombre: string;

  @Column
  declare descripcion: string;

  @Column
  declare fortalezas: string;

  @ForeignKey(() => User)
  @Column
  declare duenioId: string;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @DeletedAt
  declare deletedAt: CreationOptional<Date>;
}
