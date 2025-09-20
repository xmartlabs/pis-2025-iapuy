class UserDto {
  constructor(
    ci: string,
    nombre: string,
    celular: string,
    cuentaBancaria: string,
    createdAt: string,
    updatedAt: string,
    deletedAt: string
  ) {
    this.ci = ci;
    this.nombre = nombre;
    this.celular = celular;
    this.cuentaBancaria = cuentaBancaria;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }
  ci: string;
  nombre: string;
  celular: string;
  cuentaBancaria: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}
