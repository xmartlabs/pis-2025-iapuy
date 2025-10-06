/* eslint-disable new-cap */
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
import { Intervention } from "./intervention.entity";

@Table({ tableName: "institucion-intervenciones" })
export class InstitucionIntervencion extends Model {
  @PrimaryKey
  @ForeignKey(() => Institucion)
  @Column
  declare institucionId: string;

  @PrimaryKey
  @ForeignKey(() => Intervention)
  @Column
  declare intervencionId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
