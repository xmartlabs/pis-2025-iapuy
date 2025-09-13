import {
  Column,
  CreatedAt,
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
  @Column
  declare id: string;

  @ForeignKey(() => Perro)
  @Column
  declare perroId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
