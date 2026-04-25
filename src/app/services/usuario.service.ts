import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../shared/api.service';

export interface UsuarioListItem {
    cdWebUser: number;
    cdPessoa: number;
    nmPessoa: string;
    nrCpf: string;
    nmEmail: string;
    tpResponsabilidade: number;
}

export interface UsuarioDetail {
    cdWebUser: number;
    cdPessoa: number;
    cdEndereco: number;
    nmPessoa: string;
    nrCpf: string;
    nmEmail: string;
    nrTelefone: string;
    tpResponsabilidade: number;
    nmLogradouro: string;
    dsEndereco: string;
    nrEndereco: string;
    nrCep: string;
    bairro: string;
    cidade: string;
    estado: string;
}

export interface CreateUsuarioRequest {
    nmPessoa: string;
    nrCpf: string;
    nmEmail: string;
    nrTelefone: string;
    tpResponsabilidade: number;
    password: string;
    nmLogradouro: string;
    dsEndereco: string;
    nrEndereco: string;
    nrCep: string;
    bairro: string;
    cidade: string;
    estado: string;
}

export interface UpdateUsuarioRequest {
    nmPessoa: string;
    nmEmail: string;
    nrTelefone: string;
    tpResponsabilidade: number;
    nmLogradouro: string;
    dsEndereco: string;
    nrEndereco: string;
    nrCep: string;
    bairro: string;
    cidade: string;
    estado: string;
}

export interface UpdateSenhaRequest {
    currentPassword: string;
    password: string;
    confirmPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
    constructor(private api: ApiService) { }

    findAll(): Observable<UsuarioListItem[]> {
        return this.api.get<UsuarioListItem[]>('/api/usuarios');
    }

    getById(id: number): Observable<UsuarioDetail> {
        return this.api.get<UsuarioDetail>(`/api/usuarios/${id}`);
    }

    create(request: CreateUsuarioRequest): Observable<number> {
        return this.api.post<number>('/api/usuarios', request);
    }

    update(id: number, request: UpdateUsuarioRequest): Observable<void> {
        return this.api.put<void>(`/api/usuarios/${id}`, request);
    }

    updateSenha(id: number, request: UpdateSenhaRequest): Observable<void> {
        return this.api.put<void>(`/api/usuarios/${id}/senha`, request);
    }
}
