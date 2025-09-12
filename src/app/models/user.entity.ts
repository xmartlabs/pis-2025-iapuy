import {
  BelongsToMany,
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Intervencion } from "./intervencion.entity";
import { Acompania } from "./acompania.entity";

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

  @Column
  declare esAdmin: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  @BelongsToMany(() => Intervencion, () => Acompania)
  declare intervenciones: Intervencion[];

}

