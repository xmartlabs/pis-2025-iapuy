/* eslint-disable new-cap */
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

  @Column
  declare costo: number;

  @Column
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
  @Column
  declare description: string;

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
