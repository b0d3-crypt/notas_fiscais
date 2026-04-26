import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ApiService } from '../../shared/api.service';
import { SnackbarService } from '../../shared/snackbar.service';
import { LoginPageComponent } from './login.page';

describe('LoginPageComponent', () => {
    let component: LoginPageComponent;
    let fixture: ComponentFixture<LoginPageComponent>;
    let apiSpy: jasmine.SpyObj<ApiService>;
    let authSpy: jasmine.SpyObj<AuthService>;
    let snackbarSpy: jasmine.SpyObj<SnackbarService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        apiSpy = jasmine.createSpyObj('ApiService', ['post']);
        authSpy = jasmine.createSpyObj('AuthService', ['setUser']);
        snackbarSpy = jasmine.createSpyObj('SnackbarService', ['error']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [LoginPageComponent],
            imports: [ReactiveFormsModule],
            providers: [
                { provide: ApiService, useValue: apiSpy },
                { provide: AuthService, useValue: authSpy },
                { provide: SnackbarService, useValue: snackbarSpy },
                { provide: Router, useValue: routerSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('deve ser criado', () => expect(component).toBeTruthy());

    // ---- Formulário ----

    describe('form', () => {
        it('deve iniciar inválido', () => {
            expect(component.form.invalid).toBeTrue();
        });

        it('deve invalidar email em formato incorreto', () => {
            component.form.patchValue({ email: 'nao-é-email', password: '123456' });
            expect(component.form.get('email')?.invalid).toBeTrue();
        });

        it('deve invalidar password com menos de 6 caracteres', () => {
            component.form.patchValue({ email: 'a@b.com', password: '123' });
            expect(component.form.get('password')?.invalid).toBeTrue();
        });

        it('deve ser válido com email e senha corretos', () => {
            component.form.patchValue({ email: 'usuario@example.com', password: '123456' });
            expect(component.form.valid).toBeTrue();
        });

        it('deve invalidar email vazio', () => {
            component.form.patchValue({ email: '', password: '123456' });
            expect(component.form.get('email')?.invalid).toBeTrue();
        });

        it('deve invalidar password vazio', () => {
            component.form.patchValue({ email: 'a@b.com', password: '' });
            expect(component.form.get('password')?.invalid).toBeTrue();
        });
    });

    // ---- onSubmit ----

    describe('onSubmit()', () => {
        it('não deve chamar a API quando o formulário é inválido', () => {
            component.onSubmit();
            expect(apiSpy.post).not.toHaveBeenCalled();
        });

        it('deve marcar todos os campos como touched ao submeter formulário inválido', () => {
            component.onSubmit();
            expect(component.form.get('email')?.touched).toBeTrue();
            expect(component.form.get('password')?.touched).toBeTrue();
        });

        it('deve chamar a API com as credenciais corretas', () => {
            const mockRes = { token: 'tok', nmPessoa: 'João', cdPessoa: 1, cdWebUser: 1, role: 0 };
            apiSpy.post.and.returnValue(of(mockRes));
            component.form.patchValue({ email: 'usuario@example.com', password: '123456' });
            component.onSubmit();
            expect(apiSpy.post).toHaveBeenCalledWith(
                '/auth/login',
                jasmine.objectContaining({ email: 'usuario@example.com', password: '123456' }),
            );
        });

        it('deve salvar o usuário e navegar para /principal/despesas no sucesso', () => {
            const mockRes = { token: 'tok', nmPessoa: 'João', cdPessoa: 1, cdWebUser: 1, role: 0 };
            apiSpy.post.and.returnValue(of(mockRes));
            component.form.patchValue({ email: 'usuario@example.com', password: '123456' });
            component.onSubmit();
            expect(authSpy.setUser).toHaveBeenCalledWith(mockRes);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/principal/despesas']);
        });

        it('deve exibir snackbar de erro com mensagem da API', () => {
            apiSpy.post.and.returnValue(
                throwError(() => ({ error: { message: 'Usuário não encontrado' } })),
            );
            component.form.patchValue({ email: 'usuario@example.com', password: '123456' });
            component.onSubmit();
            expect(snackbarSpy.error).toHaveBeenCalledWith('Usuário não encontrado');
        });

        it('deve usar mensagem padrão quando a API não retorna mensagem', () => {
            apiSpy.post.and.returnValue(throwError(() => ({})));
            component.form.patchValue({ email: 'usuario@example.com', password: '123456' });
            component.onSubmit();
            expect(snackbarSpy.error).toHaveBeenCalledWith('Credenciais inválidas');
        });

        it('deve definir loading=false após erro', () => {
            apiSpy.post.and.returnValue(throwError(() => ({})));
            component.form.patchValue({ email: 'usuario@example.com', password: '123456' });
            component.onSubmit();
            expect(component.loading).toBeFalse();
        });
    });
});
