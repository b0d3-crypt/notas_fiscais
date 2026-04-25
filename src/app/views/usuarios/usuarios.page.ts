import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UsuarioListItem, UsuarioService } from '../../services/usuario.service';
import { SnackbarService } from '../../shared/snackbar.service';
import { UsuarioModalComponent, UsuarioModalData } from './components/usuario-modal/usuario-modal.component';

@Component({
    selector: 'app-usuarios-page',
    templateUrl: './usuarios.page.html',
    styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPageComponent implements OnInit {
    displayedColumns = ['nmPessoa', 'nrCpf', 'nmEmail', 'tpResponsabilidade'];
    dataSource: UsuarioListItem[] = [];
    loading = false;

    constructor(
        private usuarioService: UsuarioService,
        private dialog: MatDialog,
        private snackbar: SnackbarService,
    ) { }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading = true;
        this.usuarioService.findAll().subscribe({
            next: (list) => {
                this.dataSource = list;
                this.loading = false;
            },
            error: () => {
                this.snackbar.error('Erro ao carregar usuários');
                this.loading = false;
            },
        });
    }

    openCreate(): void {
        const data: UsuarioModalData = { mode: 'create' };
        const ref = this.dialog.open(UsuarioModalComponent, { data, width: '800px', maxWidth: '95vw' });
        ref.afterClosed().subscribe((saved) => {
            if (saved) this.load();
        });
    }

    openEdit(usuario: UsuarioListItem): void {
        const data: UsuarioModalData = { mode: 'edit', cdWebUser: usuario.cdWebUser };
        const ref = this.dialog.open(UsuarioModalComponent, { data, width: '800px', maxWidth: '95vw' });
        ref.afterClosed().subscribe((saved) => {
            if (saved) this.load();
        });
    }

    tipoLabel(tipo: number): string {
        return tipo === 0 ? 'Admin' : 'Usuário';
    }
}

