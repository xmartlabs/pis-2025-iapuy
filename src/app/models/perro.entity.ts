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
import { UsrPerro } from "./usrperro.entity";

// eslint-disable-next-line new-cap
@Table({ tableName: "perros" })
export class Perro extends Model {
  @PrimaryKey
  @Column
  declare id: string;

  @Column
  declare nombre: string;

  @Column
  declare descripcion: string;

  // eslint-disable-next-line new-cap
  @Column({ type: DataType.ARRAY(DataType.STRING) })
  declare fortalezas: string[];

  // eslint-disable-next-line new-cap
  @ForeignKey(() => User)
  @Column
  declare duenioId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  declare UsrPerros?: UsrPerro[];
}
