import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
    let guard: AuthGuard;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['hasToken']);
        routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
        routerSpy.parseUrl.and.returnValue({} as UrlTree);

        TestBed.configureTestingModule({
            providers: [
                AuthGuard,
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        guard = TestBed.inject(AuthGuard);
    });

    it('deve ser criado', () => {
        expect(guard).toBeTruthy();
    });

    it('canActivate() deve retornar true quando o usuário tem token', () => {
        authServiceSpy.hasToken.and.returnValue(true);
        expect(guard.canActivate()).toBeTrue();
    });

    it('canActivate() deve redirecionar para /login quando não há token', () => {
        authServiceSpy.hasToken.and.returnValue(false);
        const result = guard.canActivate();
        expect(routerSpy.parseUrl).toHaveBeenCalledWith('/login');
        expect(result).toBeTruthy();
    });

    it('canActivate() não deve chamar parseUrl quando há token', () => {
        authServiceSpy.hasToken.and.returnValue(true);
        guard.canActivate();
        expect(routerSpy.parseUrl).not.toHaveBeenCalled();
    });
});
