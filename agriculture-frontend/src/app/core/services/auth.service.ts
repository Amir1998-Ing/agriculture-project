import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadUserFromStorage();
  }
  
  private loadUserFromStorage(): void {
    if (this.isBrowser) {
      const token = this.getToken();
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          const user: User = {
            id: decoded.id || decoded.userId || 0,
            username: decoded.sub || decoded.username || '',
            email: decoded.email || '',
            role: decoded.role || 'USER',
            enabled: decoded.enabled || true,
            createdAt: decoded.createdAt || new Date().toISOString()
          };
          this.currentUserSubject.next(user);
        } catch (error) {
          console.error('Erreur lors du décodage du token:', error);
          this.logout();
        }
      }
    }
  }
  
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.authApi}/register`, 
      request
    ).pipe(
      tap(response => this.setToken(response.token))
    );
  }
  
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.authApi}/login`, 
      request
    ).pipe(
      tap(response => this.setToken(response.token))
    );
  }
  
 validateToken(token: string): Observable<boolean> {
 
  try {
    const decoded: any = jwtDecode(token);
    const isExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : false;
    return of(!isExpired);
  } catch (error) {
    return of(false);
  }
 }
  getUserInfo(id: number): Observable<User> {
    return this.http.get<User>(`${environment.authApi}/user/${id}`);
  }
  
  setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(environment.tokenKey, token);
      this.loadUserFromStorage();
    }
  }
  
  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(environment.tokenKey);
    }
    return null;
  }
  
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(environment.tokenKey);
    }
    this.currentUserSubject.next(null);
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'ADMIN';
  }
  
  isAgriculteur(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'AGRICULTEUR';
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}