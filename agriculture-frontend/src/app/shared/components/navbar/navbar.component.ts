import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isMenuCollapsed = true;
  currentUser: any = null;
  
  // Service public pour l'utiliser dans le template
  authService = inject(AuthService);

  ngOnInit(): void {
    // Initialiser avec l'utilisateur actuel
    this.currentUser = this.authService.getCurrentUser();
    
    // S'abonner aux changements
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.isMenuCollapsed = true;
  }

  getUserInitials(): string {
    if (!this.currentUser?.username) return '?';
    return this.currentUser.username.charAt(0).toUpperCase();
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

  // Méthodes pour simplifier le template
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}