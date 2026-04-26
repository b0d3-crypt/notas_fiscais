import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let routerSpy: jasmine.SpyObj<Router>;

    const mockUser: AuthUser = {
        token: 'abc123',
        nmPessoa: 'João Silva',
        cdPessoa: 1,
        cdWebUser: 2,
        role: 0,
    };

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        TestBed.configureTestingModule({
            providers: [
                AuthService,
                { provide: Router, useValue: routerSpy },
            ],
        });
        service = TestBed.inject(AuthService);
        localStorage.clear();
    });

    afterEach(() => localStorage.clear());

    it('deve ser criado', () => {
        expect(service).toBeTruthy();
    });

    // ---- setUser / getUser ----

    it('setUser() deve armazenar o usuário no localStorage', () => {
        service.setUser(mockUser);
        expect(localStorage.getItem('auth_user')).toBeTruthy();
    });

    it('getUser() deve retornar o usuário armazenado', () => {
        service.setUser(mockUser);
        expect(service.getUser()).toEqual(mockUser);
    });

    it('getUser() deve retornar null quando não houver usuário', () => {
        expect(service.getUser()).toBeNull();
    });

    // ---- getToken ----

    it('getToken() deve retornar o token do usuário', () => {
        service.setUser(mockUser);
        expect(service.getToken()).toBe('abc123');
    });

    it('getToken() deve retornar null quando não autenticado', () => {
        expect(service.getToken()).toBeNull();
    });

    // ---- getCdPessoa / getCdWebUser / getRole ----

    it('getCdPessoa() deve retornar o cdPessoa correto', () => {
        service.setUser(mockUser);
        expect(service.getCdPessoa()).toBe(1);
    });

    it('getCdWebUser() deve retornar o cdWebUser correto', () => {
        service.setUser(mockUser);
        expect(service.getCdWebUser()).toBe(2);
    });

    it('getRole() deve retornar a role correta', () => {
        service.setUser(mockUser);
        expect(service.getRole()).toBe(0);
    });

    // ---- hasToken ----

    it('hasToken() deve retornar true quando há usuário armazenado', () => {
        service.setUser(mockUser);
        expect(service.hasToken()).toBeTrue();
    });

    it('hasToken() deve retornar false quando não há usuário', () => {
        expect(service.hasToken()).toBeFalse();
    });

    // ---- isAdmin ----

    it('isAdmin() deve retornar true quando role é 0', () => {
        service.setUser({ ...mockUser, role: 0 });
        expect(service.isAdmin()).toBeTrue();
    });

    it('isAdmin() deve retornar false quando role não é 0', () => {
        service.setUser({ ...mockUser, role: 1 });
        expect(service.isAdmin()).toBeFalse();
    });

    // ---- isAuthenticated$ ----

    it('isAuthenticated$ deve emitir true após setUser()', () => {
        let value = false;
        service.isAuthenticated$.subscribe(v => (value = v));
        service.setUser(mockUser);
        expect(value).toBeTrue();
    });

    it('isAuthenticated$ deve emitir false após logout()', () => {
        service.setUser(mockUser);
        service.logout();
        let value = true;
        service.isAuthenticated$.subscribe(v => (value = v));
        expect(value).toBeFalse();
    });

    // ---- logout ----

    it('logout() deve remover o usuário do localStorage', () => {
        service.setUser(mockUser);
        service.logout();
        expect(localStorage.getItem('auth_user')).toBeNull();
    });

    it('logout() deve navegar para /login', () => {
        service.setUser(mockUser);
        service.logout();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
});
