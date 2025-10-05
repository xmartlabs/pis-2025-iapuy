/* eslint-disable */ 
export type Experience = 'buena' | 'mala' | 'regular';

export interface PatientDTO {
  name: string;
  age: string;
  pathology_id: string;
  experience: Experience;
}

export interface ExperiencePerroDTO {
  perro_id: string;
  experiencia: Experience;
}

export interface EvaluateInterventionDTO {
  patients: PatientDTO[];
  experiences: ExperiencePerroDTO[];
  pictures : File[];
  driveLink : string;
}
