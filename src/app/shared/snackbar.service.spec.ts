import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarService } from './snackbar.service';

describe('SnackbarService', () => {
    let service: SnackbarService;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        TestBed.configureTestingModule({
            providers: [
                SnackbarService,
                { provide: MatSnackBar, useValue: snackBarSpy },
            ],
        });
        service = TestBed.inject(SnackbarService);
    });

    it('deve ser criado', () => {
        expect(service).toBeTruthy();
    });

    it('success() deve chamar snackBar.open com panel class alert-success', () => {
        service.success('Operação realizada!');
        expect(snackBarSpy.open).toHaveBeenCalledWith(
            'Operação realizada!',
            '✕',
            jasmine.objectContaining({ panelClass: ['alert', 'alert-success'] }),
        );
    });

    it('error() deve chamar snackBar.open com panel class alert-error', () => {
        service.error('Algo deu errado');
        expect(snackBarSpy.open).toHaveBeenCalledWith(
            'Algo deu errado',
            '✕',
            jasmine.objectContaining({ panelClass: ['alert', 'alert-error'] }),
        );
    });

    it('warning() deve chamar snackBar.open com panel class alert-warning', () => {
        service.warning('Atenção');
        expect(snackBarSpy.open).toHaveBeenCalledWith(
            'Atenção',
            '✕',
            jasmine.objectContaining({ panelClass: ['alert', 'alert-warning'] }),
        );
    });

    it('info() deve chamar snackBar.open com panel class alert-default', () => {
        service.info('Informação');
        expect(snackBarSpy.open).toHaveBeenCalledWith(
            'Informação',
            '✕',
            jasmine.objectContaining({ panelClass: ['alert', 'alert-default'] }),
        );
    });

    it('success() deve usar duração padrão de 4000ms', () => {
        service.success('ok');
        expect(snackBarSpy.open).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.objectContaining({ duration: 4000 }),
        );
    });

    it('error() deve usar duração padrão de 5000ms', () => {
        service.error('err');
        expect(snackBarSpy.open).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.objectContaining({ duration: 5000 }),
        );
    });

    it('deve permitir duração customizada', () => {
        service.success('ok', 1000);
        expect(snackBarSpy.open).toHaveBeenCalledWith(
            jasmine.any(String),
            jasmine.any(String),
            jasmine.objectContaining({ duration: 1000 }),
        );
    });
});
