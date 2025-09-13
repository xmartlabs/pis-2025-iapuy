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
import { User } from "./user.entity";
import { Intervencion } from "./intervencion.entity";
import { Perro } from "./perro.entity";

@Table({ tableName: "usrperros" })
export class UsrPerro extends Model {
  @PrimaryKey
  @Column
  declare id: string;

  @ForeignKey(() => User)
  @Column
  declare userId: string;

  @ForeignKey(() => Perro)
  @Column
  declare perroId: string;

  @ForeignKey(() => Intervencion)
  @Column
  declare intervencionId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
