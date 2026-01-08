// equipements/pages/capteur-detail/capteur-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EquipementService } from '../../../core/services/equipement.service';
import { CapteurConnecte } from '../../../core/models/equipement.model';

@Component({
  selector: 'app-capteur-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatListModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <button 
          mat-button 
          color="primary"
          [routerLink]="['/equipements/capteurs']"
          class="mb-4"
        >
          <mat-icon>arrow_back</mat-icon>
          Retour à la liste
        </button>
        
        <div class="flex justify-between items-start mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Capteur #{{ capteur?.id }}</h1>
            <p class="text-gray-600">Détails du capteur connecté</p>
          </div>
          <mat-chip [class]="getTypeClass(capteur?.type || '')">
            {{ capteur?.type }}
          </mat-chip>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="text-center py-12">
        <mat-icon class="text-red-500" style="font-size: 48px;">error</mat-icon>
        <p class="text-gray-700 mt-2">{{ error }}</p>
        <button 
          mat-raised-button 
          color="primary"
          [routerLink]="['/equipements/capteurs']"
          class="mt-4"
        >
          Retour à la liste
        </button>
      </div>

      <!-- Capteur Details -->
      <div *ngIf="capteur && !loading">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <!-- Informations -->
          <mat-card>
            <mat-card-header>
              <mat-card-title class="flex items-center gap-2">
                <mat-icon class="text-blue-500">info</mat-icon>
                Informations du capteur
              </mat-card-title>
            </mat-card-header>
            <mat-card-content class="pt-4">
              <mat-list>
                <mat-list-item>
                  <div class="w-full flex justify-between">
                    <span class="text-gray-600">ID:</span>
                    <span class="font-medium">{{ capteur.id }}</span>
                  </div>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <div class="w-full flex justify-between">
                    <span class="text-gray-600">Type:</span>
                    <span class="font-medium">{{ capteur.type }}</span>
                  </div>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <div class="w-full flex justify-between">
                    <span class="text-gray-600">Exploitation ID:</span>
                    <span class="font-medium">{{ capteur.exploitationId }}</span>
                  </div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>

          <!-- État -->
          <mat-card>
            <mat-card-header>
              <mat-card-title class="flex items-center gap-2">
                <mat-icon class="text-green-500">battery_charging_full</mat-icon>
                État du capteur
              </mat-card-title>
            </mat-card-header>
            <mat-card-content class="pt-4">
              <!-- Niveau de batterie -->
              <div class="mb-6">
                <div class="flex justify-between mb-2">
                  <span class="text-gray-600">Niveau de batterie</span>
                  <span [class]="getBatterieTextClass(capteur.batterie)" class="font-medium">
                    {{ capteur.batterie }}%
                  </span>
                </div>
                <mat-progress-bar 
                  [mode]="'determinate'" 
                  [value]="capteur.batterie"
                  [color]="getBatterieProgressColor(capteur.batterie)"
                ></mat-progress-bar>
                <div class="mt-2 text-sm text-gray-500">
                  <mat-icon 
                    [class]="getBatterieClass(capteur.batterie)"
                    class="align-text-bottom mr-1"
                  >
                    {{ getBatterieIcon(capteur.batterie) }}
                  </mat-icon>
                  {{ getBatterieStatusText(capteur.batterie) }}
                </div>
              </div>

              <!-- Dernière communication -->
              <div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Dernière communication</span>
                  <span class="font-medium">{{ formatDate(capteur.derniereCommunication) }}</span>
                </div>
                <div class="mt-4 text-sm text-gray-500">
                  Temps écoulé: {{ getTimeSince(capteur.derniereCommunication) }}
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button 
            mat-raised-button 
            color="primary"
            class="flex items-center justify-center gap-2 p-4"
            (click)="updateCommunication()"
          >
            <mat-icon>refresh</mat-icon>
            Mettre à jour la communication
          </button>

          <button 
            mat-raised-button 
            color="accent"
            class="flex items-center justify-center gap-2 p-4"
            (click)="verifyAccess()"
          >
            <mat-icon>verified_user</mat-icon>
            Vérifier l'accès
          </button>
        </div>

        <!-- Alertes Batterie -->
        <div *ngIf="capteur.batterie < 30" class="mb-8">
          <mat-card class="border-l-4 border-yellow-500">
            <mat-card-header>
              <mat-card-title class="flex items-center gap-2 text-yellow-700">
                <mat-icon>warning</mat-icon>
                Alerte Batterie
              </mat-card-title>
            </mat-card-header>
            <mat-card-content class="pt-2">
              <p class="text-yellow-600">
                La batterie de ce capteur est faible ({{ capteur.batterie }}%). 
                {{ getBatteryRecommendation(capteur.batterie) }}
              </p>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Historique -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Historique des communications</mat-card-title>
            <mat-card-subtitle>Dernières mises à jour</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <div class="space-y-4">
              <div *ngFor="let log of communicationLogs" class="flex items-center gap-4 p-3 hover:bg-gray-50 rounded">
                <mat-icon class="text-gray-400">schedule</mat-icon>
                <div class="flex-1">
                  <p class="font-medium">Communication mise à jour</p>
                  <p class="text-sm text-gray-500">{{ log.time }}</p>
                </div>
                <span class="text-sm text-gray-400">{{ log.date }}</span>
              </div>
              
              <div *ngIf="communicationLogs.length === 0" class="text-center py-8 text-gray-500">
                Aucun historique disponible
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .type-humidite { background-color: #DBEAFE; color: #1E40AF; }
    .type-temperature { background-color: #FEE2E2; color: #991B1B; }
    .type-ph { background-color: #D1FAE5; color: #065F46; }
    .type-luminosite { background-color: #FEF3C7; color: #92400E; }
  `]
})
export class CapteurDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private equipementService = inject(EquipementService);
  private snackBar = inject(MatSnackBar);

  loading = true;
  error = '';
  capteur: CapteurConnecte | null = null;
  communicationLogs: any[] = [];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCapteur(+id);
      this.loadCommunicationLogs();
    } else {
      this.error = 'ID de capteur non spécifié';
      this.loading = false;
    }
  }

  loadCapteur(id: number) {
    this.equipementService.getCapteurById(id).subscribe({
      next: (capteur) => {
        this.capteur = capteur;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du capteur:', error);
        this.error = 'Impossible de charger les détails du capteur';
        this.loading = false;
      }
    });
  }

  loadCommunicationLogs() {
    // Simuler des logs de communication
    this.communicationLogs = [
      {
        time: 'Communication réussie',
        date: 'Il y a 2 heures'
      },
      {
        time: 'Données transmises',
        date: 'Il y a 1 jour'
      },
      {
        time: 'Mise à jour automatique',
        date: 'Il y a 3 jours'
      }
    ];
  }

  getTypeClass(type: string): string {
    const classes: {[key: string]: string} = {
      'HUMIDITE': 'type-humidite',
      'TEMPERATURE': 'type-temperature',
      'PH': 'type-ph',
      'LUMINOSITE': 'type-luminosite',
      'PRESSION': 'bg-purple-100 text-purple-800',
      'AUTRE': 'bg-gray-100 text-gray-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
  }

  getBatterieClass(batterie: number): string {
    if (batterie > 50) return 'text-green-500';
    if (batterie >= 20) return 'text-yellow-500';
    return 'text-red-500';
  }

  getBatterieTextClass(batterie: number): string {
    if (batterie > 50) return 'text-green-600';
    if (batterie >= 20) return 'text-yellow-600';
    return 'text-red-600';
  }

  getBatterieProgressColor(batterie: number): 'primary' | 'accent' | 'warn' {
    if (batterie > 50) return 'primary';
    if (batterie >= 20) return 'accent';
    return 'warn';
  }

  getBatterieIcon(batterie: number): string {
    if (batterie > 80) return 'battery_full';
    if (batterie > 50) return 'battery_6_bar';
    if (batterie > 20) return 'battery_4_bar';
    if (batterie > 10) return 'battery_2_bar';
    return 'battery_0_bar';
  }

  getBatterieStatusText(batterie: number): string {
    if (batterie > 80) return 'Batterie pleine';
    if (batterie > 50) return 'Batterie bonne';
    if (batterie >= 20) return 'Batterie moyenne';
    return 'Batterie faible - Rechargement recommandé';
  }

  getBatteryRecommendation(batterie: number): string {
    if (batterie < 10) return 'Rechargement urgent nécessaire.';
    if (batterie < 20) return 'Rechargement nécessaire dans les prochains jours.';
    if (batterie < 30) return 'Pensez à recharger prochainement.';
    return '';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }

  getTimeSince(dateString: string): string {
    if (!dateString) return 'Inconnu';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      
      if (diffMinutes < 1) return 'À l\'instant';
      if (diffMinutes < 60) return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } catch (e) {
      return 'Inconnu';
    }
  }

  updateCommunication() {
    if (!this.capteur) return;
    
    this.equipementService.updateCapteurCommunication(this.capteur.id).subscribe({
      next: () => {
        this.snackBar.open('Communication du capteur mise à jour', 'Fermer', {
          duration: 3000
        });
        // Recharger le capteur
        this.loadCapteur(this.capteur!.id);
        // Ajouter un log
        this.communicationLogs.unshift({
          time: 'Communication manuelle',
          date: 'À l\'instant'
        });
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la communication:', error);
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  verifyAccess() {
    if (!this.capteur) return;
    
    // Vérifier l'accès pour l'agriculteur ID 1 (exemple)
    this.equipementService.verifyAccess(this.capteur.id, 1).subscribe({
      next: (hasAccess) => {
        const message = hasAccess 
          ? '✅ L\'agriculteur a accès à ce capteur'
          : '❌ L\'agriculteur n\'a pas accès à ce capteur';
        
        this.snackBar.open(message, 'Fermer', {
          duration: 5000
        });
      },
      error: (error) => {
        console.error('Erreur lors de la vérification d\'accès:', error);
        this.snackBar.open('Erreur lors de la vérification d\'accès', 'Fermer', {
          duration: 3000
        });
      }
    });
  }
}