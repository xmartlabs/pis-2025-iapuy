/* eslint-disable new-cap */
import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
  DataType,
  HasMany,
} from "sequelize-typescript";
import { UsrPerro } from "./usrperro.entity";
import { Acompania } from "./acompania.entity";

@Table({ tableName: "users" })
export class User extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING })
  declare ci: string;

  @Column({ type: DataType.STRING })
  declare nombre: string;

  @Column({ type: DataType.STRING })
  declare celular: string;

  @Column({ type: DataType.STRING })
  declare banco: string;

  @Column({ type: DataType.STRING })
  declare cuentaBancaria: string;

  @Column({ type: DataType.STRING })
  declare password: string;

  @Column({ type: DataType.BOOLEAN })
  declare esAdmin: boolean;

  @HasMany(() => UsrPerro,  { as: "usrPerro",  foreignKey: "userId", sourceKey: "ci" })
  declare usrPerro?: UsrPerro[];

  @HasMany(() => Acompania, { as: "acompania", foreignKey: "userId", sourceKey: "ci" })
  declare acompania?: Acompania[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
