// supervision/supervision.module.ts (mis à jour)
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SUPERVISION_ROUTES } from './supervision.routes';

// Import des composants (standalone)
import { SupervisionDashboardComponent } from './pages/supervision-dashboard/supervision-dashboard.component';
import { LogsListComponent } from './pages/logs-list/logs-list.component';
import { CriticalLogsComponent } from './pages/critical-logs/critical-logs.component';
import { UnprocessedLogsComponent } from './pages/unprocessed-logs/unprocessed-logs.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { AlertsComponent } from './pages/alerts/alerts.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SUPERVISION_ROUTES),
    // Import des composants standalone
    SupervisionDashboardComponent,
    LogsListComponent,
    CriticalLogsComponent,
    UnprocessedLogsComponent,
    StatisticsComponent,
    AlertsComponent
  ]
})
export class SupervisionModule { }