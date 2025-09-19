import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

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
  declare banco: string;

  @Column
  declare cuentaBancaria: string;

  @Column
  declare password: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

}

