import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TIPO_ARQUIVO } from '../../constants/tipo-arquivo';
import { AuthService } from '../../core/auth/auth.service';
import { DespesaListItem, DespesaService } from '../../services/despesa.service';
import { SnackbarService } from '../../shared/snackbar.service';
import { DespesaModalComponent, DespesaModalData } from './components/despesa-modal/despesa-modal.component';

export { DespesaListItem };

@Component({
  selector: 'app-despesas-page',
  templateUrl: './despesas.page.html',
  styleUrls: ['./despesas.page.scss'],
})
export class DespesasPageComponent implements OnInit, OnDestroy {
  tableData: DespesaListItem[] = [];
  loading = false;

  displayedColumns = ['nmPessoa', 'nmArquivo', 'dtDespesa', 'vlDespesa', 'download', 'excluir'];

  tipoArquivo = TIPO_ARQUIVO;

  private readonly isAdminUser: boolean;
  private readonly cdPessoa: number | null;

  constructor(
    private despesaService: DespesaService,
    private authService: AuthService,
    private snackbar: SnackbarService,
    private dialog: MatDialog
  ) {
    this.isAdminUser = this.authService.isAdmin();
    this.cdPessoa = this.authService.getCdPessoa();
  }

  ngOnInit(): void {
    this.loadDespesas();
  }

  ngOnDestroy(): void { /* lifecycle hook */ }

  loadDespesas(): void {
    this.loading = true;
    this.despesaService.findAll().subscribe({
      next: (items) => {
        this.tableData = items;
        this.loading = false;
      },
      error: () => {
        this.snackbar.error('Erro ao carregar despesas');
        this.loading = false;
      },
    });
  }

  canEditOrDelete(item: DespesaListItem): boolean {
    return this.isAdminUser || item.cdPessoa === this.cdPessoa;
  }

  trackByDespesaId(_: number, item: DespesaListItem): number {
    return item.cdDescricaoDespesa;
  }

  openCreateModal(): void {
    const ref = this.dialog.open(DespesaModalComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { mode: 'create' } as DespesaModalData,
    });
    ref.afterClosed().subscribe((reload) => { if (reload) this.loadDespesas(); });
  }

  openRowModal(item: DespesaListItem): void {
    const mode = this.canEditOrDelete(item) ? 'edit' : 'view';
    const ref = this.dialog.open(DespesaModalComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { mode, id: item.cdDescricaoDespesa } as DespesaModalData,
    });
    ref.afterClosed().subscribe((reload) => { if (reload) this.loadDespesas(); });
  }

  download(event: Event, item: DespesaListItem): void {
    event.stopPropagation();
    this.despesaService.download(item.cdDescricaoDespesa).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.nmArquivo;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackbar.error('Erro ao baixar arquivo'),
    });
  }

  confirmDelete(event: Event, item: DespesaListItem): void {
    event.stopPropagation();
    if (!confirm(`Excluir despesa de ${item.nmPessoa} (${item.dtDespesa})?`)) return;

    this.despesaService.delete(item.cdDescricaoDespesa).subscribe({
      next: () => {
        this.snackbar.success('Despesa excluída com sucesso');
        this.loadDespesas();
      },
      error: () => this.snackbar.error('Erro ao excluir despesa'),
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
