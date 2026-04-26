import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { UsuarioListItem, UsuarioService } from '../../services/usuario.service';
import { SnackbarService } from '../../shared/snackbar.service';
import { UsuariosPageComponent } from './usuarios.page';

describe('UsuariosPageComponent', () => {
    let component: UsuariosPageComponent;
    let fixture: ComponentFixture<UsuariosPageComponent>;
    let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;
    let snackbarSpy: jasmine.SpyObj<SnackbarService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    const mockUsuario: UsuarioListItem = {
        cdWebUser: 1,
        cdPessoa: 1,
        nmPessoa: 'Maria',
        nrCpf: '123.456.789-00',
        nmEmail: 'maria@example.com',
        tpResponsabilidade: 1,
    };

    const mockAdmin: UsuarioListItem = {
        cdWebUser: 2,
        cdPessoa: 2,
        nmPessoa: 'Admin',
        nrCpf: '000.000.000-00',
        nmEmail: 'admin@example.com',
        tpResponsabilidade: 0,
    };

    beforeEach(async () => {
        usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['findAll']);
        snackbarSpy = jasmine.createSpyObj('SnackbarService', ['error']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

        usuarioServiceSpy.findAll.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            declarations: [UsuariosPageComponent],
            providers: [
                { provide: UsuarioService, useValue: usuarioServiceSpy },
                { provide: SnackbarService, useValue: snackbarSpy },
                { provide: MatDialog, useValue: dialogSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(UsuariosPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('deve ser criado', () => expect(component).toBeTruthy());

    it('deve chamar load() no ngOnInit', () => {
        expect(usuarioServiceSpy.findAll).toHaveBeenCalled();
    });

    // ---- load ----

    describe('load()', () => {
        it('deve popular dataSource ao carregar com sucesso', () => {
            usuarioServiceSpy.findAll.and.returnValue(of([mockUsuario, mockAdmin]));
            component.load();
            expect(component.dataSource).toEqual([mockUsuario, mockAdmin]);
            expect(component.loading).toBeFalse();
        });

        it('deve exibir snackbar de erro ao falhar', () => {
            usuarioServiceSpy.findAll.and.returnValue(throwError(() => new Error('Falha de rede')));
            component.load();
            expect(snackbarSpy.error).toHaveBeenCalledWith('Erro ao carregar usuários');
            expect(component.loading).toBeFalse();
        });

        it('deve iniciar com dataSource vazio em caso de falha', () => {
            usuarioServiceSpy.findAll.and.returnValue(throwError(() => new Error()));
            component.load();
            expect(component.dataSource).toEqual([]);
        });
    });

    // ---- tipoLabel ----

    describe('tipoLabel()', () => {
        it('deve retornar "Admin" para tipo 0', () => {
            expect(component.tipoLabel(0)).toBe('Admin');
        });

        it('deve retornar "Usuário" para tipo 1', () => {
            expect(component.tipoLabel(1)).toBe('Usuário');
        });

        it('deve retornar "Usuário" para qualquer tipo diferente de 0', () => {
            expect(component.tipoLabel(2)).toBe('Usuário');
            expect(component.tipoLabel(99)).toBe('Usuário');
        });
    });

    // ---- openCreate ----

    describe('openCreate()', () => {
        it('deve abrir o dialog de criação', () => {
            const refSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            refSpy.afterClosed.and.returnValue(of(false));
            dialogSpy.open.and.returnValue(refSpy);
            component.openCreate();
            expect(dialogSpy.open).toHaveBeenCalled();
        });

        it('deve recarregar ao salvar', () => {
            const refSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            refSpy.afterClosed.and.returnValue(of(true));
            dialogSpy.open.and.returnValue(refSpy);
            usuarioServiceSpy.findAll.and.returnValue(of([mockUsuario]));
            component.openCreate();
            expect(usuarioServiceSpy.findAll).toHaveBeenCalled();
        });

        it('não deve recarregar ao cancelar', () => {
            const refSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            refSpy.afterClosed.and.returnValue(of(false));
            dialogSpy.open.and.returnValue(refSpy);
            usuarioServiceSpy.findAll.calls.reset();
            component.openCreate();
            expect(usuarioServiceSpy.findAll).not.toHaveBeenCalled();
        });
    });

    // ---- openEdit ----

    describe('openEdit()', () => {
        it('deve abrir o dialog em modo edição com o cdWebUser correto', () => {
            const refSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            refSpy.afterClosed.and.returnValue(of(false));
            dialogSpy.open.and.returnValue(refSpy);
            component.openEdit(mockUsuario);
            const [, config] = dialogSpy.open.calls.mostRecent().args;
            expect((config as any).data.mode).toBe('edit');
            expect((config as any).data.cdWebUser).toBe(1);
        });

        it('deve recarregar após salvar edição', () => {
            const refSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            refSpy.afterClosed.and.returnValue(of(true));
            dialogSpy.open.and.returnValue(refSpy);
            usuarioServiceSpy.findAll.and.returnValue(of([mockUsuario]));
            component.openEdit(mockUsuario);
            expect(usuarioServiceSpy.findAll).toHaveBeenCalled();
        });
    });
});
