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

export type TipoIntervencion = "Educativa" | "Recreativa" | "Terapeutica";

@Table({ tableName: "intervenciones" })
export class Intervencion extends Model {
  @PrimaryKey
  @Column
  declare id: string;

  @Column
  declare timeStamp: Date;

  @Column
  declare costo: number;

  @Column
  declare status: string;

  @Column({
    field: "tipo",
    type: DataType.ENUM("Educativa", "Recreativa", "Terapeutica"),
    validate: {
      isIn: [["Educativa", "Recreativa", "Terapeutica"]],
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
}
