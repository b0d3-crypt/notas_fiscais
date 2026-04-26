import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
            ],
        });

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('deve adicionar o header Authorization quando há token', () => {
        authServiceSpy.getToken.and.returnValue('meu-token');
        http.get('/test').subscribe();
        const req = httpMock.expectOne('/test');
        expect(req.request.headers.get('Authorization')).toBe('Bearer meu-token');
        req.flush({});
    });

    it('não deve adicionar header Authorization quando não há token', () => {
        authServiceSpy.getToken.and.returnValue(null);
        http.get('/test').subscribe();
        const req = httpMock.expectOne('/test');
        expect(req.request.headers.has('Authorization')).toBeFalse();
        req.flush({});
    });

    it('deve chamar logout ao receber erro 401', () => {
        authServiceSpy.getToken.and.returnValue('meu-token');
        http.get('/test').subscribe({ error: () => { } });
        const req = httpMock.expectOne('/test');
        req.flush('Não autorizado', { status: 401, statusText: 'Unauthorized' });
        expect(authServiceSpy.logout).toHaveBeenCalled();
    });

    it('não deve chamar logout em erros não-401', () => {
        authServiceSpy.getToken.and.returnValue('meu-token');
        let errorStatus = 0;
        http.get('/test').subscribe({ error: (e) => (errorStatus = e.status) });
        const req = httpMock.expectOne('/test');
        req.flush('Erro interno', { status: 500, statusText: 'Internal Server Error' });
        expect(errorStatus).toBe(500);
        expect(authServiceSpy.logout).not.toHaveBeenCalled();
    });

    it('deve propagar o erro original ao caller', () => {
        authServiceSpy.getToken.and.returnValue(null);
        let receivedError: any;
        http.get('/test').subscribe({ error: (e) => (receivedError = e) });
        const req = httpMock.expectOne('/test');
        req.flush('Não encontrado', { status: 404, statusText: 'Not Found' });
        expect(receivedError.status).toBe(404);
    });
});
