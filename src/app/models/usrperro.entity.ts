/* eslint-disable new-cap */
import {
  DataType,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user.entity";
import { Intervention } from "./intervention.entity";
import { Perro } from "./perro.entity";
import type { CreationOptional } from "sequelize";

@Table({ tableName: "usrperros" })
export class UsrPerro extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: CreationOptional<string>;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING })
  declare userId: string;

  @ForeignKey(() => Perro)
  @Column({ type: DataType.STRING })
  declare perroId: string;

  @ForeignKey(() => Intervention)
  @Column
  declare intervencionId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;

  @BelongsTo(() => User)
  declare User?: User;
  declare Perro?: Perro;
}
