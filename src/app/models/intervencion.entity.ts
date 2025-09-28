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

export type TipoIntervention = "educativa" | "recreativa" | "terapeutica";

@Table({ tableName: "intervenciones" })
export class Intervention extends Model {
  @PrimaryKey
  @Column
  declare id: string;

  @Column
  declare timeStamp: Date;

  @Column
  declare costo: number;

  @Column
  declare status: string;

  @Column
  declare pairsQuantity?: number;

  @Column({
    type: DataType.ENUM("educativa", "recreativa", "terapeutica"),
    validate: {
      isIn: [["educativa", "recreativa", "terapeutica"]],
    },
  })
  declare tipo: TipoIntervention;

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
