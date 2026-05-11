import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { Cadastro, Genero, UsuarioCreatePayload } from '../models/cadastro.model';
import {
  ListaUsuariosPaginada,
  UsuarioResponse,
  UsuarioUpdatePayload,
} from '../models/usuario-api.model';

export interface ListarUsuariosFiltros {
  nome?: string;
  email?: string;
  genero?: Genero | null;
}

@Injectable({ providedIn: 'root' })
export class CadastroService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5278/usuarios';

  private montarPayload(c: Cadastro): UsuarioCreatePayload {
    const u = c.usuario;
    const e = c.endereco;
    const dataRaw = u.dataNascimento?.trim();

    return {
      nome: u.nome.trim(),
      sobrenome: u.sobrenome.trim(),
      email: u.email.trim(),
      genero: u.genero,
      dataNascimento: dataRaw ? dataRaw : null,
      endereco: {
        cep: e.cep.replace(/\D/g, ''),
        estado: e.estado.trim(),
        rua: e.rua.trim(),
        bairro: e.bairro.trim(),
        numero: Number(e.numero),
        complemento: e.complemento?.trim() || null,
      },
    };
  }

  salvar(cadastro: Cadastro): Observable<unknown> {
    return this.http.post<unknown>(this.apiUrl, this.montarPayload(cadastro));
  }

  listar(
    pagina: number,
    tamanhoPagina: number,
    filtros?: ListarUsuariosFiltros,
  ): Observable<ListaUsuariosPaginada> {
    let params = new HttpParams()
      .set('pagina', String(pagina))
      .set('tamanhoPagina', String(tamanhoPagina));
    const n = filtros?.nome?.trim();
    const e = filtros?.email?.trim();
    if (n) params = params.set('nome', n);
    if (e) params = params.set('email', e);
    if (filtros?.genero) params = params.set('genero', filtros.genero);
    return this.http.get<ListaUsuariosPaginada>(this.apiUrl, { params });
  }

  obterPorId(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.apiUrl}/${id}`);
  }

  atualizar(id: number, body: UsuarioUpdatePayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, body);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
