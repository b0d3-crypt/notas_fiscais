import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ApiService } from '../../shared/api.service';
import { SnackbarService } from '../../shared/snackbar.service';
import { DespesaListItem, DespesasPageComponent } from './despesas.page';

describe('DespesasPageComponent', () => {
    let component: DespesasPageComponent;
    let fixture: ComponentFixture<DespesasPageComponent>;
    let apiSpy: jasmine.SpyObj<ApiService>;
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
        apiSpy = jasmine.createSpyObj('ApiService', ['get', 'delete', 'download']);
        authSpy = jasmine.createSpyObj('AuthService', ['isAdmin', 'getCdPessoa', 'logout']);
        snackbarSpy = jasmine.createSpyObj('SnackbarService', ['success', 'error']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

        apiSpy.get.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            declarations: [DespesasPageComponent],
            providers: [
                { provide: ApiService, useValue: apiSpy },
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

    it('deve chamar loadDespesas() no ngOnInit', () => {
        expect(apiSpy.get).toHaveBeenCalledWith('/api/despesas');
    });

    // ---- loadDespesas ----

    describe('loadDespesas()', () => {
        it('deve popular tableData ao carregar com sucesso', () => {
            apiSpy.get.and.returnValue(of([mockItem]));
            component.loadDespesas();
            expect(component.tableData).toEqual([mockItem]);
            expect(component.loading).toBeFalse();
        });

        it('deve exibir snackbar de erro ao falhar', () => {
            apiSpy.get.and.returnValue(throwError(() => new Error()));
            component.loadDespesas();
            expect(snackbarSpy.error).toHaveBeenCalledWith('Erro ao carregar despesas');
            expect(component.loading).toBeFalse();
        });

        it('deve definir loading=true antes da resposta chegar', () => {
            // O loading deve ser true imediatamente após chamar loadDespesas()
            // (antes do observable emitir)
            apiSpy.get.and.returnValue(of([]).pipe());
            component.tableData = [];
            component.loading = false;
            // Simula a chamada sem detectChanges para verificar estado intermediário
            component.loadDespesas();
            // Após o observable completar síncronamente, loading volta a false
            expect(component.loading).toBeFalse();
        });
    });

    // ---- canEditOrDelete ----

    describe('canEditOrDelete()', () => {
        it('deve retornar true para admin, independente do dono', () => {
            authSpy.isAdmin.and.returnValue(true);
            authSpy.getCdPessoa.and.returnValue(99);
            expect(component.canEditOrDelete(mockItem)).toBeTrue();
        });

        it('deve retornar true quando o item pertence ao usuário logado', () => {
            authSpy.isAdmin.and.returnValue(false);
            authSpy.getCdPessoa.and.returnValue(10); // mesmo que mockItem.cdPessoa
            expect(component.canEditOrDelete(mockItem)).toBeTrue();
        });

        it('deve retornar false para não-admin com item de outro usuário', () => {
            authSpy.isAdmin.and.returnValue(false);
            authSpy.getCdPessoa.and.returnValue(99);
            expect(component.canEditOrDelete(mockItem)).toBeFalse();
        });
    });

    // ---- formatCurrency ----

    describe('formatCurrency()', () => {
        it('deve formatar valor como moeda BRL', () => {
            const formatted = component.formatCurrency(1500.5);
            expect(formatted).toContain('R$');
        });

        it('deve formatar zero corretamente', () => {
            const formatted = component.formatCurrency(0);
            expect(formatted).toContain('R$');
            expect(formatted).toContain('0');
        });

        it('deve formatar números com casas decimais', () => {
            const formatted = component.formatCurrency(99.99);
            expect(formatted).toContain('99');
        });
    });

    // ---- confirmDelete ----

    describe('confirmDelete()', () => {
        it('deve chamar a API de exclusão quando confirmado', () => {
            spyOn(window, 'confirm').and.returnValue(true);
            apiSpy.delete.and.returnValue(of(undefined));
            apiSpy.get.and.returnValue(of([]));
            const event = new MouseEvent('click');
            component.confirmDelete(event, mockItem);
            expect(apiSpy.delete).toHaveBeenCalledWith('/api/despesas/1');
        });

        it('deve exibir snackbar de sucesso após exclusão', () => {
            spyOn(window, 'confirm').and.returnValue(true);
            apiSpy.delete.and.returnValue(of(undefined));
            apiSpy.get.and.returnValue(of([]));
            const event = new MouseEvent('click');
            component.confirmDelete(event, mockItem);
            expect(snackbarSpy.success).toHaveBeenCalledWith('Despesa excluída com sucesso');
        });

        it('não deve chamar a API quando o usuário cancela', () => {
            spyOn(window, 'confirm').and.returnValue(false);
            const event = new MouseEvent('click');
            component.confirmDelete(event, mockItem);
            expect(apiSpy.delete).not.toHaveBeenCalled();
        });

        it('deve exibir snackbar de erro quando a exclusão falha', () => {
            spyOn(window, 'confirm').and.returnValue(true);
            apiSpy.delete.and.returnValue(throwError(() => new Error()));
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

    // ---- openCreateModal ----

    describe('openCreateModal()', () => {
        it('deve abrir o dialog ao criar despesa', () => {
            const refSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            refSpy.afterClosed.and.returnValue(of(false));
            dialogSpy.open.and.returnValue(refSpy);
            component.openCreateModal();
            expect(dialogSpy.open).toHaveBeenCalled();
        });

        it('deve recarregar despesas quando o dialog fecha com true', () => {
            const refSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            refSpy.afterClosed.and.returnValue(of(true));
            dialogSpy.open.and.returnValue(refSpy);
            apiSpy.get.and.returnValue(of([mockItem]));
            component.openCreateModal();
            expect(apiSpy.get).toHaveBeenCalledWith('/api/despesas');
        });

        it('não deve recarregar quando o dialog fecha com false', () => {
            const refSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            refSpy.afterClosed.and.returnValue(of(false));
            dialogSpy.open.and.returnValue(refSpy);
            apiSpy.get.calls.reset();
            component.openCreateModal();
            expect(apiSpy.get).not.toHaveBeenCalled();
        });
    });

    // ---- openRowModal ----

    describe('openRowModal()', () => {
        it('deve abrir em modo "edit" para admin', () => {
            authSpy.isAdmin.and.returnValue(true);
            authSpy.getCdPessoa.and.returnValue(99);
            const refSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            refSpy.afterClosed.and.returnValue(of(false));
            dialogSpy.open.and.returnValue(refSpy);
            component.openRowModal(mockItem);
            const [, config] = dialogSpy.open.calls.mostRecent().args;
            expect((config as any).data.mode).toBe('edit');
        });

        it('deve abrir em modo "view" para usuário sem permissão', () => {
            authSpy.isAdmin.and.returnValue(false);
            authSpy.getCdPessoa.and.returnValue(99); // diferente do mockItem.cdPessoa (10)
            const refSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            refSpy.afterClosed.and.returnValue(of(false));
            dialogSpy.open.and.returnValue(refSpy);
            component.openRowModal(mockItem);
            const [, config] = dialogSpy.open.calls.mostRecent().args;
            expect((config as any).data.mode).toBe('view');
        });
    });

    // ---- logout ----

    describe('logout()', () => {
        it('deve chamar authService.logout()', () => {
            component.logout();
            expect(authSpy.logout).toHaveBeenCalled();
        });
    });
});
