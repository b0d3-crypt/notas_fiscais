import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UsuarioModalComponent, UsuarioModalData } from '../usuarios/components/usuario-modal/usuario-modal.component';

@Component({
  selector: 'sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  get userName(): string {
    return this.authService.getUser()?.nmPessoa ?? '';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isLinkActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  openMeuPerfil(): void {
    const cdWebUser = this.authService.getCdWebUser();
    if (!cdWebUser) return;
    const data: UsuarioModalData = { mode: 'edit', cdWebUser };
    this.dialog.open(UsuarioModalComponent, { data, width: '800px', maxWidth: '95vw' });
  }

  navigateUsuarios(): void {
    this.router.navigate(['/principal/usuarios']);
  }

  logout(): void {
    this.authService.logout();
  }
}
