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
import { RegistroSanidad } from "./registro-sanidad.entity";
import { type CreationOptional } from "sequelize";
import { Expense } from "./expense.entity";

@Table({ tableName: "vacunas" })
export class Vacuna extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: CreationOptional<string>;

  @Column
  declare fecha: Date;

  @Column
  declare vac: string;

  @ForeignKey(() => RegistroSanidad)
  @Column
  declare registroSanidadId: string;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @DeletedAt
  declare deletedAt: CreationOptional<Date>;

  @Column(DataType.BLOB("long"))
  declare carneVacunas: Buffer;

  declare RegistroSanidad?: RegistroSanidad;
  declare VacunaExpense?: Expense;
}
