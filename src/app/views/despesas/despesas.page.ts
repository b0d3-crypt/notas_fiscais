import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TIPO_ARQUIVO } from '../../constants/tipo-arquivo';
import { AuthService } from '../../core/auth/auth.service';
import { ApiService } from '../../shared/api.service';
import { SnackbarService } from '../../shared/snackbar.service';
import { DespesaModalComponent, DespesaModalData } from './components/despesa-modal/despesa-modal.component';

export interface DespesaListItem {
  cdDescricaoDespesa: number;
  nmPessoa: string;
  cdPessoa: number;
  nmArquivo: string;
  tpArquivo: number;
  dtDespesa: string;
  vlDespesa: number;
  cdArquivo: number;
}

@Component({
  selector: 'app-despesas-page',
  templateUrl: './despesas.page.html',
  styleUrls: ['./despesas.page.scss'],
})
export class DespesasPageComponent implements OnInit {
  tableData: DespesaListItem[] = [];
  loading = false;

  displayedColumns = ['nmPessoa', 'nmArquivo', 'dtDespesa', 'vlDespesa', 'download', 'excluir'];

  tipoArquivo = TIPO_ARQUIVO;

  constructor(
    private api: ApiService,
    public authService: AuthService,
    private snackbar: SnackbarService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadDespesas();
  }

  loadDespesas(): void {
    this.loading = true;
    this.api.get<DespesaListItem[]>('/api/despesas').subscribe({
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
    return this.authService.isAdmin() || item.cdPessoa === this.authService.getCdPessoa();
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
    this.api.download(`/api/despesas/${item.cdDescricaoDespesa}/download`).subscribe({
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

    this.api.delete(`/api/despesas/${item.cdDescricaoDespesa}`).subscribe({
      next: () => {
        this.snackbar.success('Despesa excluída com sucesso');
        this.loadDespesas();
      },
      error: () => this.snackbar.error('Erro ao excluir despesa'),
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  logout(): void {
    this.authService.logout();
  }
}
