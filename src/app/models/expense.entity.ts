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
import { Intervention } from "./intervention.entity";

export type ExpenseState = "no pagado" | "pagado";

export const EXPENSE_TYPES = [
  "Baño",
  "Estacionamiento/Taxi",
  "Traslado",
  "Vacunacion",
  "Desparasitacion Interna",
  "Desparasitacion Externa",
  "Pago a acompañante",
  "Pago a guía",
] as const;

export type ExpenseType = (typeof EXPENSE_TYPES)[number];

@Table({ tableName: "expenses" })
export class Expense extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING })
  declare userId: string;

  @ForeignKey(() => Intervention)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare interventionId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare sanidadId: string | null;

  @Column({
    type: DataType.ENUM(...EXPENSE_TYPES),
    validate: {
      isIn: [EXPENSE_TYPES],
    },
  })
  declare type: ExpenseType;

  @Column({ type: DataType.STRING })
  declare concept: string;

  @Column({
    type: DataType.ENUM("no pagado", "pagado"),
    validate: {
      isIn: [["no pagado", "pagado"]],
    },
  })
  declare state: ExpenseState;

  @Column({ type: DataType.DOUBLE })
  declare amount: number;

  @Column({ type: DataType.DATE })
  declare dateSanity: Date;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  declare User?: User;

  declare Intervencion?: Intervention;
}
