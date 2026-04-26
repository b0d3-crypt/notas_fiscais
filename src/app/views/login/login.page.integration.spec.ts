/**
 * Teste de integração do LoginPageComponent.
 *
 * Diferente dos testes unitários (login.page.spec.ts), aqui o componente é
 * renderizado com template real + módulos Angular Material + HTTP mockado,
 * validando o fluxo completo de interação DOM → lógica → HTTP.
 */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { ApiService } from '../../shared/api.service';
import { SnackbarService } from '../../shared/snackbar.service';
import { LoginPageComponent } from './login.page';

describe('LoginPageComponent (integração)', () => {
    let component: LoginPageComponent;
    let fixture: ComponentFixture<LoginPageComponent>;
    let httpMock: HttpTestingController;
    let authService: AuthService;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        localStorage.clear();

        await TestBed.configureTestingModule({
            declarations: [LoginPageComponent],
            imports: [
                HttpClientTestingModule,
                BrowserAnimationsModule,
                ReactiveFormsModule,
                MatInputModule,
                MatButtonModule,
                MatFormFieldModule,
                MatIconModule,
                MatProgressSpinnerModule,
                MatSnackBarModule,
            ],
            providers: [
                ApiService,
                AuthService,
                SnackbarService,
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginPageComponent);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        authService = TestBed.inject(AuthService);
        fixture.detectChanges();
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('deve renderizar o formulário de login', () => {
        expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
    });

    it('deve exibir erros de validação ao submeter formulário vazio', fakeAsync(() => {
        const form = component.form;
        component.onSubmit();
        fixture.detectChanges();
        tick();

        expect(form.get('email')?.touched).toBeTrue();
        expect(form.get('password')?.touched).toBeTrue();
        expect(form.invalid).toBeTrue();
    }));

    it('deve fazer requisição HTTP e navegar ao fazer login com sucesso', fakeAsync(() => {
        const mockResponse = {
            data: { token: 'jwt-token', nmPessoa: 'João', cdPessoa: 1, cdWebUser: 2, role: 0 },
            message: 'ok',
        };

        component.form.patchValue({ email: 'joao@example.com', password: 'senha123' });
        component.onSubmit();
        fixture.detectChanges();

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ email: 'joao@example.com', password: 'senha123' });

        req.flush(mockResponse);
        tick();
        fixture.detectChanges();

        expect(authService.getToken()).toBe('jwt-token');
        expect(authService.getUser()?.nmPessoa).toBe('João');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/principal/despesas']);
    }));

    it('deve armazenar o usuário no localStorage após login bem-sucedido', fakeAsync(() => {
        const mockResponse = {
            data: { token: 'jwt-token', nmPessoa: 'Maria', cdPessoa: 5, cdWebUser: 3, role: 1 },
            message: 'ok',
        };

        component.form.patchValue({ email: 'maria@example.com', password: 'senha456' });
        component.onSubmit();

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
        req.flush(mockResponse);
        tick();

        expect(localStorage.getItem('auth_user')).toBeTruthy();
        const stored = JSON.parse(localStorage.getItem('auth_user')!);
        expect(stored.role).toBe(1);
    }));

    it('deve exibir snackbar e manter formulário ao receber erro 401', fakeAsync(() => {
        const snackbarService = TestBed.inject(SnackbarService);
        spyOn(snackbarService, 'error');

        component.form.patchValue({ email: 'errado@example.com', password: 'senhaerrada' });
        component.onSubmit();

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
        req.flush({ message: 'Credenciais inválidas' }, { status: 401, statusText: 'Unauthorized' });
        tick();
        fixture.detectChanges();

        expect(snackbarService.error).toHaveBeenCalled();
        expect(component.loading).toBeFalse();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    }));
});
