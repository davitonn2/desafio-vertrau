import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ViaCepResponse } from '../models/cadastro.model';

@Injectable({ providedIn: 'root' })
export class ViaCepService {
  private http = inject(HttpClient);

  buscar(cep: string): Observable<ViaCepResponse> {
    const cepLimpo = (cep || '').replace(/\D/g, '');
    return this.http
      .get<ViaCepResponse>(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      .pipe(
        map((res) => {
          if (res.erro) throw new Error('CEP não encontrado');
          return res;
        }),
        catchError((err) => throwError(() => err)),
      );
  }
}
