import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { ApiResponse, ApiService } from './api.service';

describe('ApiService', () => {
    let service: ApiService;
    let httpMock: HttpTestingController;
    const base = environment.apiUrl;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ApiService],
        });
        service = TestBed.inject(ApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('deve ser criado', () => {
        expect(service).toBeTruthy();
    });

    it('get() deve desempacotar ApiResponse.data', () => {
        const mockData = [{ id: 1, name: 'item' }];
        service.get<typeof mockData>('/api/test').subscribe((data) => {
            expect(data).toEqual(mockData);
        });
        const req = httpMock.expectOne(`${base}/api/test`);
        expect(req.request.method).toBe('GET');
        req.flush({ data: mockData, message: 'ok' } as ApiResponse<typeof mockData>);
    });

    it('post() deve desempacotar ApiResponse.data', () => {
        service.post<{ id: number }>('/api/test', { name: 'novo' }).subscribe((data) => {
            expect(data.id).toBe(42);
        });
        const req = httpMock.expectOne(`${base}/api/test`);
        expect(req.request.method).toBe('POST');
        req.flush({ data: { id: 42 }, message: 'criado' } as ApiResponse<{ id: number }>);
    });

    it('put() deve enviar requisição PUT e desempacotar resposta', () => {
        service.put<{ updated: boolean }>('/api/test/1', { name: 'atualizado' }).subscribe((data) => {
            expect(data.updated).toBeTrue();
        });
        const req = httpMock.expectOne(`${base}/api/test/1`);
        expect(req.request.method).toBe('PUT');
        req.flush({ data: { updated: true }, message: 'ok' });
    });

    it('delete() deve enviar requisição DELETE', () => {
        service.delete('/api/test/1').subscribe();
        const req = httpMock.expectOne(`${base}/api/test/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    it('download() deve retornar um Blob', () => {
        service.download('/api/test/file').subscribe((blob) => {
            expect(blob instanceof Blob).toBeTrue();
        });
        const req = httpMock.expectOne(`${base}/api/test/file`);
        expect(req.request.responseType).toBe('blob');
        req.flush(new Blob(['conteúdo'], { type: 'application/pdf' }));
    });

    it('get() deve passar query params corretamente', () => {
        service.get<unknown[]>('/api/test', { page: 1, size: 10 }).subscribe();
        const req = httpMock.expectOne((r) => r.url === `${base}/api/test`);
        expect(req.request.params.get('page')).toBe('1');
        expect(req.request.params.get('size')).toBe('10');
        req.flush({ data: [], message: 'ok' });
    });
});
