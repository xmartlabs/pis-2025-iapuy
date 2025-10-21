import type { CreatePerroDTO } from "../../perros/dtos/create-perro.dto";

export class CreateUserDto {
  declare ci: string;
  declare password: string;
  declare nombre: string;
  declare celular: string;
  declare banco: string;
  declare cuentaBancaria: string;
  declare rol: "admin" | "colaborador";
  declare perros: Array<string>;
  declare perrosDto: Array<{
    id: string,
    perro: CreatePerroDTO,
  }>;
}
