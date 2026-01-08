import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Connexion - Agriculture System'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Inscription - Agriculture System'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];