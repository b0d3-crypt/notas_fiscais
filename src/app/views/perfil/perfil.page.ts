import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { CepService } from '../../shared/services/cep.service';
import { SnackbarService } from '../../shared/snackbar.service';

function senhasConferem(group: FormGroup) {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p && c && p !== c ? { senhasNaoConferem: true } : null;
}

@Component({
    selector: 'app-perfil',
    templateUrl: './perfil.page.html',
    styleUrls: ['./perfil.page.scss'],
})
export class PerfilPageComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    dadosForm!: FormGroup;
    senhaForm!: FormGroup;
    loading = true;
    saving = false;
    hideSenhaAtual = true;
    hideSenha = true;
    hideSenhaConfirm = true;

    private cdWebUser!: number;

    constructor(
        private fb: FormBuilder,
        private usuarioService: UsuarioService,
        private authService: AuthService,
        private snackbar: SnackbarService,
        private cepService: CepService,
    ) { }

    ngOnInit(): void {
        this.dadosForm = this.fb.group({
            nmPessoa: ['', Validators.required],
            nrCpf: [{ value: '', disabled: true }],
            nmEmail: ['', [Validators.required, Validators.email]],
            nrTelefone: [''],
            nmLogradouro: [''],
            dsEndereco: [''],
            nrEndereco: [''],
            nrCep: [''],
            bairro: [''],
            cidade: [''],
            estado: [''],
        });

        this.senhaForm = this.fb.group(
            {
                senhaAtual: ['', Validators.required],
                password: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(6)]],
                confirmPassword: [{ value: '', disabled: true }, Validators.required],
            },
            { validators: senhasConferem }
        );

        this.senhaForm.get('senhaAtual')!.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val: string) => {
            const hasValue = val && val.length > 0;
            const passwordCtrl = this.senhaForm.get('password')!;
            const confirmCtrl = this.senhaForm.get('confirmPassword')!;
            if (hasValue) { passwordCtrl.enable(); confirmCtrl.enable(); }
            else { passwordCtrl.disable(); confirmCtrl.disable(); }
        });

        const id = this.authService.getCdWebUser();
        if (id) {
            this.cdWebUser = id;
            this.usuarioService.getById(id).subscribe({
                next: (usuario) => {
                    this.dadosForm.patchValue(usuario);
                    this.loading = false;
                },
                error: () => {
                    this.snackbar.error('Erro ao carregar dados do usuário');
                    this.loading = false;
                },
            });
        } else {
            this.loading = false;
        }
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

    saveDados(): void {
        if (this.dadosForm.invalid) {
            this.dadosForm.markAllAsTouched();
            return;
        }
        this.saving = true;
        const req = this.dadosForm.getRawValue();
        this.usuarioService.update(this.cdWebUser, req).subscribe({
            next: () => {
                this.snackbar.success('Dados atualizados com sucesso');
                this.saving = false;
            },
            error: () => {
                this.snackbar.error('Erro ao atualizar dados');
                this.saving = false;
            },
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    saveSenha(): void {
        if (this.senhaForm.invalid) {
            this.senhaForm.markAllAsTouched();
            return;
        }
        this.saving = true;
        const req = {
            currentPassword: this.senhaForm.value.senhaAtual,
            password: this.senhaForm.getRawValue().password,
            confirmPassword: this.senhaForm.getRawValue().confirmPassword,
        };
        this.usuarioService.updateSenha(this.cdWebUser, req).subscribe({
            next: () => {
                this.snackbar.success('Senha alterada com sucesso');
                this.senhaForm.reset();
                this.senhaForm.get('password')!.disable();
                this.senhaForm.get('confirmPassword')!.disable();
                this.saving = false;
            },
            error: (err) => {
                this.snackbar.error(err?.error?.message ?? 'Erro ao alterar senha');
                this.saving = false;
            },
        });
    }
}
