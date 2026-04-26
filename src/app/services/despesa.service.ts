import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../shared/api.service';

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

export interface DespesaDetail {
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

@Injectable({ providedIn: 'root' })
export class DespesaService {
    constructor(private api: ApiService) { }

    findAll(): Observable<DespesaListItem[]> {
        return this.api.get<DespesaListItem[]>('/api/despesas');
    }

    getById(id: number): Observable<DespesaDetail> {
        return this.api.get<DespesaDetail>(`/api/despesas/${id}`);
    }

    create(formData: FormData): Observable<DespesaDetail> {
        return this.api.postForm<DespesaDetail>('/api/despesas', formData);
    }

    update(id: number, formData: FormData): Observable<DespesaDetail> {
        return this.api.putForm<DespesaDetail>(`/api/despesas/${id}`, formData);
    }

    delete(id: number): Observable<void> {
        return this.api.delete(`/api/despesas/${id}`);
    }

    download(id: number): Observable<Blob> {
        return this.api.download(`/api/despesas/${id}/download`);
    }
}
