import {
  BelongsTo,
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
import { Intervencion } from "./intervencion.entity";

export type EstadoGasto = "no pagado" | "pagado";

@Table({ tableName: "gastos" })
export class Gasto extends Model {
  @PrimaryKey
  @Column
  declare id: string;

  @ForeignKey(() => User)
  @Column
  declare userId: string;

  @ForeignKey(() => Intervencion)
  @Column
  declare intervencionId: string;

  @Column
  declare concepto: string;

  @Column({
    type: DataType.ENUM("no pagado", "pagado"),
    validate: {
      isIn: [["no pagado", "pagado"]],
    },
  })
  declare estado: EstadoGasto;

  @Column
  declare monto: number;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  @BelongsTo(() => User)
  declare usuario: User;

  @BelongsTo(() => Intervencion)
  declare intervencion: Intervencion;
}
