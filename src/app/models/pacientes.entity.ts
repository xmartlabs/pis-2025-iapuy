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

import { type CreationOptional } from "sequelize";
import { Patologia } from "./patologia.entity";
import { Intervention } from "./intervention.entity";

// eslint-disable-next-line new-cap
@Table({ tableName: "pacientes" })
export class Paciente extends Model {
  @PrimaryKey
  // eslint-disable-next-line new-cap
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: CreationOptional<string>;

  // eslint-disable-next-line new-cap
  @Column({ type: DataType.STRING })
  declare nombre: string;

  // eslint-disable-next-line new-cap
  @Column({ type: DataType.STRING })
  declare edad: string;

  // eslint-disable-next-line new-cap
  @ForeignKey(() => Patologia)
  // eslint-disable-next-line new-cap
  @Column({ type: DataType.STRING })
  declare patologia_id: CreationOptional<string>;

  // eslint-disable-next-line new-cap
  @ForeignKey(() => Intervention)
  // eslint-disable-next-line new-caps
  @Column({ type: DataType.STRING })
  declare intervencion_id: string;

  // eslint-disable-next-line new-cap
  @Column({ type: DataType.ENUM("buena", "mala", "regular") })
  declare experiencia: "buena" | "mala" | "regular";

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @DeletedAt
  declare deletedAt: CreationOptional<Date>;
}
