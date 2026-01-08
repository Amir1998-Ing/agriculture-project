// supervision/pages/alerts/alerts.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // AJOUTER CET IMPORT
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

interface Alert {
  id: number;
  type: 'BATTERY' | 'STATE' | 'COMMUNICATION' | 'PERFORMANCE' | 'SECURITY';
  title: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  equipmentId: number;
  equipmentType: string;
  exploitationId: number;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  actions: string[];
}

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, // AJOUTÉ ICI
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatBadgeModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Alertes en Temps Réel</h1>
            <p class="text-gray-600">Surveillance proactive des équipements</p>
          </div>
          <div class="flex items-center gap-2">
            <mat-slide-toggle [checked]="realtimeEnabled" (change)="toggleRealtime($event)">
              Temps réel
            </mat-slide-toggle>
            <button 
              mat-button 
              color="primary"
              [routerLink]="['/supervision/dashboard']"
            >
              <mat-icon>arrow_back</mat-icon>
              Dashboard
            </button>
          </div>
        </div>
      </div>

      <!-- Statistiques Alertes -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <mat-card>
          <mat-card-content class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Alertes actives</p>
                <p class="text-2xl font-bold text-red-600">{{ activeAlertsCount }}</p>
              </div>
              <mat-icon class="text-red-500" fontIcon="notifications_active"></mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Non reconnues</p>
                <p class="text-2xl font-bold text-yellow-600">{{ unacknowledgedCount }}</p>
              </div>
              <mat-icon class="text-yellow-500" fontIcon="error_outline"></mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Critiques</p>
                <p class="text-2xl font-bold text-purple-600">{{ criticalAlertsCount }}</p>
              </div>
              <mat-icon class="text-purple-500" fontIcon="warning"></mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Résolues (24h)</p>
                <p class="text-2xl font-bold text-green-600">{{ resolvedTodayCount }}</p>
              </div>
              <mat-icon class="text-green-500" fontIcon="check_circle"></mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filtres -->
      <mat-card class="mb-6">
        <mat-card-content class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Type d'alerte</mat-label>
              <mat-select [(value)]="selectedAlertType">
                <mat-option value="all">Tous les types</mat-option>
                <mat-option value="BATTERY">Batterie</mat-option>
                <mat-option value="STATE">État</mat-option>
                <mat-option value="COMMUNICATION">Communication</mat-option>
                <mat-option value="PERFORMANCE">Performance</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Sévérité</mat-label>
              <mat-select [(value)]="selectedSeverity">
                <mat-option value="all">Toutes les sévérités</mat-option>
                <mat-option value="CRITICAL">Critique</mat-option>
                <mat-option value="HIGH">Haute</mat-option>
                <mat-option value="MEDIUM">Moyenne</mat-option>
                <mat-option value="LOW">Basse</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Statut</mat-label>
              <mat-select [(value)]="selectedStatus">
                <mat-option value="all">Tous les statuts</mat-option>
                <mat-option value="active">Actives</mat-option>
                <mat-option value="acknowledged">Reconnues</mat-option>
                <mat-option value="resolved">Résolues</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Alertes -->
      <div *ngIf="!loading" class="space-y-4">
        <!-- Alertes actives -->
        <div *ngIf="activeAlerts.length > 0">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Alertes Actives</h2>
          <div class="space-y-3">
            <mat-expansion-panel *ngFor="let alert of activeAlerts" 
                                 [expanded]="!alert.acknowledged"
                                 class="border border-red-200">
              <mat-expansion-panel-header [class.bg-red-50]="!alert.acknowledged">
                <mat-panel-title class="flex items-center gap-3">
                  <mat-icon [class]="getAlertIconClass(alert.type)">{{ getAlertIcon(alert.type) }}</mat-icon>
                  <div>
                    <div class="font-medium">{{ alert.title }}</div>
                    <div class="text-sm text-gray-500">
                      {{ getEquipmentLabel(alert.equipmentType) }} #{{ alert.equipmentId }}
                    </div>
                  </div>
                </mat-panel-title>
                <mat-panel-description class="flex items-center gap-2">
                  <mat-chip [class]="getSeverityClass(alert.severity)" class="text-xs">
                    {{ getSeverityLabel(alert.severity) }}
                  </mat-chip>
                  <span class="text-sm text-gray-500">{{ formatTimeAgo(alert.timestamp) }}</span>
                </mat-panel-description>
              </mat-expansion-panel-header>

              <!-- Contenu de l'alerte -->
              <div class="p-4 space-y-4">
                <div class="text-gray-700">{{ alert.message }}</div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-gray-50 p-3 rounded">
                    <div class="text-sm font-medium text-gray-600 mb-2">Informations</div>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-600">Équipement:</span>
                        <span class="font-medium">{{ alert.equipmentType }} #{{ alert.equipmentId }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Exploitation:</span>
                        <span class="font-medium">#{{ alert.exploitationId }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Date:</span>
                        <span class="font-medium">{{ formatDate(alert.timestamp) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="bg-gray-50 p-3 rounded">
                    <div class="text-sm font-medium text-gray-600 mb-2">Actions</div>
                    <div class="space-y-2">
                      <button 
                        *ngIf="!alert.acknowledged"
                        mat-raised-button 
                        color="primary" 
                        size="small"
                        (click)="acknowledgeAlert(alert)"
                        class="w-full"
                      >
                        <mat-icon>check_circle</mat-icon>
                        Reconnaître l'alerte
                      </button>
                      <button 
                        mat-button 
                        color="accent" 
                        size="small"
                        (click)="viewEquipment(alert)"
                        class="w-full"
                      >
                        <mat-icon>launch</mat-icon>
                        Voir l'équipement
                      </button>
                      <button 
                        mat-stroked-button 
                        color="warn" 
                        size="small"
                        (click)="resolveAlert(alert)"
                        class="w-full"
                      >
                        <mat-icon>done_all</mat-icon>
                        Marquer comme résolu
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Actions suggérées -->
                <div *ngIf="alert.actions.length > 0">
                  <div class="text-sm font-medium text-gray-600 mb-2">Actions suggérées</div>
                  <div class="flex flex-wrap gap-2">
                    <button 
                      *ngFor="let action of alert.actions"
                      mat-stroked-button 
                      size="small"
                      (click)="executeAction(alert, action)"
                    >
                      {{ action }}
                    </button>
                  </div>
                </div>
              </div>
            </mat-expansion-panel>
          </div>
        </div>

        <!-- Aucune alerte active -->
        <div *ngIf="activeAlerts.length === 0" class="text-center py-12">
          <mat-icon class="text-green-500" style="font-size: 48px;">check_circle</mat-icon>
          <h3 class="text-lg font-medium text-gray-900 mt-4">Aucune alerte active</h3>
          <p class="text-gray-500 mt-2">Tous les systèmes fonctionnent normalement</p>
        </div>

        <!-- Alertes récentes résolues -->
        <div *ngIf="recentResolvedAlerts.length > 0" class="mt-8">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Alertes Récemment Résolues</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-card *ngFor="let alert of recentResolvedAlerts" class="bg-green-50 border border-green-200">
              <mat-card-content class="p-4">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-3">
                    <mat-icon class="text-green-600">check_circle</mat-icon>
                    <div>
                      <h4 class="font-medium">{{ alert.title }}</h4>
                      <p class="text-sm text-gray-600">{{ getEquipmentLabel(alert.equipmentType) }} #{{ alert.equipmentId }}</p>
                    </div>
                  </div>
                  <span class="text-sm text-gray-500">{{ formatTimeAgo(alert.timestamp) }}</span>
                </div>
                <div class="flex justify-end">
                  <button mat-button color="primary" size="small" (click)="viewDetails(alert)">
                    <mat-icon>visibility</mat-icon>
                    Détails
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Configuration des alertes -->
        <mat-card class="mt-8">
          <mat-card-header>
            <mat-card-title>Configuration des Alertes</mat-card-title>
            <mat-card-subtitle>Paramétrez les seuils et notifications</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Seuils batterie -->
              <div>
                <h4 class="font-medium text-gray-800 mb-3">Seuils de batterie</h4>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Alerte batterie faible</span>
                    <mat-form-field appearance="outline" class="w-24">
                      <input matInput type="number" [(ngModel)]="batteryThresholdLow" min="0" max="100">
                      <span matSuffix>%</span>
                    </mat-form-field>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Alerte batterie critique</span>
                    <mat-form-field appearance="outline" class="w-24">
                      <input matInput type="number" [(ngModel)]="batteryThresholdCritical" min="0" max="100">
                      <span matSuffix>%</span>
                    </mat-form-field>
                  </div>
                </div>
              </div>

              <!-- Notifications -->
              <div>
                <h4 class="font-medium text-gray-800 mb-3">Notifications</h4>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Alertes par email</span>
                    <mat-slide-toggle [(ngModel)]="emailNotifications"></mat-slide-toggle>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Alertes par SMS</span>
                    <mat-slide-toggle [(ngModel)]="smsNotifications"></mat-slide-toggle>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Notifications push</span>
                    <mat-slide-toggle [(ngModel)]="pushNotifications"></mat-slide-toggle>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 mt-6">
              <button mat-button (click)="resetSettings()">
                Réinitialiser
              </button>
              <button mat-raised-button color="primary" (click)="saveSettings()">
                <mat-icon>save</mat-icon>
                Enregistrer
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Actions globales -->
        <div class="mt-8 flex justify-end gap-2">
          <button 
            mat-raised-button 
            color="primary"
            (click)="acknowledgeAllAlerts()"
            [disabled]="activeAlerts.length === 0"
          >
            <mat-icon>check_circle</mat-icon>
            Tout reconnaître
          </button>
          <button 
            mat-raised-button 
            color="accent"
            (click)="testAlertSystem()"
          >
            <mat-icon>bug_report</mat-icon>
            Tester le système
          </button>
          <button 
            mat-stroked-button 
            color="warn"
            (click)="exportAlerts()"
          >
            <mat-icon>download</mat-icon>
            Exporter les alertes
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alert-type-battery { color: #F59E0B; }
    .alert-type-state { color: #3B82F6; }
    .alert-type-communication { color: #8B5CF6; }
    .alert-type-performance { color: #10B981; }
    .alert-type-security { color: #EF4444; }
    
    .severity-critical { background-color: #FEE2E2; color: #991B1B; }
    .severity-high { background-color: #FEF3C7; color: #92400E; }
    .severity-medium { background-color: #DBEAFE; color: #1E40AF; }
    .severity-low { background-color: #D1FAE5; color: #065F46; }
  `]
})
export class AlertsComponent implements OnInit {
  private snackBar = inject(MatSnackBar);

  loading = false;
  realtimeEnabled = true;
  
  // Alertes
  alerts: Alert[] = [];
  activeAlerts: Alert[] = [];
  recentResolvedAlerts: Alert[] = [];
  
  // Filtres
  selectedAlertType = 'all';
  selectedSeverity = 'all';
  selectedStatus = 'active';
  
  // Statistiques
  activeAlertsCount = 0;
  unacknowledgedCount = 0;
  criticalAlertsCount = 0;
  resolvedTodayCount = 0;
  
  // Configuration
  batteryThresholdLow = 20;
  batteryThresholdCritical = 10;
  emailNotifications = true;
  smsNotifications = false;
  pushNotifications = true;

  ngOnInit() {
    this.loadAlerts();
    this.startRealtimeUpdates();
  }

  loadAlerts() {
    this.loading = true;
    
    // Simuler le chargement des alertes
    setTimeout(() => {
      this.generateSampleAlerts();
      this.updateStatistics();
      this.filterAlerts();
      this.loading = false;
    }, 1000);
  }

  generateSampleAlerts() {
    this.alerts = [
      {
        id: 1,
        type: 'BATTERY',
        title: 'Batterie faible',
        message: 'Le capteur d\'humidité #123 a une batterie à 15%. Rechargez ou remplacez la batterie.',
        severity: 'HIGH',
        equipmentId: 123,
        equipmentType: 'CAPTEUR',
        exploitationId: 1,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 heures ago
        acknowledged: false,
        resolved: false,
        actions: ['Recharger', 'Programmer maintenance', 'Ignorer 24h']
      },
      {
        id: 2,
        type: 'STATE',
        title: 'Pompe inactive',
        message: 'La pompe d\'irrigation #45 est inactive depuis plus de 12 heures.',
        severity: 'MEDIUM',
        equipmentId: 45,
        equipmentType: 'POMPE',
        exploitationId: 1,
        timestamp: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(), // 13 heures ago
        acknowledged: true,
        resolved: false,
        actions: ['Activer la pompe', 'Vérifier connexion', 'Contacter technicien']
      },
      {
        id: 3,
        type: 'COMMUNICATION',
        title: 'Perte de communication',
        message: 'Le capteur de température #78 n\'a pas communiqué depuis 3 heures.',
        severity: 'CRITICAL',
        equipmentId: 78,
        equipmentType: 'CAPTEUR',
        exploitationId: 2,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 heures ago
        acknowledged: false,
        resolved: false,
        actions: ['Réinitialiser', 'Vérifier signal', 'Remplacer capteur']
      },
      {
        id: 4,
        type: 'PERFORMANCE',
        title: 'Performance dégradée',
        message: 'Le système d\'irrigation montre des performances réduites.',
        severity: 'MEDIUM',
        equipmentId: 101,
        equipmentType: 'SYSTEME',
        exploitationId: 1,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 heure ago
        acknowledged: true,
        resolved: true,
        actions: ['Optimiser', 'Redémarrer', 'Analyser logs']
      },
      {
        id: 5,
        type: 'BATTERY',
        title: 'Batterie critique',
        message: 'Le capteur de pH #56 a une batterie à 5%. Remplacement urgent nécessaire.',
        severity: 'CRITICAL',
        equipmentId: 56,
        equipmentType: 'CAPTEUR',
        exploitationId: 3,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        acknowledged: false,
        resolved: false,
        actions: ['Remplacer immédiatement', 'Commander batterie', 'Mettre hors service']
      }
    ];
  }

  updateStatistics() {
    this.activeAlertsCount = this.alerts.filter(a => !a.resolved).length;
    this.unacknowledgedCount = this.alerts.filter(a => !a.acknowledged && !a.resolved).length;
    this.criticalAlertsCount = this.alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length;
    this.resolvedTodayCount = this.alerts.filter(a => a.resolved).length;
  }

  filterAlerts() {
    let filtered = this.alerts;
    
    // Filtre par type
    if (this.selectedAlertType !== 'all') {
      filtered = filtered.filter(a => a.type === this.selectedAlertType);
    }
    
    // Filtre par sévérité
    if (this.selectedSeverity !== 'all') {
      filtered = filtered.filter(a => a.severity === this.selectedSeverity);
    }
    
    // Filtre par statut
    if (this.selectedStatus === 'active') {
      filtered = filtered.filter(a => !a.resolved);
    } else if (this.selectedStatus === 'acknowledged') {
      filtered = filtered.filter(a => a.acknowledged && !a.resolved);
    } else if (this.selectedStatus === 'resolved') {
      filtered = filtered.filter(a => a.resolved);
    }
    
    // Séparer actives et résolues
    this.activeAlerts = filtered.filter(a => !a.resolved);
    this.recentResolvedAlerts = filtered.filter(a => a.resolved).slice(0, 4);
  }

  getAlertIcon(type: string): string {
    const icons: {[key: string]: string} = {
      'BATTERY': 'battery_alert',
      'STATE': 'power_settings_new',
      'COMMUNICATION': 'wifi_off',
      'PERFORMANCE': 'speed',
      'SECURITY': 'security'
    };
    return icons[type] || 'warning';
  }

  getAlertIconClass(type: string): string {
    return `alert-type-${type.toLowerCase()}`;
  }

  getEquipmentLabel(type: string): string {
    const labels: {[key: string]: string} = {
      'POMPE': 'Pompe',
      'CAPTEUR': 'Capteur',
      'SYSTEME': 'Système',
      'TRACTEUR': 'Tracteur'
    };
    return labels[type] || type;
  }

  getSeverityLabel(severity: string): string {
    const labels: {[key: string]: string} = {
      'CRITICAL': 'Critique',
      'HIGH': 'Haute',
      'MEDIUM': 'Moyenne',
      'LOW': 'Basse'
    };
    return labels[severity] || severity;
  }

  getSeverityClass(severity: string): string {
    const classes: {[key: string]: string} = {
      'CRITICAL': 'severity-critical',
      'HIGH': 'severity-high',
      'MEDIUM': 'severity-medium',
      'LOW': 'severity-low'
    };
    return classes[severity] || 'severity-medium';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
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

  formatTimeAgo(dateString: string): string {
    if (!dateString) return '';
    
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
      return '';
    }
  }

  acknowledgeAlert(alert: Alert) {
    alert.acknowledged = true;
    this.updateStatistics();
    this.snackBar.open('Alerte reconnue', 'Fermer', {
      duration: 3000
    });
  }

  resolveAlert(alert: Alert) {
    alert.resolved = true;
    this.updateStatistics();
    this.filterAlerts();
    this.snackBar.open('Alerte marquée comme résolue', 'Fermer', {
      duration: 3000
    });
  }

  viewEquipment(alert: Alert) {
    const route = alert.equipmentType === 'POMPE' 
      ? `/equipements/pompes/${alert.equipmentId}`
      : `/equipements/capteurs/${alert.equipmentId}`;
    
    this.snackBar.open(`Redirection vers l'équipement...`, 'Fermer', {
      duration: 2000
    });
    // Dans une vraie application: this.router.navigate([route]);
  }

  viewDetails(alert: Alert) {
    this.snackBar.open(`Détails de l'alerte #${alert.id}`, 'Fermer', {
      duration: 3000
    });
  }

  executeAction(alert: Alert, action: string) {
    this.snackBar.open(`Action exécutée: ${action}`, 'Fermer', {
      duration: 3000
    });
  }

  toggleRealtime(event: any) {
    this.realtimeEnabled = event.checked;
    if (this.realtimeEnabled) {
      this.startRealtimeUpdates();
      this.snackBar.open('Surveillance temps réel activée', 'Fermer', {
        duration: 2000
      });
    } else {
      this.stopRealtimeUpdates();
      this.snackBar.open('Surveillance temps réel désactivée', 'Fermer', {
        duration: 2000
      });
    }
  }

  startRealtimeUpdates() {
    if (!this.realtimeEnabled) return;
    
    // Simuler des mises à jour en temps réel
    setInterval(() => {
      this.updateRealtimeData();
    }, 30000); // Toutes les 30 secondes
  }

  stopRealtimeUpdates() {
    // Arrêter les mises à jour en temps réel
  }

  updateRealtimeData() {
    // Simuler de nouvelles alertes
    if (Math.random() > 0.7) {
      const newAlert: Alert = {
        id: this.alerts.length + 1,
        type: ['BATTERY', 'STATE', 'COMMUNICATION'][Math.floor(Math.random() * 3)] as any,
        title: 'Nouvelle alerte détectée',
        message: 'Un nouvel événement nécessite votre attention.',
        severity: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as any,
        equipmentId: Math.floor(Math.random() * 100) + 1,
        equipmentType: Math.random() > 0.5 ? 'CAPTEUR' : 'POMPE',
        exploitationId: Math.floor(Math.random() * 3) + 1,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        resolved: false,
        actions: ['Vérifier', 'Ignorer', 'Planifier']
      };
      
      this.alerts.unshift(newAlert);
      this.updateStatistics();
      this.filterAlerts();
      
      // Notification toast
      this.snackBar.open('Nouvelle alerte détectée', 'Fermer', {
        duration: 3000
      });
    }
  }

  acknowledgeAllAlerts() {
    this.activeAlerts.forEach(alert => {
      alert.acknowledged = true;
    });
    this.updateStatistics();
    this.snackBar.open('Toutes les alertes ont été reconnues', 'Fermer', {
      duration: 3000
    });
  }

  testAlertSystem() {
    // Simuler une alerte de test
    const testAlert: Alert = {
      id: 999,
      type: 'PERFORMANCE',
      title: 'Test du système d\'alertes',
      message: 'Ceci est une alerte de test. Le système fonctionne correctement.',
      severity: 'LOW',
      equipmentId: 0,
      equipmentType: 'SYSTEME',
      exploitationId: 0,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
      actions: ['Confirmer test', 'Ignorer']
    };
    
    this.alerts.unshift(testAlert);
    this.updateStatistics();
    this.filterAlerts();
    
    this.snackBar.open('Test du système d\'alertes effectué', 'Fermer', {
      duration: 3000
    });
  }

  exportAlerts() {
    this.snackBar.open('Export des alertes démarré', 'Fermer', {
      duration: 3000
    });
  }

  saveSettings() {
    this.snackBar.open('Configuration enregistrée', 'Fermer', {
      duration: 3000
    });
  }

  resetSettings() {
    this.batteryThresholdLow = 20;
    this.batteryThresholdCritical = 10;
    this.emailNotifications = true;
    this.smsNotifications = false;
    this.pushNotifications = true;
    
    this.snackBar.open('Configuration réinitialisée', 'Fermer', {
      duration: 3000
    });
  }
}