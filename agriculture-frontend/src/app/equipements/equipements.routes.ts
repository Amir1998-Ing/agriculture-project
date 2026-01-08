// equipements/equipements.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const EQUIPEMENTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/equipement-dashboard/equipement-dashboard.component')
      .then(m => m.EquipementDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pompes',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/pompes-list/pompes-list.component')
          .then(m => m.PompesListComponent),
        canActivate: [authGuard]
      },
      {
        path: 'nouveau',
        loadComponent: () => import('./pages/pompe-create/pompe-create.component')
          .then(m => m.PompeCreateComponent),
        canActivate: [authGuard]
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/pompe-detail/pompe-detail.component')
          .then(m => m.PompeDetailComponent),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: 'capteurs',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/capteur-list/capteurs-list.component')
          .then(m => m.CapteursListComponent),
        canActivate: [authGuard]
      },
      {
        path: 'nouveau',
        loadComponent: () => import('./pages/capteur-create/capteur-create.component')
          .then(m => m.CapteurCreateComponent),
        canActivate: [authGuard]
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/capteur-detail/capteur-detail.component')
          .then(m => m.CapteurDetailComponent),
        canActivate: [authGuard]
      }
    ]
  }
];