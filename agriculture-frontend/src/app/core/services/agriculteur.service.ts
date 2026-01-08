import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  Agriculteur, 
  AgriculteurRequest, 
  Exploitation, 
  ExploitationRequest 
} from '../models/agriculteur.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AgriculteurService {
  private api = inject(ApiService);

  // Agriculteurs
  getAllAgriculteurs(): Observable<Agriculteur[]> {
    return this.api.get<Agriculteur[]>('/agriculteurs');
  }

  getAgriculteurById(id: number): Observable<Agriculteur> {
    return this.api.get<Agriculteur>(`/agriculteurs/${id}`);
  }

  createAgriculteur(agriculteur: AgriculteurRequest): Observable<Agriculteur> {
    return this.api.post<Agriculteur>('/agriculteurs', agriculteur);
  }

  updateAgriculteur(id: number, agriculteur: AgriculteurRequest): Observable<Agriculteur> {
    return this.api.put<Agriculteur>(`/agriculteurs/${id}`, agriculteur);
  }

  deleteAgriculteur(id: number): Observable<void> {
    return this.api.delete<void>(`/agriculteurs/${id}`);
  }

  // Exploitations
  createExploitation(agriculteurId: number, exploitation: ExploitationRequest): Observable<Exploitation> {
    return this.api.post<Exploitation>(`/agriculteurs/${agriculteurId}/exploitations`, exploitation);
  }

  getExploitationsByAgriculteur(agriculteurId: number): Observable<Exploitation[]> {
    return this.api.get<Exploitation[]>(`/agriculteurs/${agriculteurId}/exploitations`);
  }

  // Vérification d'accès aux équipements
  verifyEquipementAccess(agriculteurId: number, equipementId: number): Observable<boolean> {
    return this.api.get<boolean>(`/agriculteurs/${agriculteurId}/equipements/${equipementId}/access`);
  }

  // Recherche et filtrage
  searchAgriculteurs(searchTerm: string): Observable<Agriculteur[]> {
    return this.api.get<Agriculteur[]>('/agriculteurs/search', { q: searchTerm });
  }
}