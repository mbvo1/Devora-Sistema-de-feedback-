const { db } = require('./firebaseConfig');
const {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit
} = require('firebase/firestore');

/**
 * Salva um feedback no Firestore.
 * Aceita tanto a chamada antiga (estrelas, emoji, comentario)
 * quanto um objeto com metadados adicionais.
 */
async function salvarFeedback(dadosOuEstrelas, emoji, comentario) {
    try {
        let payload;

        if (typeof dadosOuEstrelas === 'object') {
            const dados = dadosOuEstrelas || {};
            payload = {
                estrelas: Number(dados.estrelas) || 0,
                emoji: dados.emoji || 'Sem emoji',
                comentario: dados.comentario || '',
                tipoMensagem: dados.tipoMensagem || null,
                cursoId: dados.cursoId || null,
                cursoNome: dados.cursoNome || null,
                usuarioId: dados.usuarioId || null,
                canal: dados.canal || null,
                data: new Date()
            };
        } else {
            // Assinatura antiga: salvarFeedback(estrelas, emoji, comentario)
            payload = {
                estrelas: Number(dadosOuEstrelas) || 0,
                emoji: emoji || 'Sem emoji',
                comentario: comentario || '',
                data: new Date()
            };
        }

        const docRef = await addDoc(collection(db, 'feedbacks'), payload);
        console.log('✅ Feedback salvo no ID:', docRef.id);

        return { sucesso: true, id: docRef.id };
    } catch (erro) {
        console.error('❌ Erro ao salvar feedback:', erro);
        return { sucesso: false, erro: erro.message };
    }
}

/**
 * Lista feedbacks mais recentes para histórico / relatórios.
 */
async function listarFeedbacks(limiteResultados = 50) {
    try {
        const feedbacksRef = collection(db, 'feedbacks');
        const q = query(feedbacksRef, orderBy('data', 'desc'), limit(limiteResultados));
        const snapshot = await getDocs(q);

        const itens = snapshot.docs.map((docSnap) => {
            const dados = docSnap.data();
            let dataIso = null;

            if (dados.data) {
                if (typeof dados.data.toDate === 'function') {
                    dataIso = dados.data.toDate().toISOString();
                } else if (dados.data instanceof Date) {
                    dataIso = dados.data.toISOString();
                } else {
                    dataIso = dados.data;
                }
            }

            return {
                id: docSnap.id,
                estrelas: dados.estrelas || 0,
                emoji: dados.emoji || '',
                comentario: dados.comentario || '',
                cursoId: dados.cursoId || null,
                cursoNome: dados.cursoNome || null,
                usuarioId: dados.usuarioId || null,
                canal: dados.canal || null,
                tipoMensagem: dados.tipoMensagem || null,
                data: dataIso
            };
        });

        return { sucesso: true, itens };
    } catch (erro) {
        console.error('❌ Erro ao listar feedbacks:', erro);
        return { sucesso: false, erro: erro.message, itens: [] };
    }
}

/**
 * Gera estatísticas consolidadas para o painel administrativo.
 * - Média geral das notas
 * - Total de feedbacks
 * - Distribuição das notas (1 a 5)
 * - Comentários mais recentes
 */
async function obterEstatisticasFeedback() {
    try {
        const resultadoLista = await listarFeedbacks(500);
        if (!resultadoLista.sucesso) {
            return resultadoLista;
        }

        const itens = resultadoLista.itens;

        if (!itens.length) {
            return {
                sucesso: true,
                totalFeedbacks: 0,
                mediaGeral: 0,
                distribuicaoNotas: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                comentariosRecentes: []
            };
        }

        const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let somaNotas = 0;
        let quantidadeNotasValidas = 0;

        itens.forEach((fb) => {
            const nota = Number(fb.estrelas);
            if (nota >= 1 && nota <= 5) {
                distribuicao[nota] += 1;
                somaNotas += nota;
                quantidadeNotasValidas += 1;
            }
        });

        const mediaGeral =
            quantidadeNotasValidas > 0 ? Number((somaNotas / quantidadeNotasValidas).toFixed(1)) : 0;

        const comentariosRecentes = itens
            .filter((fb) => fb.comentario && fb.comentario.trim() !== '')
            .slice(0, 5);

        return {
            sucesso: true,
            totalFeedbacks: itens.length,
            mediaGeral,
            distribuicaoNotas: distribuicao,
            comentariosRecentes
        };
    } catch (erro) {
        console.error('❌ Erro ao obter estatísticas de feedback:', erro);
        return { sucesso: false, erro: erro.message };
    }
}

module.exports = { salvarFeedback, listarFeedbacks, obterEstatisticasFeedback };
