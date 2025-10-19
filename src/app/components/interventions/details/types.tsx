export type Dog = {
  id: string;
  nombre: string;
  DogExperiences: { id: string; experiencia: string }[];
};
export type Institution = {
  id: string;
  nombre: string;
};
export type Users = {
  ci: string;
  nombre: string;
};
export type UsrDogIntervention = {
  Perro: Dog;
  User: Users;
  userId: string;
  perroId: string;
};
export type Patient = {
  id: string;
  nombre: string;
  experiencia: string;
  edad: string;
  patologia_id: string;
  Patologia: { id: string; nombre: string }[];
};
export type ApiResponse = {
  Institucions: Institution[];
  Users: Users[];
  UsrPerroIntervention: UsrDogIntervention[];
  Pacientes: Patient[];
  Acompania: { userId: string; User: Users }[];
  description: string;
  driveLink: string;
  fotosUrls: string[];
  id: string;
  pairsQuantity: number;
  post_evaluacion: string;
  status: string;
  timeStamp: Date;
  tipo: string;
};
