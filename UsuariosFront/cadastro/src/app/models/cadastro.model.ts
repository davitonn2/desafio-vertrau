export type Genero = 'Masculino' | 'Feminino' | 'Outro';

export interface Usuario {
  nome: string;
  sobrenome: string;
  email: string;
  genero: Genero;
  /** ISO yyyy-MM-dd do input type="date", ou vazio */
  dataNascimento?: string | null;
}

/** Corpo JSON alinhado ao UsuarioCreateDto da API (camelCase). */
export interface UsuarioCreatePayload {
  nome: string;
  sobrenome: string;
  email: string;
  genero: Genero;
  dataNascimento?: string | null;
  endereco: {
    cep: string;
    estado: string;
    rua: string;
    bairro: string;
    numero: number;
    complemento?: string | null;
  };
}

export interface Endereco {
  cep: string;
  estado: string;
  rua: string;
  bairro: string;
  numero: string;
  complemento?: string;
}

export interface Cadastro {
  usuario: Usuario;
  endereco: Endereco;
}

// Resposta padrão da API ViaCEP
export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}
