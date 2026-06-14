export interface Telefone {
  ddd: string;
  numero: string;
}

export interface Endereco {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  codigoPostal: string;
}

export interface Documento {
  numero: string;
  tipo: string;
  dataExpedicao: string;
}

export interface Cliente {
  id: string;
  nome: string;
  nomeSocial: string;
  dataNascimento: string;
  dataCadastro: string;
  telefones: Telefone[];
  endereco?: Endereco;
  documentos: Documento[];
  dependentes: Cliente[];
  titularId?: string;
}

export interface Acomodacao {
  id: string;
  nomeAcomodacao: string;
  camaSolteiro: number;
  camaCasal: number;
  suite: number;
  climatizacao: boolean;
  garagem: number;
}

export interface Hospedagem {
  id: string;
  clienteId: string;
  acomodacaoId: string;
  dataEntrada: string;
  dataSaida: string | null;
}
