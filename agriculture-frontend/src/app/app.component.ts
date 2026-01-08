import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';  // ENLEVEZ RouterLink et RouterLinkActive
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,  // GARDEZ SEULEMENT RouterOutlet
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Agriculture Management System';
  
  constructor(public authService: AuthService) {}
  
  ngOnInit(): void {
    // Initialisation
  }
}