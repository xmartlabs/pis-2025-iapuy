type Dupla = {
  ci: string;
  perro: string;
};

export class InscripcionDto {
  declare intervention: string;
  declare acompaniantes: string[];
  declare duplas: Dupla[];
}
