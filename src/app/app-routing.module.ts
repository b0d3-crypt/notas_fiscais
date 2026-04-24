import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { SidenavComponent } from './views/sidenav/sidenav.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./views/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'principal',
    component: SidenavComponent,
    loadChildren: () =>
      import('./views/principal/principal.module').then((m) => m.PrincipalModule),
    canActivate: [AuthGuard],
  },
  { path: 'despesas', redirectTo: 'principal/despesas', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
