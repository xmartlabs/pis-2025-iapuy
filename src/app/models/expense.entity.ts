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

export type ExpenseState = "Pendiente de pago" | "Pagado";

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
  @Column
  declare id: string;

  @ForeignKey(() => User)
  @Column
  declare userId: string;

  @ForeignKey(() => Intervention)
  @Column
  declare intervencionId: string;

  @Column({
    type: DataType.ENUM(...EXPENSE_TYPES),
    validate: {
      isIn: [EXPENSE_TYPES],
    },
  })
  declare type: ExpenseType;

  @Column
  declare concept: string;

  @Column({
    type: DataType.ENUM("Pendiente de pago", "Pagado"),
    validate: {
      isIn: [["Pendiente de pago", "Pagado"]],
    },
  })
  declare state: ExpenseState;

  @Column
  declare amount: number;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
