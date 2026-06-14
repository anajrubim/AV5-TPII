import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'atlantis.db');

export const db = new DatabaseSync(dbPath);

db.exec(`PRAGMA foreign_keys = ON;`);

db.exec(`
CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  nomeSocial TEXT NOT NULL,
  dataNascimento TEXT NOT NULL,
  dataCadastro TEXT NOT NULL,
  titularId TEXT REFERENCES clientes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS enderecos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clienteId TEXT NOT NULL UNIQUE REFERENCES clientes(id) ON DELETE CASCADE,
  rua TEXT NOT NULL DEFAULT '',
  bairro TEXT NOT NULL DEFAULT '',
  cidade TEXT NOT NULL DEFAULT '',
  estado TEXT NOT NULL DEFAULT '',
  pais TEXT NOT NULL DEFAULT '',
  codigoPostal TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS telefones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clienteId TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  ddd TEXT NOT NULL,
  numero TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clienteId TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  tipo TEXT NOT NULL,
  dataExpedicao TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS acomodacoes (
  id TEXT PRIMARY KEY,
  nomeAcomodacao TEXT NOT NULL,
  camaSolteiro INTEGER NOT NULL DEFAULT 0,
  camaCasal INTEGER NOT NULL DEFAULT 0,
  suite INTEGER NOT NULL DEFAULT 0,
  climatizacao INTEGER NOT NULL DEFAULT 0,
  garagem INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hospedagens (
  id TEXT PRIMARY KEY,
  clienteId TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  acomodacaoId TEXT NOT NULL REFERENCES acomodacoes(id),
  dataEntrada TEXT NOT NULL,
  dataSaida TEXT
);
`);

const acomodCount = db.prepare('SELECT COUNT(*) as c FROM acomodacoes').get() as { c: number };
if (acomodCount.c === 0) {
  const insert = db.prepare(`INSERT INTO acomodacoes
    (id, nomeAcomodacao, camaSolteiro, camaCasal, suite, climatizacao, garagem)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const seed: [string, string, number, number, number, number, number][] = [
    ['ac-1', 'Acomodação simples para solteiro(a)', 1, 0, 1, 1, 0],
    ['ac-2', 'Acomodação com garagem para solteiro(a)', 1, 0, 1, 1, 1],
    ['ac-3', 'Acomodação simples para casal', 0, 1, 1, 1, 0],
    ['ac-4', 'Acomodação para família com até duas crianças', 2, 1, 0, 1, 1],
    ['ac-5', 'Acomodação para família com até cinco crianças', 5, 1, 1, 1, 2],
    ['ac-6', 'Acomodação para até duas famílias, casal e três crianças cada', 6, 2, 2, 1, 3],
  ];
  for (const row of seed) insert.run(...row);
}

const clienteCount = db.prepare('SELECT COUNT(*) as c FROM clientes').get() as { c: number };
if (clienteCount.c === 0) {
  const insertCliente = db.prepare(`INSERT INTO clientes (id, nome, nomeSocial, dataNascimento, dataCadastro) VALUES (?, ?, ?, ?, ?)`);
  const insertEndereco = db.prepare(`INSERT INTO enderecos (clienteId, rua, bairro, cidade, estado, pais, codigoPostal) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertTelefone = db.prepare(`INSERT INTO telefones (clienteId, ddd, numero) VALUES (?, ?, ?)`);
  const insertDocumento = db.prepare(`INSERT INTO documentos (clienteId, numero, tipo, dataExpedicao) VALUES (?, ?, ?, ?)`);

  insertCliente.run('cli-1', 'Ana Carvalho', 'Ana', '1990-05-14T12:00:00.000Z', '2024-01-10T12:00:00.000Z');
  insertEndereco.run('cli-1', 'Rua das Flores, 42', 'Jardim Primavera', 'São Paulo', 'SP', 'Brasil', '01310-100');
  insertTelefone.run('cli-1', '11', '98765-4321');
  insertDocumento.run('cli-1', '123.456.789-00', 'Cadastro de Pessoas Física', '2010-03-01T12:00:00.000Z');

  insertCliente.run('cli-2', 'Carlos Mendes', 'Carlos', '1985-11-22T12:00:00.000Z', '2024-02-15T12:00:00.000Z');
  insertEndereco.run('cli-2', 'Av. Atlântica, 800', 'Copacabana', 'Rio de Janeiro', 'RJ', 'Brasil', '22010-000');
  insertTelefone.run('cli-2', '21', '99123-4567');
  insertDocumento.run('cli-2', '987.654.321-00', 'Cadastro de Pessoas Física', '2008-07-15T12:00:00.000Z');
}
