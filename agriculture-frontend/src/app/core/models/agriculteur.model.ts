import { Equipement } from "./equipement.model";

export interface Agriculteur {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  role: string;
  dateInscription: string;
  exploitations?: Exploitation[];
}

export interface AgriculteurRequest {
  nom: string;
  email: string;
  telephone?: string;
  role?: string;
}

export interface Exploitation {
  id: number;
  nom: string;
  superficie: number;
  localisation: string;
  type: string;
  agriculteurId: number;
  equipements?: Equipement[];
}

export interface ExploitationRequest {
  nom: string;
  superficie: number;
  localisation: string;
  type: string;
}