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

@Table({ tableName: "institutionContacts" })
export class InstitutionContact extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column
  declare name: string;

  @Column
  declare contact: string;

  @ForeignKey(() => Institucion)
  @Column
  declare institutionId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
