import { Router } from 'express';
import { listarAcomodacoes, buscarAcomodacaoPorId } from '../repositories/hotelRepository.js';

export const acomodacoesRouter = Router();

acomodacoesRouter.get('/', (_req, res) => {
  res.json(listarAcomodacoes());
});

acomodacoesRouter.get('/:id', (req, res) => {
  const acomodacao = buscarAcomodacaoPorId(req.params.id);
  if (!acomodacao) return res.status(404).json({ erro: 'Acomodação não encontrada.' });
  res.json(acomodacao);
});
