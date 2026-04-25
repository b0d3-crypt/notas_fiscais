import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    CreateUsuarioRequest,
    UpdateSenhaRequest,
    UpdateUsuarioRequest,
    UsuarioService,
} from '../../../../services/usuario.service';
import { SnackbarService } from '../../../../shared/snackbar.service';
import { CepService } from '../../../../shared/services/cep.service';

export interface UsuarioModalData {
    mode: 'create' | 'edit';
    cdWebUser?: number;
}

const senhasConferemValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { senhasNaoConferem: true } : null;
};

@Component({
    selector: 'app-usuario-modal',
    templateUrl: './usuario-modal.component.html',
    styleUrls: ['./usuario-modal.component.scss'],
})
export class UsuarioModalComponent implements OnInit {
    dadosForm!: FormGroup;
    senhaFormGroup!: FormGroup;

    loading = false;
    saving = false;
    activeTab = 0;
    hideSenhaAtual = true;
    hideSenha = true;
    hideSenhaConfirm = true;

    get isCreate(): boolean { return this.data.mode === 'create'; }
    get isEdit(): boolean { return this.data.mode === 'edit'; }

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: UsuarioModalData,
        private dialogRef: MatDialogRef<UsuarioModalComponent>,
        private fb: FormBuilder,
        private usuarioService: UsuarioService,
        private snackbar: SnackbarService,
        private cepService: CepService,
    ) { }

    ngOnInit(): void {
        this.buildForms();

        if (this.isEdit && this.data.cdWebUser) {
            this.loadUsuario();
        }
    }

    private buildForms(): void {
        this.dadosForm = this.fb.group({
            nmPessoa: ['', Validators.required],
            nrCpf: [{ value: '', disabled: this.isEdit }, Validators.required],
            nmEmail: ['', [Validators.required, Validators.email]],
            nrTelefone: [''],
            tpResponsabilidade: [1, Validators.required],
            nmLogradouro: [''],
            dsEndereco: [''],
            nrEndereco: [''],
            nrCep: [''],
            bairro: [''],
            cidade: [''],
            estado: [''],
        });

        const senhaValidators = this.isCreate ? [Validators.required, Validators.minLength(6)] : [Validators.minLength(6)];

        this.senhaFormGroup = this.fb.group(
            {
                ...(this.isEdit ? { senhaAtual: ['', Validators.required] } : {}),
                password: [{ value: '', disabled: this.isEdit }, senhaValidators],
                confirmPassword: [{ value: '', disabled: this.isEdit }, this.isCreate ? [Validators.required] : []],
            },
            { validators: senhasConferemValidator },
        );

        if (this.isEdit) {
            this.senhaFormGroup.get('senhaAtual')!.valueChanges.subscribe((val: string) => {
                const hasValue = val && val.length > 0;
                const passwordCtrl = this.senhaFormGroup.get('password')!;
                const confirmCtrl = this.senhaFormGroup.get('confirmPassword')!;
                if (hasValue) { passwordCtrl.enable(); confirmCtrl.enable(); }
                else { passwordCtrl.disable(); confirmCtrl.disable(); }
            });
        }
    }

    private loadUsuario(): void {
        this.loading = true;
        this.usuarioService.getById(this.data.cdWebUser!).subscribe({
            next: (u) => {
                this.dadosForm.patchValue({
                    nmPessoa: u.nmPessoa,
                    nrCpf: u.nrCpf,
                    nmEmail: u.nmEmail,
                    nrTelefone: u.nrTelefone,
                    tpResponsabilidade: u.tpResponsabilidade,
                    nmLogradouro: u.nmLogradouro,
                    dsEndereco: u.dsEndereco,
                    nrEndereco: u.nrEndereco,
                    nrCep: u.nrCep,
                    bairro: u.bairro,
                    cidade: u.cidade,
                    estado: u.estado,
                });
                this.loading = false;
            },
            error: () => {
                this.snackbar.error('Erro ao carregar dados do usuário');
                this.loading = false;
                this.dialogRef.close();
            },
        });
    }

    buscarCep(): void {
        const cep = this.dadosForm.get('nrCep')?.value?.replace(/\D/g, '');
        if (!cep || cep.length !== 8) return;

        this.cepService.buscar(cep).subscribe({
            next: (endereco) => {
                this.dadosForm.patchValue({
                    nmLogradouro: endereco.logradouro,
                    bairro: endereco.bairro,
                    cidade: endereco.localidade,
                    estado: endereco.uf,
                });
            },
            error: () => {
                this.snackbar.warning('CEP não encontrado');
            },
        });
    }

    save(): void {
        if (this.isCreate) {
            this.saveCreate();
        } else {
            // Salva apenas a aba ativa
            if (this.activeTab === 0) {
                this.saveDados();
            } else {
                this.saveSenha();
            }
        }
    }

    private saveCreate(): void {
        this.dadosForm.markAllAsTouched();
        this.senhaFormGroup.markAllAsTouched();

        if (this.dadosForm.invalid || this.senhaFormGroup.invalid) return;

        const request: CreateUsuarioRequest = {
            ...this.dadosForm.getRawValue(),
            password: this.senhaFormGroup.value.password,
        };

        this.saving = true;
        this.usuarioService.create(request).subscribe({
            next: () => {
                this.snackbar.success('Usuário criado com sucesso');
                this.dialogRef.close(true);
            },
            error: (err) => {
                this.saving = false;
                this.snackbar.error(err?.error?.message ?? 'Erro ao criar usuário');
            },
        });
    }

    private saveDados(): void {
        this.dadosForm.markAllAsTouched();
        if (this.dadosForm.invalid) return;

        const request: UpdateUsuarioRequest = this.dadosForm.getRawValue();

        this.saving = true;
        this.usuarioService.update(this.data.cdWebUser!, request).subscribe({
            next: () => {
                this.snackbar.success('Dados atualizados com sucesso');
                this.dialogRef.close(true);
            },
            error: (err) => {
                this.saving = false;
                this.snackbar.error(err?.error?.message ?? 'Erro ao atualizar dados');
            },
        });
    }

    private saveSenha(): void {
        this.senhaFormGroup.markAllAsTouched();

        if (!this.senhaFormGroup.value.password) {
            this.snackbar.warning('Informe a nova senha');
            return;
        }

        if (this.senhaFormGroup.invalid) return;

        const request: UpdateSenhaRequest = {
            currentPassword: this.senhaFormGroup.value.senhaAtual,
            password: this.senhaFormGroup.getRawValue().password,
            confirmPassword: this.senhaFormGroup.getRawValue().confirmPassword,
        };

        this.saving = true;
        this.usuarioService.updateSenha(this.data.cdWebUser!, request).subscribe({
            next: () => {
                this.snackbar.success('Senha atualizada com sucesso');
                this.dialogRef.close(true);
            },
            error: (err) => {
                this.saving = false;
                this.snackbar.error(err?.error?.message ?? 'Erro ao atualizar senha');
            },
        });
    }

    close(): void {
        this.dialogRef.close(false);
    }
}
