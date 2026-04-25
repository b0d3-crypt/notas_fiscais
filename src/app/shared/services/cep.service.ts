import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

export interface EnderecoCorreios {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class CepService {
  constructor(private api: ApiService) {}

  buscar(nrCep: string): Observable<EnderecoCorreios> {
    const cep = nrCep.replace(/\D/g, '');
    return this.api.get<EnderecoCorreios>(`/api/correios/${cep}`);
  }
}
