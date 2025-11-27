let selectedStar = null;
let selectedEmoji = null;

// Retorna o tipo de mensagem de acordo com a nota
function obterTipoMensagem(nota) {
    const numero = Number(nota);

    if (!numero) {
        return 'neutra'; // fallback
    } else if (numero >= 4) {
        return 'positiva';
    } else if (numero === 3) {
        return 'neutra';
    } else {
        return 'empatica';
    }
}

const mockFeedbacks = [
    {
        id: 1,
        data: '2025-11-20',
        curso: 'Gestão de Projetos',
        nota: 5,
        emoji: '😄',
        comentario: 'Curso excelente, conteúdo muito claro e aplicável.'
    },
    {
        id: 2,
        data: '2025-11-18',
        curso: 'Marketing Digital',
        nota: 3,
        emoji: '😐',
        comentario: 'Achei o conteúdo bom, mas poderia ter mais exemplos práticos.'
    },
    {
        id: 3,
        data: '2025-11-15',
        curso: 'Gestão de Projetos',
        nota: 2,
        emoji: '😞',
        comentario: 'Tive dificuldades em acompanhar algumas partes mais técnicas.'
    },
    {
        id: 4,
        data: '2025-11-10',
        curso: 'Finanças Pessoais',
        nota: 4,
        emoji: '😊',
        comentario: 'Gostei bastante, principalmente da parte de investimentos.'
    }
];

// Lê parâmetros da query string (?id=123 etc.)
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}
// Chave usada para guardar o canal preferido no navegador (simula persistência até a API ficar pronta)
const CANAL_PREFERIDO_KEY = 'nexura_canal_preferido';


// Mostra uma mensagem de acordo com a nota + botão Voltar ao menu
function mostrarMensagemPorNota(nota) {
    const box = document.getElementById('feedbackMessage');
    if (!box) return;

    // limpa classes e garante que apareça
    box.className = 'feedback-message';
    box.style.display = 'block';

    const tipo = obterTipoMensagem(nota);
    let texto = '';

    if (tipo === 'positiva') {
        box.classList.add('feedback-message--positiva');
        texto = 'Que bom que você gostou! Ficamos muito felizes que você teve uma ótima experiência com o curso.';
    } else if (tipo === 'neutra') {
        box.classList.add('feedback-message--neutra');
        texto = 'Agradecemos sua opinião. Seu feedback nos ajuda a entender o que podemos manter e o que ainda dá para melhorar.';
    } else { // empática
        box.classList.add('feedback-message--negativa');
        texto = 'Lamentamos a experiência. Vamos melhorar! Seu feedback é essencial para que possamos corrigir os pontos necessários.';
    }

    // mensagem + botão "Voltar ao menu"
    box.innerHTML = `
        <p>${texto}</p>
        <button id="btnVoltarMenu" class="btn feedback-back-btn">
            Voltar ao menu
        </button>
    `;

    const btnVoltar = document.getElementById('btnVoltarMenu');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            window.location.href = '/'; // ou '/index.html' se preferir
        });
    }
}
// =========================
// Página de Histórico (HUS-007)
// =========================

const historyTableBody = document.getElementById('historyTableBody');
const historyEmptyMessage = document.getElementById('historyEmptyMessage');

if (historyTableBody) {
    const filterCurso = document.getElementById('filterCurso');
    const filterTexto = document.getElementById('filterTexto');

    // Preenche o select de cursos com base nos dados mock
    const preencherOpcoesCurso = () => {
        const cursosUnicos = Array.from(new Set(mockFeedbacks.map(fb => fb.curso)));

        cursosUnicos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso;
            option.textContent = curso;
            filterCurso.appendChild(option);
        });
    };

    // Renderiza as linhas da tabela
    const renderTabela = (lista) => {
        historyTableBody.innerHTML = '';

        // Caso não exista NENHUM feedback cadastrado
        if (!mockFeedbacks.length) {
            historyEmptyMessage.textContent = 'Você ainda não enviou nenhum feedback.';
            historyEmptyMessage.style.display = 'block';
            return;
        }

        // Caso existam feedbacks, mas o filtro zerou a lista
        if (!lista.length) {
            historyEmptyMessage.textContent = 'Nenhum feedback encontrado com os filtros atuais.';
            historyEmptyMessage.style.display = 'block';
            return;
        }

        historyEmptyMessage.style.display = 'none';

        lista.forEach(fb => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${fb.data}</td>
                <td>${fb.curso}</td>
                <td>${fb.nota}</td>
                <td>${fb.emoji}</td>
                <td>${fb.comentario}</td>
                <td>
                    <button class="btn history-detail-btn" data-id="${fb.id}">
                        Ver detalhes
                    </button>
                </td>
            `;

            historyTableBody.appendChild(tr);
        });

        // Adiciona os listeners dos botões "Ver detalhes"
        document.querySelectorAll('.history-detail-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                // abre página de detalhes, passando o id na URL
                window.location.href = `/detalhe-feedback.html?id=${id}`;
            });
        });
    };

    // Aplica filtros de curso e texto
    const aplicarFiltros = () => {
        const cursoSelecionado = filterCurso.value;
        const textoBusca = filterTexto.value.trim().toLowerCase();

        const filtrados = mockFeedbacks.filter(fb => {
            const confereCurso = cursoSelecionado
                ? fb.curso === cursoSelecionado
                : true;

            const confereTexto = textoBusca
                ? fb.comentario.toLowerCase().includes(textoBusca)
                : true;

            return confereCurso && confereTexto;
        });

        renderTabela(filtrados);
    };

    // Inicialização da página de histórico
    preencherOpcoesCurso();
    aplicarFiltros();

    filterCurso.addEventListener('change', aplicarFiltros);
    filterTexto.addEventListener('input', aplicarFiltros);
}
// =========================
// Página de Detalhe do Feedback (HUS-007 - AC5)
// =========================

const detalheContainer = document.getElementById('detalheContainer');

if (detalheContainer) {
    const idParam = getQueryParam('id');
    const idNumero = Number(idParam);

    const feedback = mockFeedbacks.find(fb => fb.id === idNumero);

    if (!feedback) {
        detalheContainer.innerHTML = `
            <h2>Feedback não encontrado</h2>
            <p>Não foi possível localizar o feedback solicitado.</p>
            <a href="/historico.html" class="detail-back-link">Voltar ao histórico</a>
        `;
    } else {
        detalheContainer.innerHTML = `
            <h2>Detalhes do feedback</h2>
            <div class="detail-meta">
                <span><strong>Curso:</strong> ${feedback.curso}</span>
                <span><strong>Data:</strong> ${feedback.data}</span>
                <span><strong>Nota:</strong> ${feedback.nota} ${feedback.emoji}</span>
            </div>
            <div class="detail-comentario">
                <strong>Comentário:</strong>
                <p>${feedback.comentario || 'Nenhum comentário foi informado.'}</p>
            </div>
            <a href="/historico.html" class="detail-back-link">← Voltar ao histórico</a>
        `;
    }
}

// =========================
// Último feedback na home (HUS-011)
// =========================

const lastFeedbackCard = document.getElementById('lastFeedbackCard');

if (lastFeedbackCard) {
    if (!mockFeedbacks.length) {
        lastFeedbackCard.innerHTML = `
            <p>Você ainda não possui feedbacks registrados.</p>
        `;
    } else {
        // Garante que está do mais recente para o mais antigo
        const ordenados = [...mockFeedbacks].sort((a, b) => {
            return new Date(b.data) - new Date(a.data);
        });

        const ultimo = ordenados[0];

        lastFeedbackCard.innerHTML = `
            <div class="last-feedback-meta">
                <span><strong>Curso:</strong> ${ultimo.curso}</span>
                <span><strong>Data:</strong> ${ultimo.data}</span>
                <span><strong>Nota:</strong> ${ultimo.nota} ${ultimo.emoji}</span>
            </div>
            <div class="last-feedback-comentario">
                <strong>Comentário:</strong>
                <p>${ultimo.comentario || 'Nenhum comentário foi informado.'}</p>
            </div>
        `;
    }
}
// =========================
// Preferências de canal (HUS-008)
// =========================

const canalForm = document.getElementById('canalForm');
const salvarCanalBtn = document.getElementById('salvarCanalBtn');
const canalMessage = document.getElementById('canalMessage');

if (canalForm && salvarCanalBtn && canalMessage) {

    // Carrega o canal salvo (ou plataforma como padrão)
    const canalSalvo = localStorage.getItem(CANAL_PREFERIDO_KEY) || 'plataforma';

    const radios = canalForm.querySelectorAll('input[name="canal"]');
    radios.forEach(r => {
        r.checked = r.value === canalSalvo;
    });

    const mostrarMensagem = (texto, tipo) => {
        canalMessage.textContent = texto;
        canalMessage.className = 'settings-message'; // reseta
        if (tipo === 'sucesso') {
            canalMessage.classList.add('settings-message--sucesso');
        } else if (tipo === 'alerta') {
            canalMessage.classList.add('settings-message--alerta');
        }
        canalMessage.style.display = 'block';
    };

    // Função que, no futuro, pode usar resposta do backend pra saber indisponibilidade
    const verificarDisponibilidadeCanal = (canal) => {
        // Por enquanto, assume que todos estão disponíveis.
        // Quando o backend informar indisponibilidade, você pode ajustar aqui.
        return { disponivel: true, canalFallback: 'plataforma' };

        // EXEMPLO se quiser simular WhatsApp indisponível:
        // if (canal === 'whatsapp') {
        //   return { disponivel: false, canalFallback: 'plataforma' };
        // }
        // return { disponivel: true, canalFallback: canal };
    };

    salvarCanalBtn.addEventListener('click', () => {
        const selecionado = canalForm.querySelector('input[name="canal"]:checked');
        if (!selecionado) return;

        let canalEscolhido = selecionado.value;
        const { disponivel, canalFallback } = verificarDisponibilidadeCanal(canalEscolhido);

        if (!disponivel) {
            // AC4 (estrutura pronta): canal indisponível → usa plataforma e avisa
            canalEscolhido = canalFallback;
            // atualiza seleção visual
            radios.forEach(r => {
                r.checked = r.value === canalEscolhido;
            });
            mostrarMensagem(
                'Canal selecionado indisponível. O envio será feito pela plataforma.',
                'alerta'
            );
        } else {
            // Salva no localStorage (simulação de persistência até ter API)
            localStorage.setItem(CANAL_PREFERIDO_KEY, canalEscolhido);

            // AC3: mensagem de confirmação
            mostrarMensagem(
                'Seu canal preferido foi atualizado com sucesso.',
                'sucesso'
            );
        }

        // TODO (integração futura):
        // aqui é o ponto ideal para chamar a API:
        // fetch('/api/canal-preferido', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ canal: canalEscolhido })
        // });
    });
}

// Verifica se é a página de feedback
if (document.getElementById("sendBtn")) {


// Seleção de estrelas
document.querySelectorAll('#stars span').forEach(star => {
star.addEventListener('click', () => {
selectedStar = star.getAttribute('data-value');
document.querySelectorAll('#stars span').forEach(s => s.classList.remove('selected'));
star.classList.add('selected');
});
});


// Seleção de emojis
document.querySelectorAll('#emojis span').forEach(emoji => {
emoji.addEventListener('click', () => {
selectedEmoji = emoji.getAttribute('data-value');
document.querySelectorAll('#emojis span').forEach(e => e.classList.remove('selected'));
emoji.classList.add('selected');
});
});

// Enviar feedback
document.getElementById('sendBtn').addEventListener('click', async () => {
    const comment = document.getElementById('comment').value;

    // Descobre o tipo de mensagem com base na nota escolhida
    const tipoMensagem = obterTipoMensagem(selectedStar);

    const payload = {
        estrelas: selectedStar,
        emoji: selectedEmoji,
        comentario: comment,
        tipoMensagem: tipoMensagem
    };

    try {
        const response = await fetch('http://localhost:3000/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Erro ao enviar feedback');
        }

        // Mostra a mensagem personalizada conforme a nota
        mostrarMensagemPorNota(selectedStar);

        // Opcional: limpar comentário e desmarcar estrela/emoji
        const commentEl = document.getElementById('comment');
        if (commentEl) commentEl.value = '';

        document
            .querySelectorAll('#stars span, #emojis span')
            .forEach(el => el.classList.remove('selected'));

        selectedStar = null;
        selectedEmoji = null;

    } catch (error) {
        alert('Erro ao enviar feedback.');
        console.error(error);
    }
});

}


// Verifica se é a página do admin
if (document.getElementById("feedbackTable")) {
// Exemplo de carregamento futuro (fake por enquanto)
console.log("Dashboard pronto para integração com o backend.");
}
