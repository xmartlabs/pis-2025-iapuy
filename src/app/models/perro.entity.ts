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

@Table({ tableName: "perros" })
export class Perro extends Model {
  @PrimaryKey
  @Column
  declare id: string;

  @Column
  declare nombre: string;

  @Column
  declare descripcion: string;

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  declare fortalezas: string[];

  @ForeignKey(() => User)
  @Column
  declare duenioId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  @BelongsTo(() => User)
  declare duenio: User;
}
