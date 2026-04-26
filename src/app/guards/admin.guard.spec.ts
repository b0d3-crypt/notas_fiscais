import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
    let guard: AdminGuard;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['hasToken', 'isAdmin']);
        routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
        routerSpy.parseUrl.and.returnValue({} as UrlTree);

        TestBed.configureTestingModule({
            providers: [
                AdminGuard,
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        guard = TestBed.inject(AdminGuard);
    });

    it('deve ser criado', () => {
        expect(guard).toBeTruthy();
    });

    it('canActivate() deve retornar true quando o usuário tem token e é admin', () => {
        authServiceSpy.hasToken.and.returnValue(true);
        authServiceSpy.isAdmin.and.returnValue(true);
        expect(guard.canActivate()).toBeTrue();
    });

    it('canActivate() deve redirecionar quando o usuário não é admin', () => {
        authServiceSpy.hasToken.and.returnValue(true);
        authServiceSpy.isAdmin.and.returnValue(false);
        const result = guard.canActivate();
        expect(routerSpy.parseUrl).toHaveBeenCalledWith('/principal/despesas');
        expect(result).toBeTruthy();
    });

    it('canActivate() deve redirecionar quando não há token', () => {
        authServiceSpy.hasToken.and.returnValue(false);
        authServiceSpy.isAdmin.and.returnValue(false);
        guard.canActivate();
        expect(routerSpy.parseUrl).toHaveBeenCalledWith('/principal/despesas');
    });

    it('canActivate() deve redirecionar quando há token mas não é admin', () => {
        authServiceSpy.hasToken.and.returnValue(true);
        authServiceSpy.isAdmin.and.returnValue(false);
        guard.canActivate();
        expect(routerSpy.parseUrl).toHaveBeenCalledWith('/principal/despesas');
    });
});
