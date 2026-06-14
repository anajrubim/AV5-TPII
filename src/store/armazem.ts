import { useState, useEffect } from 'react';
import { Cliente, Acomodacao, Hospedagem } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

interface EstadoAtlantis {
  clientes: Cliente[];
  acomodacoes: Acomodacao[];
  hospedagens: Hospedagem[];
  carregado: boolean;
}

const estado: EstadoAtlantis = {
  clientes: [],
  acomodacoes: [],
  hospedagens: [],
  carregado: false,
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notificar() {
  listeners.forEach((fn) => fn());
}

function reviveDatas(cliente: any): Cliente {
  return {
    ...cliente,
    dataNascimento: new Date(cliente.dataNascimento),
    dataCadastro: new Date(cliente.dataCadastro),
    documentos: (cliente.documentos ?? []).map((d: any) => ({ ...d, dataExpedicao: new Date(d.dataExpedicao) })),
    dependentes: (cliente.dependentes ?? []).map(reviveDatas),
  };
}

function reviveHospedagem(h: any): Hospedagem {
  return {
    ...h,
    dataEntrada: new Date(h.dataEntrada),
    dataSaida: h.dataSaida ? new Date(h.dataSaida) : null,
  };
}

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let mensagem = `Erro na requisição (${res.status})`;
    try {
      const data = await res.json();
      if (data?.erro) mensagem = data.erro;
    } catch {
    }
    throw new Error(mensagem);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

async function carregarTudo() {
  const [clientes, acomodacoes, hospedagens] = await Promise.all([
    api<any[]>('/clientes'),
    api<any[]>('/acomodacoes'),
    api<any[]>('/hospedagens'),
  ]);
  estado.clientes = clientes.map(reviveDatas);
  estado.acomodacoes = acomodacoes;
  estado.hospedagens = hospedagens.map(reviveHospedagem);
  estado.carregado = true;
  notificar();
}

carregarTudo();

export const Armazem = {
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  isCarregado: (): boolean => estado.carregado,

  getClientes: (): Cliente[] => estado.clientes,
  getAcomodacoes: (): Acomodacao[] => estado.acomodacoes,
  getHospedagens: (): Hospedagem[] => estado.hospedagens,

  getClienteById: (id: string) => estado.clientes.find((c) => c.id === id),
  getAcomodacaoById: (id: string) => estado.acomodacoes.find((a) => a.id === id),
  getHospedagemAtiva: (clienteId: string) =>
    estado.hospedagens.find((h) => h.clienteId === clienteId && h.dataSaida === null),

  async adicionarCliente(dados: Omit<Cliente, 'id' | 'dataCadastro' | 'dependentes'>): Promise<Cliente> {
    const novo = await api<any>('/clientes', { method: 'POST', body: JSON.stringify(dados) });
    await carregarTudo();
    return reviveDatas(novo);
  },

  async editarCliente(id: string, dados: Partial<Omit<Cliente, 'id' | 'dataCadastro'>>) {
    await api<any>(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
    await carregarTudo();
  },

  async removerCliente(id: string) {
    await api<void>(`/clientes/${id}`, { method: 'DELETE' });
    await carregarTudo();
  },

  async registrarHospedagem(clienteId: string, acomodacaoId: string): Promise<Hospedagem> {
    const nova = await api<any>('/hospedagens', { method: 'POST', body: JSON.stringify({ clienteId, acomodacaoId }) });
    await carregarTudo();
    return reviveHospedagem(nova);
  },

  async encerrarHospedagem(hospedagemId: string) {
    await api<void>(`/hospedagens/${hospedagemId}/encerrar`, { method: 'POST' });
    await carregarTudo();
  },

  async removerHospedagem(hospedagemId: string) {
    await api<void>(`/hospedagens/${hospedagemId}`, { method: 'DELETE' });
    await carregarTudo();
  },
};

export function useArmazem() {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const unsub = Armazem.subscribe(() => forceUpdate((n) => n + 1));
    return () => { unsub(); };
  }, []);
  return Armazem;
}
