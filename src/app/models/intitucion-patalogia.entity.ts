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
import { Institucion } from "./institucion.entity";
import { Patologia } from "./patologia.entity";

@Table({ tableName: "institucion-patologias" })
export class InstitucionPatologias extends Model {

  @PrimaryKey
  @ForeignKey(() => Institucion)
  @Column
  declare institucionId: string;

  @PrimaryKey
  @ForeignKey(() => Patologia)
  @Column
  declare patologiaId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
