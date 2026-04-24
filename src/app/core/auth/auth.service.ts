import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface AuthUser {
  token: string;
  nmPessoa: string;
  cdPessoa: number;
  role: number;
}

const STORAGE_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private router: Router) {}

  setUser(user: AuthUser): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.isAuthenticated$.next(true);
  }

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getToken(): string | null {
    return this.getUser()?.token ?? null;
  }

  getCdPessoa(): number | null {
    return this.getUser()?.cdPessoa ?? null;
  }

  getRole(): number | null {
    return this.getUser()?.role ?? null;
  }

  hasToken(): boolean {
    return !!localStorage.getItem(STORAGE_KEY);
  }

  isAdmin(): boolean {
    return this.getRole() === 0;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.isAuthenticated$.next(false);
    this.router.navigate(['/login']);
  }
}
