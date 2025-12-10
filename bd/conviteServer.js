const { db } = require('./firebaseConfig');
const {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    limit
} = require('firebase/firestore');

/**
 * Registra um convite de feedback, garantindo que não haja duplicidade
 * por combinação de curso + usuário (HUS-001).
 */
async function registrarConvite({ cursoId, cursoNome, usuarioId, canal }) {
    try {
        const convitesRef = collection(db, 'convitesFeedback');

        // Verifica se já existe convite para o mesmo curso e usuário (AC2)
        const q = query(
            convitesRef,
            where('cursoId', '==', cursoId),
            where('usuarioId', '==', usuarioId),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const existente = snapshot.docs[0];
            console.log('ℹ️ Convite já existente para curso/usuário:', existente.id);
            return { sucesso: true, duplicado: true, id: existente.id };
        }

        const agora = new Date();

        const docRef = await addDoc(convitesRef, {
            cursoId,
            cursoNome: cursoNome || null,
            usuarioId,
            canal: canal || 'plataforma',
            dataEnvio: agora,
            status: 'enviado' // AC5: status de envio registrado
        });

        console.log('✅ Convite de feedback criado:', docRef.id);
        return { sucesso: true, duplicado: false, id: docRef.id };
    } catch (erro) {
        console.error('❌ Erro ao registrar convite:', erro);
        return { sucesso: false, erro: erro.message };
    }
}

module.exports = { registrarConvite };

