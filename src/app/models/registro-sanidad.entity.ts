import {
  BelongsTo,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

import { Perro } from "./perro.entity";
import { Banio } from "./banio.entity";
import { Vacuna } from "./vacuna.entity";
import { Desparasitacion } from "./desparasitacion.entity";

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

  @BelongsTo(() => Perro)
  declare perro: Perro;

  @HasMany(() => Banio)
  declare banios: Banio[];

  @HasMany(() => Vacuna)
  declare vacunas: Vacuna[];

  @HasMany(() => Desparasitacion)
  declare desparasitaciones: Desparasitacion[];
}
