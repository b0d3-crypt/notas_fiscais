import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { DespesaService } from '../../services/despesa.service';
import { SnackbarService } from '../../shared/snackbar.service';
import { DespesaListItem, DespesasPageComponent } from './despesas.page';

describe('DespesasPageComponent', () => {
    let component: DespesasPageComponent;
    let fixture: ComponentFixture<DespesasPageComponent>;
    let despesaSpy: jasmine.SpyObj<DespesaService>;
    let authSpy: jasmine.SpyObj<AuthService>;
    let snackbarSpy: jasmine.SpyObj<SnackbarService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    const mockItem: DespesaListItem = {
        cdDescricaoDespesa: 1,
        nmPessoa: 'João',
        cdPessoa: 10,
        nmArquivo: 'nota.pdf',
        tpArquivo: 1,
        dtDespesa: '2025-01-01',
        vlDespesa: 150.0,
        cdArquivo: 5,
    };

    beforeEach(async () => {
        despesaSpy = jasmine.createSpyObj('DespesaService', ['findAll', 'delete', 'download']);
        authSpy = jasmine.createSpyObj('AuthService', ['isAdmin', 'getCdPessoa', 'logout']);
        snackbarSpy = jasmine.createSpyObj('SnackbarService', ['success', 'error']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

        despesaSpy.findAll.and.returnValue(of([]));
        authSpy.isAdmin.and.returnValue(false);
        authSpy.getCdPessoa.and.returnValue(null);

        await TestBed.configureTestingModule({
            declarations: [DespesasPageComponent],
            providers: [
                { provide: DespesaService, useValue: despesaSpy },
                { provide: AuthService, useValue: authSpy },
                { provide: SnackbarService, useValue: snackbarSpy },
                { provide: MatDialog, useValue: dialogSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DespesasPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('deve ser criado', () => expect(component).toBeTruthy());

    it('deve chamar findAll() no ngOnInit', () => {
        expect(despesaSpy.findAll).toHaveBeenCalled();
    });

    describe('loadDespesas()', () => {
        it('deve popular tableData ao carregar com sucesso', () => {
            despesaSpy.findAll.and.returnValue(of([mockItem]));
            component.loadDespesas();
            expect(component.tableData).toEqual([mockItem]);
            expect(component.loading).toBeFalse();
        });

        it('deve exibir snackbar de erro ao falhar', () => {
            despesaSpy.findAll.and.returnValue(throwError(() => new Error()));
            component.loadDespesas();
            expect(snackbarSpy.error).toHaveBeenCalledWith('Erro ao carregar despesas');
            expect(component.loading).toBeFalse();
        });
    });

    describe('canEditOrDelete()', () => {
        it('deve retornar false para não-admin sem ser dono', () => {
            expect(component.canEditOrDelete(mockItem)).toBeFalse();
        });
    });

    describe('confirmDelete()', () => {
        it('deve chamar delete ao confirmar', () => {
            spyOn(window, 'confirm').and.returnValue(true);
            despesaSpy.delete.and.returnValue(of(undefined));
            despesaSpy.findAll.and.returnValue(of([]));
            const event = new MouseEvent('click');
            component.confirmDelete(event, mockItem);
            expect(despesaSpy.delete).toHaveBeenCalledWith(1);
        });

        it('deve exibir snackbar de sucesso após exclusão', () => {
            spyOn(window, 'confirm').and.returnValue(true);
            despesaSpy.delete.and.returnValue(of(undefined));
            despesaSpy.findAll.and.returnValue(of([]));
            const event = new MouseEvent('click');
            component.confirmDelete(event, mockItem);
            expect(snackbarSpy.success).toHaveBeenCalledWith('Despesa excluída com sucesso');
        });

        it('não deve chamar delete quando usuário cancela', () => {
            spyOn(window, 'confirm').and.returnValue(false);
            const event = new MouseEvent('click');
            component.confirmDelete(event, mockItem);
            expect(despesaSpy.delete).not.toHaveBeenCalled();
        });

        it('deve exibir snackbar de erro ao falhar', () => {
            spyOn(window, 'confirm').and.returnValue(true);
            despesaSpy.delete.and.returnValue(throwError(() => new Error()));
            const event = new MouseEvent('click');
            component.confirmDelete(event, mockItem);
            expect(snackbarSpy.error).toHaveBeenCalledWith('Erro ao excluir despesa');
        });

        it('deve chamar stopPropagation no evento', () => {
            spyOn(window, 'confirm').and.returnValue(false);
            const event = new MouseEvent('click');
            spyOn(event, 'stopPropagation');
            component.confirmDelete(event, mockItem);
            expect(event.stopPropagation).toHaveBeenCalled();
        });
    });

    describe('openCreateModal()', () => {
        it('deve abrir o dialog', () => {
            const refSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            refSpy.afterClosed.and.returnValue(of(false));
            dialogSpy.open.and.returnValue(refSpy);
            component.openCreateModal();
            expect(dialogSpy.open).toHaveBeenCalled();
        });

        it('deve recarregar quando dialog fecha com true', () => {
            const refSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            refSpy.afterClosed.and.returnValue(of(true));
            dialogSpy.open.and.returnValue(refSpy);
            despesaSpy.findAll.and.returnValue(of([mockItem]));
            component.openCreateModal();
            expect(despesaSpy.findAll).toHaveBeenCalled();
        });

        it('não deve recarregar quando dialog fecha com false', () => {
            const refSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            refSpy.afterClosed.and.returnValue(of(false));
            dialogSpy.open.and.returnValue(refSpy);
            despesaSpy.findAll.calls.reset();
            component.openCreateModal();
            expect(despesaSpy.findAll).not.toHaveBeenCalled();
        });
    });

    describe('openRowModal()', () => {
        it('deve abrir em modo "view" para não-admin sem permissão', () => {
            const refSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            refSpy.afterClosed.and.returnValue(of(false));
            dialogSpy.open.and.returnValue(refSpy);
            component.openRowModal(mockItem);
            const [, config] = dialogSpy.open.calls.mostRecent().args;
            expect((config as any).data.mode).toBe('view');
        });
    });

    describe('logout()', () => {
        it('deve chamar authService.logout()', () => {
            component.logout();
            expect(authSpy.logout).toHaveBeenCalled();
        });
    });
});
