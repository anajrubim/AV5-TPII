import { Router } from 'express';
import {
  listarClientes,
  buscarClientePorId,
  criarCliente,
  editarCliente,
  removerCliente,
} from '../repositories/clienteRepository.js';

export const clientesRouter = Router();

clientesRouter.get('/', (_req, res) => {
  res.json(listarClientes());
});

clientesRouter.get('/:id', (req, res) => {
  const cliente = buscarClientePorId(req.params.id);
  if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });
  res.json(cliente);
});

clientesRouter.post('/', (req, res) => {
  const { nome, nomeSocial, dataNascimento, telefones, endereco, documentos } = req.body;

  if (!nome || !String(nome).trim()) {
    return res.status(400).json({ erro: 'Nome é obrigatório.' });
  }
  if (!dataNascimento) {
    return res.status(400).json({ erro: 'Data de nascimento é obrigatória.' });
  }

  const cliente = criarCliente({
    nome: String(nome).trim(),
    nomeSocial: nomeSocial ? String(nomeSocial).trim() : String(nome).trim(),
    dataNascimento,
    telefones: telefones ?? [],
    endereco,
    documentos: documentos ?? [],
  });

  res.status(201).json(cliente);
});

clientesRouter.put('/:id', (req, res) => {
  const existente = buscarClientePorId(req.params.id);
  if (!existente) return res.status(404).json({ erro: 'Cliente não encontrado.' });

  const { nome, nomeSocial, dataNascimento, telefones, endereco, documentos } = req.body;

  if (!nome || !String(nome).trim()) {
    return res.status(400).json({ erro: 'Nome é obrigatório.' });
  }
  if (!dataNascimento) {
    return res.status(400).json({ erro: 'Data de nascimento é obrigatória.' });
  }

  const cliente = editarCliente(req.params.id, {
    nome: String(nome).trim(),
    nomeSocial: nomeSocial ? String(nomeSocial).trim() : String(nome).trim(),
    dataNascimento,
    telefones: telefones ?? [],
    endereco,
    documentos: documentos ?? [],
  });

  res.json(cliente);
});

clientesRouter.delete('/:id', (req, res) => {
  const resultado = removerCliente(req.params.id);
  if (!resultado.ok) return res.status(409).json({ erro: resultado.erro });
  res.status(204).end();
});
