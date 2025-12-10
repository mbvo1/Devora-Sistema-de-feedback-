const express = require('express');
const router = express.Router();

const {
    salvarFeedback,
    listarFeedbacks,
    obterEstatisticasFeedback
} = require('../bd/feedbackServer');
const { registrarConvite } = require('../bd/conviteServer');

// =========================
// ROTAS DE FEEDBACK (HUS-002)
// =========================
router.post('/feedback', async (req, res) => {
    try {
        const {
            estrelas,
            emoji,
            comentario,
            tipoMensagem,
            cursoId,
            cursoNome,
            usuarioId,
            canal
        } = req.body;

        const resultado = await salvarFeedback({
            estrelas,
            emoji,
            comentario,
            tipoMensagem,
            cursoId,
            cursoNome,
            usuarioId,
            canal
        });

        if (resultado.sucesso) {
            res.status(201).json({ mensagem: 'Salvo com sucesso!', id: resultado.id });
        } else {
            res.status(500).json({ mensagem: 'Erro ao salvar', erro: resultado.erro });
        }
    } catch (erro) {
        console.error('Erro na rota /feedback:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao salvar feedback.' });
    }
});

// Lista feedbacks mais recentes (apoio a histórico / relatórios)
router.get('/feedbacks', async (req, res) => {
    try {
        const limite = Number(req.query.limite) || 50;
        const resultado = await listarFeedbacks(limite);

        if (resultado.sucesso) {
            res.json(resultado);
        } else {
            res.status(500).json({ mensagem: 'Erro ao listar feedbacks', erro: resultado.erro });
        }
    } catch (erro) {
        console.error('Erro na rota /feedbacks:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao listar feedbacks.' });
    }
});

// Resumo consolidado para o painel administrativo (HUS-005)
router.get('/relatorios/resumo', async (req, res) => {
    try {
        const resultado = await obterEstatisticasFeedback();

        if (resultado.sucesso) {
            res.json(resultado);
        } else {
            res.status(500).json({ mensagem: 'Erro ao gerar relatório', erro: resultado.erro });
        }
    } catch (erro) {
        console.error('Erro na rota /relatorios/resumo:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao gerar relatório.' });
    }
});

// =========================
// ROTAS DE CONVITE (HUS-001)
// =========================
router.post('/convites', async (req, res) => {
    try {
        const {
            cursoId,
            cursoNome,
            usuarioId,
            canal
        } = req.body;

        if (!cursoId || !usuarioId) {
            return res.status(400).json({
                mensagem: 'cursoId e usuarioId são obrigatórios para gerar um convite.'
            });
        }

        const resultado = await registrarConvite({
            cursoId,
            cursoNome,
            usuarioId,
            canal
        });

        if (!resultado.sucesso) {
            return res.status(500).json({
                mensagem: 'Erro ao registrar convite de feedback.',
                erro: resultado.erro
            });
        }

        // Link direto para a tela de avaliação com os parâmetros necessários
        const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
        const linkAvaliacao = `${baseUrl}/feedback?cursoId=${encodeURIComponent(
            cursoId
        )}&cursoNome=${encodeURIComponent(cursoNome || '')}&usuarioId=${encodeURIComponent(
            usuarioId
        )}&conviteId=${encodeURIComponent(resultado.id)}`;

        return res.status(resultado.duplicado ? 200 : 201).json({
            mensagem: resultado.duplicado
                ? 'Já existia um convite para este curso e usuário.'
                : 'Convite de feedback criado com sucesso.',
            id: resultado.id,
            duplicado: resultado.duplicado,
            linkAvaliacao
        });
    } catch (erro) {
        console.error('Erro na rota /convites:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao registrar convite.' });
    }
});

// Endpoint pensada para ser chamada automaticamente
// quando um curso é concluído no sistema de origem.
router.post('/cursos/:cursoId/conclusao', async (req, res) => {
    try {
        const { cursoId } = req.params;
        const { usuarioId, cursoNome, canal, statusConclusao } = req.body;

        // AC3: Se o curso ainda NÃO foi concluído, nenhum convite é gerado.
        if (statusConclusao !== 'concluido') {
            return res.status(200).json({
                mensagem: 'Curso ainda não concluído. Nenhum convite de feedback foi gerado.'
            });
        }

        if (!cursoId || !usuarioId) {
            return res.status(400).json({
                mensagem: 'cursoId e usuarioId são obrigatórios para registrar conclusão.'
            });
        }

        const resultado = await registrarConvite({
            cursoId,
            cursoNome,
            usuarioId,
            canal
        });

        if (!resultado.sucesso) {
            return res.status(500).json({
                mensagem: 'Erro ao registrar convite de feedback.',
                erro: resultado.erro
            });
        }

        const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
        const linkAvaliacao = `${baseUrl}/feedback?cursoId=${encodeURIComponent(
            cursoId
        )}&cursoNome=${encodeURIComponent(cursoNome || '')}&usuarioId=${encodeURIComponent(
            usuarioId
        )}&conviteId=${encodeURIComponent(resultado.id)}`;

        return res.status(resultado.duplicado ? 200 : 201).json({
            mensagem: resultado.duplicado
                ? 'Convite de feedback já havia sido enviado anteriormente para este curso.'
                : 'Convite de feedback gerado automaticamente após conclusão do curso.',
            id: resultado.id,
            duplicado: resultado.duplicado,
            linkAvaliacao
        });
    } catch (erro) {
        console.error('Erro na rota /cursos/:cursoId/conclusao:', erro);
        res.status(500).json({ mensagem: 'Erro interno ao processar conclusão de curso.' });
    }
});

router.get('/teste', (req, res) => {
    res.json({ status: 'Backend funcionando!' });
});

module.exports = router;
