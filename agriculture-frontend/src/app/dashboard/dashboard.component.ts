import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { AgriculteurService } from '../core/services/agriculteur.service';
import { EquipementService } from '../core/services/equipement.service';
import { SupervisionService } from '../core/services/supervision.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: any;
  currentDate = new Date();
  stats = {
    agriculteurs: 0,
    equipements: 0,
    alertes: 0,
    exploitations: 0
  };
  
  systemStatus = {
    auth: { online: false, label: 'Service d\'authentification' },
    agriculteur: { online: false, label: 'Service agriculteurs' },
    equipement: { online: false, label: 'Service équipements' },
    supervision: { online: false, label: 'Service supervision' }
  };
  
  recentActivities: any[] = [];
  loading = true;
  private refreshSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    private agriculteurService: AgriculteurService,
    private equipementService: EquipementService,
    private supervisionService: SupervisionService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
    this.checkSystemStatusOptimized();
    
    // Rafraîchir les données toutes les 30 secondes
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadDashboardData();
      this.checkSystemStatusOptimized();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Charger les statistiques
    this.loadStats();
    
    // Charger les activités récentes
    this.loadRecentActivities();
    
    this.loading = false;
  }

  loadStats(): void {
    // Simuler des données ou appeler les API
    this.stats = {
      agriculteurs: 24,
      equipements: 156,
      alertes: 3,
      exploitations: 12
    };
    
    // TODO: Remplacer par des appels API réels
    /*
    this.agriculteurService.getAllAgriculteurs().subscribe({
      next: (agriculteurs) => this.stats.agriculteurs = agriculteurs.length,
      error: (error) => console.error('Erreur chargement agriculteurs:', error)
    });
    */
  }

  loadRecentActivities(): void {
    this.supervisionService.getAllLogs().subscribe({
      next: (logs) => {
        this.recentActivities = logs.slice(0, 5).map(log => ({
          type: 'Supervision',
          action: log.typeEvent,
          nom: log.message,
          date: new Date(log.timestamp).toLocaleString(),
          severity: log.severite
        }));
      },
      error: (error) => {
        console.error('Erreur chargement activités:', error);
        // Données de démonstration en cas d'erreur
        this.recentActivities = [
          { id: 1, type: 'Agriculteur', action: 'Créé', nom: 'Jean Dupont', date: '2024-01-03 10:30', severity: 'INFO' },
          { id: 2, type: 'Équipement', action: 'Ajouté', nom: 'Tracteur John Deere', date: '2024-01-03 09:15', severity: 'INFO' },
          { id: 3, type: 'Supervision', action: 'Alerte', nom: 'Température élevée', date: '2024-01-02 16:45', severity: 'WARNING' }
        ];
      }
    });
  }

 checkSystemStatusOptimized(): void {
  // Version simplifiée - ne pas valider le token pour l'instant
  this.systemStatus.auth.online = true;
  this.systemStatus.agriculteur.online = true;
  this.systemStatus.equipement.online = true;
  this.systemStatus.supervision.online = true;
}

  private checkServiceStatus(serviceName: keyof typeof this.systemStatus, observable: any): void {
    observable.subscribe({
      next: () => this.systemStatus[serviceName].online = true,
      error: () => this.systemStatus[serviceName].online = false
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  getUserRoleLabel(): string {
    const role = this.currentUser?.role;
    switch(role) {
      case 'ADMIN': return 'Administrateur';
      case 'AGRICULTEUR': return 'Agriculteur';
      case 'SUPERVISEUR': return 'Superviseur';
      default: return 'Utilisateur';
    }
  }

  getSeverityClass(severity: string): string {
    switch(severity) {
      case 'CRITICAL': return 'bg-danger';
      case 'WARNING': return 'bg-warning';
      case 'INFO': return 'bg-info';
      default: return 'bg-secondary';
    }
  }
}