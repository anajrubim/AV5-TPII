import { db } from '../db/database.js';
import { Acomodacao, Hospedagem } from '../models/types.js';

function uid(prefix: string): string {
  return prefix + '-' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

interface AcomodacaoRow {
  id: string;
  nomeAcomodacao: string;
  camaSolteiro: number;
  camaCasal: number;
  suite: number;
  climatizacao: number;
  garagem: number;
}

function hydrateAcomodacao(row: AcomodacaoRow): Acomodacao {
  return {
    id: row.id,
    nomeAcomodacao: row.nomeAcomodacao,
    camaSolteiro: row.camaSolteiro,
    camaCasal: row.camaCasal,
    suite: row.suite,
    climatizacao: !!row.climatizacao,
    garagem: row.garagem,
  };
}

export function listarAcomodacoes(): Acomodacao[] {
  const rows = db.prepare('SELECT * FROM acomodacoes').all() as unknown as AcomodacaoRow[];
  return rows.map(hydrateAcomodacao);
}

export function buscarAcomodacaoPorId(id: string): Acomodacao | undefined {
  const row = db.prepare('SELECT * FROM acomodacoes WHERE id = ?').get(id) as unknown as AcomodacaoRow | undefined;
  return row ? hydrateAcomodacao(row) : undefined;
}

export function listarHospedagens(): Hospedagem[] {
  return db.prepare('SELECT * FROM hospedagens').all() as unknown as Hospedagem[];
}

export function buscarHospedagemAtiva(clienteId: string): Hospedagem | undefined {
  return db.prepare('SELECT * FROM hospedagens WHERE clienteId = ? AND dataSaida IS NULL').get(clienteId) as unknown as Hospedagem | undefined;
}

export function registrarHospedagem(clienteId: string, acomodacaoId: string): { ok: boolean; erro?: string; hospedagem?: Hospedagem } {
  const cliente = db.prepare('SELECT id FROM clientes WHERE id = ?').get(clienteId);
  if (!cliente) return { ok: false, erro: 'Cliente não encontrado.' };

  const acomodacao = db.prepare('SELECT id FROM acomodacoes WHERE id = ?').get(acomodacaoId);
  if (!acomodacao) return { ok: false, erro: 'Acomodação não encontrada.' };

  if (buscarHospedagemAtiva(clienteId)) {
    return { ok: false, erro: 'Cliente já possui hospedagem ativa.' };
  }

  const id = uid('hosp');
  const dataEntrada = new Date().toISOString();
  db.prepare('INSERT INTO hospedagens (id, clienteId, acomodacaoId, dataEntrada, dataSaida) VALUES (?, ?, ?, ?, NULL)')
    .run(id, clienteId, acomodacaoId, dataEntrada);

  return { ok: true, hospedagem: { id, clienteId, acomodacaoId, dataEntrada, dataSaida: null } };
}

export function encerrarHospedagem(id: string): { ok: boolean; erro?: string } {
  const row = db.prepare('SELECT * FROM hospedagens WHERE id = ?').get(id) as unknown as Hospedagem | undefined;
  if (!row) return { ok: false, erro: 'Hospedagem não encontrada.' };
  if (row.dataSaida) return { ok: false, erro: 'Hospedagem já encerrada.' };

  db.prepare('UPDATE hospedagens SET dataSaida = ? WHERE id = ?').run(new Date().toISOString(), id);
  return { ok: true };
}

export function removerHospedagem(id: string): { ok: boolean } {
  db.prepare('DELETE FROM hospedagens WHERE id = ?').run(id);
  return { ok: true };
}
