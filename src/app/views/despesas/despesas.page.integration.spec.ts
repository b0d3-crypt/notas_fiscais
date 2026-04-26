/**
 * Teste de integração do DespesasPageComponent.
 *
 * Valida o fluxo completo: carregamento de dados via HTTP mockado,
 * renderização da lista, permissões por perfil do usuário,
 * e interação com dialogs e exclusão.
 */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService, AuthUser } from '../../core/auth/auth.service';
import { ApiService } from '../../shared/api.service';
import { SnackbarService } from '../../shared/snackbar.service';
import { DespesaListItem, DespesasPageComponent } from './despesas.page';

describe('DespesasPageComponent (integração)', () => {
    let component: DespesasPageComponent;
    let fixture: ComponentFixture<DespesasPageComponent>;
    let httpMock: HttpTestingController;
    let authService: AuthService;
    let snackbarService: SnackbarService;
    let dialog: MatDialog;

    const adminUser: AuthUser = {
        token: 'admin-token',
        nmPessoa: 'Admin',
        cdPessoa: 1,
        cdWebUser: 1,
        role: 0,
    };

    const commonUser: AuthUser = {
        token: 'user-token',
        nmPessoa: 'Usuário Comum',
        cdPessoa: 99,
        cdWebUser: 99,
        role: 1,
    };

    const mockDespesas: DespesaListItem[] = [
        {
            cdDescricaoDespesa: 1,
            nmPessoa: 'João',
            cdPessoa: 10,
            nmArquivo: 'nota_jan.pdf',
            tpArquivo: 1,
            dtDespesa: '2025-01-15',
            vlDespesa: 350.0,
            cdArquivo: 5,
        },
        {
            cdDescricaoDespesa: 2,
            nmPessoa: 'Maria',
            cdPessoa: 99,
            nmArquivo: 'nota_fev.pdf',
            tpArquivo: 1,
            dtDespesa: '2025-02-10',
            vlDespesa: 120.5,
            cdArquivo: 6,
        },
    ];

    function flushDespesas(items = mockDespesas): void {
        const req = httpMock.expectOne(`${environment.apiUrl}/api/despesas`);
        req.flush({ data: items, message: 'ok' });
    }

    beforeEach(async () => {
        localStorage.clear();

        await TestBed.configureTestingModule({
            declarations: [DespesasPageComponent],
            imports: [
                HttpClientTestingModule,
                BrowserAnimationsModule,
                MatTableModule,
                MatButtonModule,
                MatIconModule,
                MatDialogModule,
                MatProgressSpinnerModule,
                MatSnackBarModule,
                MatToolbarModule,
                MatTooltipModule,
            ],
            providers: [ApiService, AuthService, SnackbarService],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        httpMock = TestBed.inject(HttpTestingController);
        authService = TestBed.inject(AuthService);
        snackbarService = TestBed.inject(SnackbarService);
        dialog = TestBed.inject(MatDialog);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    function setupComponent(user: AuthUser = adminUser): void {
        authService.setUser(user);
        fixture = TestBed.createComponent(DespesasPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    it('deve carregar e exibir despesas via HTTP', fakeAsync(() => {
        setupComponent();
        flushDespesas();
        tick();
        fixture.detectChanges();

        expect(component.tableData.length).toBe(2);
        expect(component.tableData[0].nmPessoa).toBe('João');
        expect(component.loading).toBeFalse();
    }));

    it('deve exibir snackbar de erro quando o servidor retornar erro', fakeAsync(() => {
        spyOn(snackbarService, 'error');
        setupComponent(adminUser);

        const req = httpMock.expectOne(`${environment.apiUrl}/api/despesas`);
        req.flush('Erro', { status: 500, statusText: 'Internal Server Error' });
        tick();
        fixture.detectChanges();

        expect(snackbarService.error).toHaveBeenCalledWith('Erro ao carregar despesas');
        expect(component.loading).toBeFalse();
    }));

    it('admin pode editar/excluir qualquer despesa', fakeAsync(() => {
        setupComponent(adminUser);
        flushDespesas();
        tick();

        // Item de outro usuário (cdPessoa: 10, admin é cdPessoa: 1)
        expect(component.canEditOrDelete(mockDespesas[0])).toBeTrue();
        // Próprio item não importa, admin sempre pode
        expect(component.canEditOrDelete(mockDespesas[1])).toBeTrue();
    }));

    it('usuário comum só pode editar/excluir os próprios itens', fakeAsync(() => {
        setupComponent(commonUser); // cdPessoa: 99
        flushDespesas();
        tick();

        // Item de outra pessoa (cdPessoa: 10)
        expect(component.canEditOrDelete(mockDespesas[0])).toBeFalse();
        // Próprio item (cdPessoa: 99)
        expect(component.canEditOrDelete(mockDespesas[1])).toBeTrue();
    }));

    it('deve excluir despesa via HTTP e recarregar a lista', fakeAsync(() => {
        spyOn(snackbarService, 'success');
        spyOn(window, 'confirm').and.returnValue(true);
        setupComponent(adminUser);
        flushDespesas();
        tick();

        const event = new MouseEvent('click');
        component.confirmDelete(event, mockDespesas[0]);

        const deleteReq = httpMock.expectOne(
            `${environment.apiUrl}/api/despesas/${mockDespesas[0].cdDescricaoDespesa}`,
        );
        expect(deleteReq.request.method).toBe('DELETE');
        deleteReq.flush(null);
        tick();

        // Recarrega após excluir
        flushDespesas([mockDespesas[1]]);
        tick();
        fixture.detectChanges();

        expect(snackbarService.success).toHaveBeenCalledWith('Despesa excluída com sucesso');
        expect(component.tableData.length).toBe(1);
    }));

    it('deve abrir dialog de criação ao chamar openCreateModal()', fakeAsync(() => {
        setupComponent(adminUser);
        flushDespesas();
        tick();

        spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => of(false),
        } as any);

        component.openCreateModal();
        expect(dialog.open).toHaveBeenCalled();
    }));
});
