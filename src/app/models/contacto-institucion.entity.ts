import {
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  PrimaryKey,
  Model,
  Table,
  UpdatedAt,
  DataType,
} from "sequelize-typescript";
import { Institucion } from "./institucion.entity";

@Table({ tableName: "contactos-institucion" })
export class ContactoInstitucion extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column
  declare nombre: string;

  @Column
  declare contacto: string;

  @ForeignKey(() => Institucion)
  @Column
  declare institucionId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
