import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
  BelongsToMany,
} from "sequelize-typescript";
import { Perro } from "./perro.entity";
import { UsrPerro } from "./usrperro.entity";

@Table({ tableName: "users" })
export class User extends Model {
  @PrimaryKey
  @Column
  declare ci: string;

  @Column
  declare nombre: string;

  @Column
  declare celular: string;

  @Column
  declare cuentaBancaria: string;

  @Column
  declare password: string;

  @BelongsToMany(() => Perro, {
    through: () => UsrPerro,
    foreignKey: 'userId',
    otherKey: 'perroId',
  })
  declare perros: Perro[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}

