import { db } from '../db/database.js';
import { Cliente, Telefone, Documento, Endereco } from '../models/types.js';

function uid(): string {
  return 'cli-' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

interface ClienteRow {
  id: string;
  nome: string;
  nomeSocial: string;
  dataNascimento: string;
  dataCadastro: string;
  titularId: string | null;
}

function hydrateCliente(row: ClienteRow): Cliente {
  const endereco = db.prepare('SELECT rua, bairro, cidade, estado, pais, codigoPostal FROM enderecos WHERE clienteId = ?')
    .get(row.id) as Endereco | undefined;

  const telefones = db.prepare('SELECT ddd, numero FROM telefones WHERE clienteId = ?')
    .all(row.id) as unknown as Telefone[];

  const documentos = db.prepare('SELECT numero, tipo, dataExpedicao FROM documentos WHERE clienteId = ?')
    .all(row.id) as unknown as Documento[];

  const dependentesRows = db.prepare('SELECT * FROM clientes WHERE titularId = ?')
    .all(row.id) as unknown as ClienteRow[];

  return {
    id: row.id,
    nome: row.nome,
    nomeSocial: row.nomeSocial,
    dataNascimento: row.dataNascimento,
    dataCadastro: row.dataCadastro,
    telefones,
    endereco: endereco ?? undefined,
    documentos,
    dependentes: dependentesRows.map(hydrateCliente),
    titularId: row.titularId ?? undefined,
  };
}

export function listarClientes(): Cliente[] {
  const rows = db.prepare('SELECT * FROM clientes WHERE titularId IS NULL').all() as unknown as ClienteRow[];
  return rows.map(hydrateCliente);
}

export function buscarClientePorId(id: string): Cliente | undefined {
  const row = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id) as unknown as ClienteRow | undefined;
  return row ? hydrateCliente(row) : undefined;
}

interface NovoClienteInput {
  nome: string;
  nomeSocial: string;
  dataNascimento: string;
  telefones: Telefone[];
  endereco?: Endereco;
  documentos: Documento[];
  titularId?: string;
}

export function criarCliente(dados: NovoClienteInput): Cliente {
  const id = uid();
  const dataCadastro = new Date().toISOString();

  db.exec('BEGIN');
  try {
    db.prepare(`INSERT INTO clientes (id, nome, nomeSocial, dataNascimento, dataCadastro, titularId) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, dados.nome, dados.nomeSocial, dados.dataNascimento, dataCadastro, dados.titularId ?? null);

    if (dados.endereco) {
      db.prepare(`INSERT INTO enderecos (clienteId, rua, bairro, cidade, estado, pais, codigoPostal) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(id, dados.endereco.rua, dados.endereco.bairro, dados.endereco.cidade, dados.endereco.estado, dados.endereco.pais, dados.endereco.codigoPostal);
    }

    for (const t of dados.telefones) {
      db.prepare(`INSERT INTO telefones (clienteId, ddd, numero) VALUES (?, ?, ?)`).run(id, t.ddd, t.numero);
    }

    for (const doc of dados.documentos) {
      db.prepare(`INSERT INTO documentos (clienteId, numero, tipo, dataExpedicao) VALUES (?, ?, ?, ?)`)
        .run(id, doc.numero, doc.tipo, doc.dataExpedicao);
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  return buscarClientePorId(id)!;
}

interface EditarClienteInput {
  nome: string;
  nomeSocial: string;
  dataNascimento: string;
  telefones: Telefone[];
  endereco?: Endereco;
  documentos: Documento[];
}

export function editarCliente(id: string, dados: EditarClienteInput): Cliente | undefined {
  const existente = buscarClientePorId(id);
  if (!existente) return undefined;

  db.exec('BEGIN');
  try {
    db.prepare(`UPDATE clientes SET nome = ?, nomeSocial = ?, dataNascimento = ? WHERE id = ?`)
      .run(dados.nome, dados.nomeSocial, dados.dataNascimento, id);

    db.prepare(`DELETE FROM enderecos WHERE clienteId = ?`).run(id);
    if (dados.endereco) {
      db.prepare(`INSERT INTO enderecos (clienteId, rua, bairro, cidade, estado, pais, codigoPostal) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(id, dados.endereco.rua, dados.endereco.bairro, dados.endereco.cidade, dados.endereco.estado, dados.endereco.pais, dados.endereco.codigoPostal);
    }

    db.prepare(`DELETE FROM telefones WHERE clienteId = ?`).run(id);
    for (const t of dados.telefones) {
      db.prepare(`INSERT INTO telefones (clienteId, ddd, numero) VALUES (?, ?, ?)`).run(id, t.ddd, t.numero);
    }

    db.prepare(`DELETE FROM documentos WHERE clienteId = ?`).run(id);
    for (const doc of dados.documentos) {
      db.prepare(`INSERT INTO documentos (clienteId, numero, tipo, dataExpedicao) VALUES (?, ?, ?, ?)`)
        .run(id, doc.numero, doc.tipo, doc.dataExpedicao);
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  return buscarClientePorId(id);
}

export function removerCliente(id: string): { ok: boolean; erro?: string } {
  const hospedagemAtiva = db.prepare('SELECT id FROM hospedagens WHERE clienteId = ? AND dataSaida IS NULL').get(id);
  if (hospedagemAtiva) {
    return { ok: false, erro: 'Cliente possui hospedagem ativa e não pode ser removido.' };
  }
  db.prepare('DELETE FROM clientes WHERE id = ?').run(id);
  return { ok: true };
}
