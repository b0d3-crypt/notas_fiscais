import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../../shared/api.service';
import { SnackbarService } from '../../../../shared/snackbar.service';
import { TIPO_ARQUIVO } from '../../../../constants/tipo-arquivo';

export interface DespesaModalData {
  mode: 'create' | 'edit' | 'view';
  id?: number;
}

interface DespesaDetail {
  cdDescricaoDespesa: number;
  nmPessoa: string;
  cdPessoa: number;
  nmArquivo: string;
  tpArquivo: number;
  dtDespesa: string;
  vlDespesa: number;
  cdArquivo: number;
  dsDespesa: string;
  dtArquivo: string;
}

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

@Component({
  selector: 'app-despesa-modal',
  templateUrl: './despesa-modal.component.html',
  styleUrls: ['./despesa-modal.component.scss'],
})
export class DespesaModalComponent implements OnInit {
  form!: FormGroup;
  detail: DespesaDetail | null = null;
  selectedFile: File | null = null;
  fileError: string | null = null;
  loading = false;
  saving = false;

  tipoArquivo = TIPO_ARQUIVO;

  readonly ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png,.gif';

  get isView(): boolean {
    return this.data.mode === 'view';
  }
  get isEdit(): boolean {
    return this.data.mode === 'edit';
  }
  get isCreate(): boolean {
    return this.data.mode === 'create';
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DespesaModalData,
    private dialogRef: MatDialogRef<DespesaModalComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    if (this.data.id) {
      this.loadDetail();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      dtDespesa: ['', Validators.required],
      vlDespesa: [null, [Validators.required, Validators.min(0.01)]],
      dsDespesa: [''],
    });

    if (this.isView) {
      this.form.disable();
    }
  }

  private loadDetail(): void {
    this.loading = true;
    this.api.get<DespesaDetail>(`/api/despesas/${this.data.id}`).subscribe({
      next: (detail) => {
        this.detail = detail;
        this.form.patchValue({
          dtDespesa: this.parseDtDespesa(detail.dtDespesa),
          vlDespesa: detail.vlDespesa,
          dsDespesa: detail.dsDespesa,
        });
        this.loading = false;
      },
      error: () => {
        this.snackbar.error('Erro ao carregar despesa');
        this.loading = false;
      },
    });
  }

  private parseDtDespesa(mmYyyy: string): string {
    // "MM/yyyy" -> "yyyy-MM" for input[type=month]
    const [mm, yyyy] = mmYyyy.split('/');
    return `${yyyy}-${mm}`;
  }

  onFileSelected(event: Event): void {
    this.fileError = null;
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (file.size > MAX_SIZE_BYTES) {
      this.fileError = 'Arquivo excede o limite de 2MB';
      input.value = '';
      return;
    }

    const allowedMimes = Object.values(this.tipoArquivo).map((t) => t!.mimeType);
    if (!allowedMimes.includes(file.type)) {
      this.fileError = 'Tipo de arquivo não permitido (PDF, JPEG, PNG, GIF)';
      input.value = '';
      return;
    }

    this.selectedFile = file;
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileError = null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isCreate && !this.selectedFile) {
      this.fileError = 'Selecione um arquivo';
      return;
    }

    this.saving = true;
    const formData = this.buildFormData();

    const request$ = this.isCreate
      ? this.api.postForm<DespesaDetail>('/api/despesas', formData)
      : this.api.putForm<DespesaDetail>(`/api/despesas/${this.data.id}`, formData);

    request$.subscribe({
      next: () => {
        const msg = this.isCreate ? 'Despesa criada com sucesso' : 'Despesa atualizada com sucesso';
        this.snackbar.success(msg);
        this.saving = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.message ?? 'Erro ao salvar despesa';
        this.snackbar.error(msg);
      },
    });
  }

  private buildFormData(): FormData {
    const fd = new FormData();
    const { dtDespesa, vlDespesa, dsDespesa } = this.form.value;

    if (this.selectedFile) {
      fd.append('arquivo', this.selectedFile);
    }
    if (dtDespesa) {
      fd.append('dtDespesa', dtDespesa); // "yyyy-MM"
    }
    if (vlDespesa != null) {
      fd.append('vlDespesa', String(vlDespesa));
    }
    if (dsDespesa) {
      fd.append('dsDespesa', dsDespesa);
    }

    return fd;
  }

  close(): void {
    this.dialogRef.close(false);
  }

  getModalTitle(): string {
    if (this.isCreate) return 'Novo Comprovante';
    if (this.isEdit) return 'Editar Despesa';
    return 'Detalhes da Despesa';
  }
}
