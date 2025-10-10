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

export type TipoIntervention = "educativa" | "recreativa" | "terapeutica";

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

  @Column({ type: DataType.FLOAT })
  declare costo: number;

  @Column({ type: DataType.STRING })
  declare status: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare pairsQuantity: number;

  @Column({
    type: DataType.ENUM("educativa", "recreativa", "terapeutica"),
    allowNull: false,
    validate: {
      isIn: [["educativa", "recreativa", "terapeutica"]],
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
}
