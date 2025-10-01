import {
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

export type TipoIntervencion = "educativa" | "recreativa" | "terapeutica";

@Table({ tableName: "intervenciones" })
export class Intervencion extends Model {
  @PrimaryKey
  @Column
  declare id: string;

  @Column
  declare timeStamp: Date;

  @Column
  declare costo: number;

  @Column({
    type: DataType.ENUM("educativa", "recreativa", "terapeutica"),
    validate: {
      isIn: [["educativa", "recreativa", "terapeutica"]],
    },
  })
  declare tipo: TipoIntervencion;

  @Column
  declare post_evaluacion?: string;

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  declare fotosUrls: string[];

  @ForeignKey(() => User)
  @Column
  declare userId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  declare driveLink: CreationOptional<string>;

}
