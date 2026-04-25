import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
  constructor(private authService: AuthService, private router: Router) { }

  get userName(): string {
    return this.authService.getUser()?.nmPessoa ?? '';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isLinkActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  logout(): void {
    this.authService.logout();
  }
}
