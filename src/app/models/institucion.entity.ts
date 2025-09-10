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
import { Patologia } from "./patologia.entity";
import { InstitucionPatologias } from "./intitucion-patalogia";
import { Intervencion } from "./intervencion.entity";
import { InstitucionIntervencion } from "./institucion-intervenciones.entity";

@Table({ tableName: "instituciones" })
export class Institucion extends Model {
  @PrimaryKey
  @Column
  declare id: string;

  @Column
  declare nombre: string;

  @Column
  declare contacto: string;

  @Column
  declare telefono: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  @BelongsToMany(() => Patologia, () => InstitucionPatologias)
  declare patologias: Patologia[];

  @BelongsToMany(() => Intervencion, () => InstitucionIntervencion)
  declare intervenciones: Intervencion[];
}
