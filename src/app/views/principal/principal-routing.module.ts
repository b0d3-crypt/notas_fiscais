import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from '../../guards/admin.guard';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'despesas',
    pathMatch: 'full',
  },
  {
    path: 'despesas',
    loadChildren: () =>
      import('../despesas/despesas.module').then((m) => m.DespesasModule),
  },
  {
    path: 'usuarios',
    loadChildren: () =>
      import('../usuarios/usuarios.module').then((m) => m.UsuariosModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'perfil',
    loadChildren: () =>
      import('../perfil/perfil.module').then((m) => m.PerfilModule),
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrincipalRoutingModule { }
