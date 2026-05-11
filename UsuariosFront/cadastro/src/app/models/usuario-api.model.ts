import type { Genero } from './cadastro.model';

/** Espelha EnderecoResponseDto da API. */
export interface EnderecoResponse {
  cep: string;
  estado: string;
  rua: string;
  bairro: string;
  numero: number;
  complemento?: string | null;
}

/** Espelha UsuarioResponseDto da API. */
export interface UsuarioResponse {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  genero: Genero;
  dataNascimento?: string | null;
  endereco?: EnderecoResponse | null;
}

/** Espelha ListaUsuariosPaginadaDto da API. */
export interface ListaUsuariosPaginada {
  itens: UsuarioResponse[];
  pagina: number;
  tamanhoPagina: number;
  totalItens: number;
  totalPaginas: number;
}

/** Corpo PUT alinhado a UsuarioUpdateDto. */
export interface UsuarioUpdatePayload {
  nome: string;
  sobrenome: string;
  email: string;
  genero: Genero;
  dataNascimento?: string | null;
  endereco?: {
    cep: string;
    estado: string;
    rua: string;
    bairro: string;
    numero: number;
    complemento?: string | null;
  } | null;
}
