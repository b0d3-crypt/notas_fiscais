import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../api.service';
import { CepService } from './cep.service';

describe('CepService', () => {
    let service: CepService;
    let apiSpy: jasmine.SpyObj<ApiService>;

    beforeEach(() => {
        apiSpy = jasmine.createSpyObj('ApiService', ['get']);
        TestBed.configureTestingModule({
            providers: [
                CepService,
                { provide: ApiService, useValue: apiSpy },
            ],
        });
        service = TestBed.inject(CepService);
    });

    it('deve ser criado', () => {
        expect(service).toBeTruthy();
    });

    it('buscar() deve remover máscara do CEP antes de chamar a API', () => {
        apiSpy.get.and.returnValue(of({}));
        service.buscar('45055-390').subscribe();
        expect(apiSpy.get).toHaveBeenCalledWith('/api/correios/45055390');
    });

    it('buscar() deve passar CEP numérico sem modificação', () => {
        apiSpy.get.and.returnValue(of({}));
        service.buscar('45055390').subscribe();
        expect(apiSpy.get).toHaveBeenCalledWith('/api/correios/45055390');
    });

    it('buscar() deve remover qualquer caractere não-numérico', () => {
        apiSpy.get.and.returnValue(of({}));
        service.buscar('45.055-390').subscribe();
        expect(apiSpy.get).toHaveBeenCalledWith('/api/correios/45055390');
    });
});
