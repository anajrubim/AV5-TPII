import { Router } from 'express';
import {
  listarHospedagens,
  buscarHospedagemAtiva,
  registrarHospedagem,
  encerrarHospedagem,
  removerHospedagem,
} from '../repositories/hotelRepository.js';

export const hospedagensRouter = Router();

hospedagensRouter.get('/', (_req, res) => {
  res.json(listarHospedagens());
});

hospedagensRouter.get('/ativa/:clienteId', (req, res) => {
  const hospedagem = buscarHospedagemAtiva(req.params.clienteId);
  res.json(hospedagem ?? null);
});

hospedagensRouter.post('/', (req, res) => {
  const { clienteId, acomodacaoId } = req.body;
  if (!clienteId) return res.status(400).json({ erro: 'Selecione um hóspede.' });
  if (!acomodacaoId) return res.status(400).json({ erro: 'Selecione uma acomodação.' });

  const resultado = registrarHospedagem(clienteId, acomodacaoId);
  if (!resultado.ok) return res.status(409).json({ erro: resultado.erro });
  res.status(201).json(resultado.hospedagem);
});

hospedagensRouter.post('/:id/encerrar', (req, res) => {
  const resultado = encerrarHospedagem(req.params.id);
  if (!resultado.ok) return res.status(409).json({ erro: resultado.erro });
  res.status(204).end();
});

hospedagensRouter.delete('/:id', (req, res) => {
  removerHospedagem(req.params.id);
  res.status(204).end();
});
