/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

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

import { Perro } from "./perro.entity";

@Table({ tableName: "registro-sanidades" })
export class RegistroSanidad extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING })
  declare id: string;

  @ForeignKey(() => Perro)
  @Column({ type: DataType.STRING })
  declare perroId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
