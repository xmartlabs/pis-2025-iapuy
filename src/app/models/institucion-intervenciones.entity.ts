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
import { Intervencion } from "./intervencion.entity";

@Table({ tableName: "institucion-intervenciones" })
export class InstitucionIntervencion extends Model {
  
  @PrimaryKey
  @ForeignKey(() => Institucion)
  @Column
  declare institucionId: string;

  @PrimaryKey
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
