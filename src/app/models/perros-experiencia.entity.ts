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

import {
  type CreationOptional
} from "sequelize"
import { Intervencion } from "./intervencion.entity";
import { Perro } from "./perro.entity";

// eslint-disable-next-line new-cap
@Table({ tableName: "perros-experiencias" })
export class PerroExperiencia extends Model{
  @PrimaryKey
  // eslint-disable-next-line new-cap
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: CreationOptional<string>;

    // eslint-disable-next-line new-cap
  @ForeignKey(() => Perro)
      // eslint-disable-next-line new-cap
  @Column({ type: DataType.STRING })
  declare perro_id: CreationOptional<string>;

// eslint-disable-next-line new-cap
  @ForeignKey(() => Intervencion)
      // eslint-disable-next-line new-cap
  @Column({ type: DataType.STRING })
  declare intervencion_id: string;

// eslint-disable-next-line new-cap
  @Column({ type: DataType.ENUM('buena', 'mala', 'regular') })
  declare experiencia: 'buena'| 'mala'| 'regular';

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;

  @DeletedAt
  declare deletedAt: CreationOptional<Date>;
}