export interface Equipement {
  id: number;
  nom: string;
  modele: string;
  type: string;
  serie: string;
  dateAchat: string;
  statut: string;
  description?: string;
  exploitationId: number;
}

export interface EquipementRequest {
  nom: string;
  modele: string;
  type: string;
  serie: string;
  dateAchat: string;
  statut: string;
  description?: string;
  exploitationId: number;
}

export interface CapteurConnecte {
  id: number;
  type: string;
  exploitationId: number;
  batterie: number;
  derniereCommunication: string;
}

export interface PompeConnectee {
  id: number;
  exploitationId: number;
  modele: string;
  etat: string;
  debitMax: number;
  derniereMiseAJour: string;
}