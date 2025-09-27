import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

@Table({ tableName: "instituciones" })
export class Institucion extends Model {
  @PrimaryKey
  @Column
  declare id: string;

  @Column({ field: "nombre" })
  declare name: string;

  @Column
  declare contacto: string;

  @Column
  declare telefono: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
