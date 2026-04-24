import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { SnackbarService } from '../../shared/snackbar.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPageComponent {
  form: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private authService: AuthService,
    private snackbar: SnackbarService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.api
      .post<{ token: string; nmPessoa: string; cdPessoa: number; role: number }>(
        '/auth/login',
        this.form.value
      )
      .subscribe({
        next: (res) => {
          this.authService.setUser(res);
          this.router.navigate(['/principal/despesas']);
        },
        error: (err) => {
          this.loading = false;
          const msg = err?.error?.message ?? 'Credenciais inválidas';
          this.snackbar.error(msg);
        },
      });
  }
}
