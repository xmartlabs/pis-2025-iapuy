import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
  DataType
} from "sequelize-typescript";

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
  declare cuentaBancaria: string;

  @Column({ type: DataType.STRING })
  declare password: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

}

