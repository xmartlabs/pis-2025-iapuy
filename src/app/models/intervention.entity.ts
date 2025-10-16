/* eslint-disable new-cap */
import {
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { User } from "./user.entity";
import type { CreationOptional } from "sequelize";
import { Institucion } from "./institucion.entity";
import { InstitucionIntervencion } from "./institucion-intervenciones.entity";
import { UsrPerro } from "./usrperro.entity";
import { Paciente } from "./pacientes.entity";

export type TipoIntervention = "Educativa" | "Recreativa" | "Terapeutica";

@Table({ tableName: "intervenciones" })
export class Intervention extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare timeStamp: Date;

  @Column({ type: DataType.STRING })
  declare status: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare pairsQuantity: number;

  @Column({
    type: DataType.ENUM("Educativa", "Recreativa", "Terapeutica"),
    allowNull: false,
    validate: {
      isIn: [["Educativa", "Recreativa", "Terapeutica"]],
    },
  })
  declare tipo: TipoIntervention;
  @Column({ type: DataType.STRING })
  declare description: string;

  @Column({ type: DataType.STRING })
  declare post_evaluacion?: string;

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  declare fotosUrls: string[];

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING })
  declare userId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  declare driveLink: CreationOptional<string>;

  @BelongsToMany(() => Institucion, () => InstitucionIntervencion)
  declare Institucions?: Institucion[];
  declare UsrPerroIntervention?: UsrPerro[];
  declare Pacientes?: Paciente[];
}
