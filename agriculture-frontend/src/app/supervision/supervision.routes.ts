// supervision/supervision.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const SUPERVISION_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/supervision-dashboard/supervision-dashboard.component')
      .then(m => m.SupervisionDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'logs',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/logs-list/logs-list.component')
          .then(m => m.LogsListComponent),
        canActivate: [authGuard]
      },
   
      {
        path: 'critical',
        loadComponent: () => import('./pages/critical-logs/critical-logs.component')
          .then(m => m.CriticalLogsComponent),
        canActivate: [authGuard]
      },
      {
        path: 'unprocessed',
        loadComponent: () => import('./pages/unprocessed-logs/unprocessed-logs.component')
          .then(m => m.UnprocessedLogsComponent),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: 'statistiques',
    loadComponent: () => import('./pages/statistics/statistics.component')
      .then(m => m.StatisticsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'alertes',
    loadComponent: () => import('./pages/alerts/alerts.component')
      .then(m => m.AlertsComponent),
    canActivate: [authGuard]
  }
];