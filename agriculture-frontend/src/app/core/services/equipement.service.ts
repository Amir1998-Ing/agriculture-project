import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  Equipement, 
  EquipementRequest, 
  CapteurConnecte, 
  PompeConnectee 
} from '../models/equipement.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class EquipementService {
  private api = inject(ApiService);

  // Équipements génériques
  getAllEquipements(): Observable<Equipement[]> {
    // The equipment microservice root returns a welcome string according to the controller.
    // Attempt to fetch and normalize to an array when possible; otherwise return an empty list.
    return this.api.get<any>('/equipements').pipe(
      map((res: any) => {
        if (typeof res === 'string') {
          console.warn('Equipement service root returned string — no list endpoint available');
          return [] as Equipement[];
        }
        return res as Equipement[];
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * If the microservice root returns a welcome string, this method retrieves it raw.
   */
  getRootMessage(): Observable<string> {
    return this.api.get<any>('/equipements').pipe(
      map(res => typeof res === 'string' ? res : JSON.stringify(res)),
      catchError(err => { throw err; })
    );
  }

  /** Health check endpoint exposed by the microservice */
  healthCheck(): Observable<string> {
    return this.api.get<string>('/equipements/health');
  }

  getEquipementById(id: number): Observable<Equipement> {
    return this.api.get<Equipement>(`/equipements/${id}`);
  }

  createEquipement(equipement: EquipementRequest): Observable<Equipement> {
    return this.api.post<Equipement>('/equipements', equipement);
  }

  updateEquipement(id: number, equipement: EquipementRequest): Observable<Equipement> {
    return this.api.put<Equipement>(`/equipements/${id}`, equipement);
  }

  deleteEquipement(id: number): Observable<void> {
    return this.api.delete<void>(`/equipements/${id}`);
  }

  // Vérification d'accès
  verifyAccess(equipementId: number, agriculteurId: number): Observable<boolean> {
    return this.api.get<boolean>(`/equipements/${equipementId}/verify-access/${agriculteurId}`);
  }

  // Pompes
  createPompe(pompe: any): Observable<PompeConnectee> {
    return this.api.post<PompeConnectee>('/equipements/pompes', pompe);
  }

  updatePompeEtat(id: number, etat: string): Observable<void> {
    // Controller expects etat as a request parameter. Send it as a query param.
    const endpoint = `/equipements/pompes/${id}/etat?etat=${encodeURIComponent(etat)}`;
    return this.api.put<void>(endpoint, {});
  }

  getPompeById(id: number): Observable<PompeConnectee> {
    return this.api.get<PompeConnectee>(`/equipements/pompes/${id}`);
  }

  getPompesByExploitation(exploitationId: number): Observable<PompeConnectee[]> {
    return this.api.get<PompeConnectee[]>(`/equipements/exploitations/${exploitationId}/pompes`);
  }

  // Capteurs
  createCapteur(capteur: any): Observable<CapteurConnecte> {
    return this.api.post<CapteurConnecte>('/equipements/capteurs', capteur);
  }

  updateCapteurCommunication(id: number): Observable<void> {
    return this.api.put<void>(`/equipements/capteurs/${id}/communication`, {});
  }

  getCapteurById(id: number): Observable<CapteurConnecte> {
    return this.api.get<CapteurConnecte>(`/equipements/capteurs/${id}`);
  }

  getCapteursByExploitation(exploitationId: number): Observable<CapteurConnecte[]> {
    return this.api.get<CapteurConnecte[]>(`/equipements/exploitations/${exploitationId}/capteurs`);
  }
}