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

// Se houver parâmetro de nota na URL e um container de mensagem,
// exibe automaticamente o texto de confirmação (tela FBK-04).
const notaParamConfirmacao = getQueryParam('nota');
if (notaParamConfirmacao && document.getElementById('feedbackMessage') && !document.getElementById('sendBtn')) {
    mostrarMensagemPorNota(notaParamConfirmacao);
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

// =========================
// Login simples do administrador (fluxo de navegação)
// =========================
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.addEventListener('click', (event) => {
        event.preventDefault();
        // Futuramente, aqui entraria a validação real de credenciais.
        // Por enquanto, apenas navegamos para o painel administrativo.
        window.location.href = '/admin.html';
    });
}

// Verifica se é a página de feedback
if (document.getElementById('sendBtn')) {
    const sendBtn = document.getElementById('sendBtn');
    const commentEl = document.getElementById('comment');
    const feedbackBox = document.getElementById('feedbackMessage');
    const courseInfoEl = document.getElementById('feedbackCourseInfo');

    // Lê parâmetros de curso/usuário vindos do link de convite (HUS-001 + HUS-002)
    const cursoNomeParam = getQueryParam('cursoNome');
    const cursoIdParam = getQueryParam('cursoId');
    const usuarioIdParam = getQueryParam('usuarioId');

    if (courseInfoEl) {
        if (cursoNomeParam) {
            courseInfoEl.textContent = `Você está avaliando o curso "${cursoNomeParam}".`;
        } else {
            courseInfoEl.textContent =
                'Sua opinião ajuda a melhorar os próximos cursos. Selecione uma nota de 1 a 5.';
        }
    }

    const canalPreferido = localStorage.getItem(CANAL_PREFERIDO_KEY) || 'plataforma';

    const atualizarEstadoBotao = () => {
        const notaSelecionada = selectedStar || selectedEmoji;
        if (sendBtn) {
            sendBtn.disabled = !notaSelecionada;
        }
    };

    const mostrarErroEnvio = () => {
        const mensagem =
            'Não foi possível registrar sua avaliação. Tente novamente mais tarde.';

        if (feedbackBox) {
            feedbackBox.className = 'feedback-message';
            feedbackBox.style.display = 'block';
            feedbackBox.textContent = mensagem;
        } else {
            alert(mensagem);
        }
    };

    // Seleção de estrelas
    document.querySelectorAll('#stars span').forEach((star) => {
        star.addEventListener('click', () => {
            selectedStar = star.getAttribute('data-value');
            document
                .querySelectorAll('#stars span')
                .forEach((s) => s.classList.remove('selected'));
            star.classList.add('selected');
            atualizarEstadoBotao();
        });
    });

    // Seleção de emojis
    document.querySelectorAll('#emojis span').forEach((emojiEl) => {
        emojiEl.addEventListener('click', () => {
            selectedEmoji = emojiEl.getAttribute('data-value');
            document
                .querySelectorAll('#emojis span')
                .forEach((e) => e.classList.remove('selected'));
            emojiEl.classList.add('selected');
            atualizarEstadoBotao();
        });
    });

    // Enviar feedback
    sendBtn.addEventListener('click', async () => {
        const notaSelecionada = selectedStar || selectedEmoji;
        if (!notaSelecionada) {
            atualizarEstadoBotao();
            return;
        }

        const comentario = commentEl ? commentEl.value : '';

        // Descobre o tipo de mensagem com base na nota escolhida
        const tipoMensagem = obterTipoMensagem(notaSelecionada);

        const payload = {
            estrelas: notaSelecionada,
            emoji: selectedEmoji,
            comentario,
            tipoMensagem,
            cursoId: cursoIdParam,
            cursoNome: cursoNomeParam,
            usuarioId: usuarioIdParam,
            canal: canalPreferido
        };

        try {
            sendBtn.disabled = true;

            const response = await fetch('http://localhost:3000/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar feedback');
            }

            // Redireciona para a tela de confirmação com a nota (AC4)
            window.location.href = `/feedback-confirmacao.html?nota=${encodeURIComponent(
                notaSelecionada
            )}`;
        } catch (error) {
            console.error(error);
            mostrarErroEnvio(); // AC5
            atualizarEstadoBotao();
        }
    });
}

// =========================
// Painel administrativo (HUS-005)
// =========================

if (document.getElementById('adminContent')) {
    const adminNoData = document.getElementById('adminNoData');
    const adminContent = document.getElementById('adminContent');
    const kpiMediaGeral = document.getElementById('kpiMediaGeral');
    const kpiTotalFeedbacks = document.getElementById('kpiTotalFeedbacks');
    const kpiTotalPositivas = document.getElementById('kpiTotalPositivas');
    const resumoTextoEl = document.getElementById('adminResumoTexto');

    const miniGaugeRuim = document.getElementById('miniGaugeRuim');
    const miniGaugeNeutro = document.getElementById('miniGaugeNeutro');
    const miniGaugeBom = document.getElementById('miniGaugeBom');

    const ratingBars = {
        1: document.getElementById('ratingBar1'),
        2: document.getElementById('ratingBar2'),
        3: document.getElementById('ratingBar3'),
        4: document.getElementById('ratingBar4'),
        5: document.getElementById('ratingBar5')
    };

    const ratingMediaTextoEl = document.getElementById('ratingMediaTexto');
    const ratingMediaStarsEl = document.getElementById('ratingMediaStars');
    const recentFeedbackList = document.getElementById('recentFeedbackList');
    const melhoriasList = document.getElementById('listaMelhorias');

    const chartGaugeEl = document.getElementById('chartGaugeMedia');
    const chartDistribuicaoEl = document.getElementById('chartDistribuicaoNotas');
    const tabelaResumoNotasBody = document.querySelector('#tabelaResumoNotas tbody');

    let chartGauge = null;
    let chartDistribuicao = null;

    const formatarData = (isoString) => {
        if (!isoString) return '-';
        const data = new Date(isoString);
        if (Number.isNaN(data.getTime())) return '-';
        return data.toLocaleDateString('pt-BR');
    };

    const gerarEstrelas = (nota) => {
        const valor = Math.round(Number(nota) || 0);
        const cheio = Math.max(0, Math.min(5, valor));
        return '★★★★★'.slice(0, cheio);
    };

    const atualizarGauge = (mediaGeral) => {
        if (!window.Chart || !chartGaugeEl) return;

        const valor = Math.max(0, Math.min(5, Number(mediaGeral) || 0));
        const datasetData = [valor, Math.max(0, 5 - valor)];

        if (chartGauge) {
            chartGauge.data.datasets[0].data = datasetData;
            chartGauge.update();
        } else {
            chartGauge = new Chart(chartGaugeEl, {
                type: 'doughnut',
                data: {
                    labels: ['Satisfação', ''],
                    datasets: [
                        {
                            data: datasetData,
                            backgroundColor: ['#28a745', '#e1e4f2'],
                            borderWidth: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    rotation: -Math.PI,
                    circumference: Math.PI,
                    cutout: '70%',
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                }
            });
        }
    };

    const atualizarDistribuicoes = (distribuicaoNotas, totalFeedbacks) => {
        const dist = distribuicaoNotas || {};
        const total = totalFeedbacks || 0;
        const negativo = (dist[1] || 0) + (dist[2] || 0);
        const neutro = dist[3] || 0;
        const positivo = (dist[4] || 0) + (dist[5] || 0);

        if (kpiTotalPositivas) {
            kpiTotalPositivas.textContent = positivo;
        }

        const percentualPositivo = total ? Math.round((positivo / total) * 100) : 0;

        if (resumoTextoEl) {
            resumoTextoEl.textContent =
                percentualPositivo >= 70
                    ? `De ${percentualPositivo}% a ${percentualPositivo}% Excelente! Continuar reforçando os pontos fortes.`
                    : `De ${percentualPositivo}% a ${percentualPositivo}% Bom! Mas possivelmente existem muitas oportunidades de melhorias.`;
        }

        const aplicarLargura = (el, valor) => {
            if (!el) return;
            const percentual = total ? (valor / total) * 100 : 0;
            el.style.width = `${percentual}%`;
        };

        aplicarLargura(miniGaugeRuim, negativo);
        aplicarLargura(miniGaugeNeutro, neutro);
        aplicarLargura(miniGaugeBom, positivo);

        const labels = [1, 2, 3, 4, 5];

        labels.forEach((nota) => {
            aplicarLargura(ratingBars[nota], dist[nota] || 0);
        });

        // Atualiza gráfico de barras (Chart.js)
        if (window.Chart && chartDistribuicaoEl) {
            const dadosBarras = labels.map((nota) => dist[nota] || 0);

            if (chartDistribuicao) {
                chartDistribuicao.data.datasets[0].data = dadosBarras;
                chartDistribuicao.update();
            } else {
                chartDistribuicao = new Chart(chartDistribuicaoEl, {
                    type: 'bar',
                    data: {
                        labels: labels.map((n) => String(n)),
                        datasets: [
                            {
                                label: 'Quantidade de respostas',
                                data: dadosBarras,
                                backgroundColor: '#ffd900'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: {
                                grid: { display: false }
                            },
                            y: {
                                beginAtZero: true,
                                ticks: { precision: 0 }
                            }
                        }
                    }
                });
            }
        }

        // Atualiza tabela resumo de notas
        if (tabelaResumoNotasBody) {
            tabelaResumoNotasBody.innerHTML = '';
            labels.forEach((nota) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${nota}</td><td>${dist[nota] || 0}</td>`;
                tabelaResumoNotasBody.appendChild(tr);
            });
        }
    };

    const preencherRecentesEMelhorias = (comentariosRecentes = []) => {
        if (recentFeedbackList) {
            recentFeedbackList.innerHTML = '';

            comentariosRecentes.slice(0, 3).forEach((fb, index) => {
                const item = document.createElement('div');
                item.className = 'recent-feedback-item';
                const nomeBase = fb.cursoNome || `Curso ${index + 1}`;

                item.innerHTML = `
                    <div class="recent-avatar"></div>
                    <div class="recent-feedback-info">
                        <strong>${nomeBase}</strong>
                        <div class="recent-feedback-meta">
                            ${formatarData(fb.data)} • Nota ${fb.estrelas || '-'}
                        </div>
                        <div class="recent-feedback-stars">
                            ${gerarEstrelas(fb.estrelas)}
                        </div>
                    </div>
                `;

                recentFeedbackList.appendChild(item);
            });
        }

        if (melhoriasList) {
            melhoriasList.innerHTML = '';

            const melhorias = comentariosRecentes
                .filter((fb) => fb.comentario && fb.comentario.trim() !== '')
                .slice(0, 3);

            melhorias.forEach((fb, index) => {
                const li = document.createElement('li');
                li.className = 'melhoria-item';

                const nomeBase = fb.cursoNome || `Curso ${index + 1}`;
                const snippet =
                    fb.comentario.length > 90
                        ? `${fb.comentario.slice(0, 87)}...`
                        : fb.comentario;

                li.innerHTML = `
                    <div class="melhoria-avatar"></div>
                    <div class="melhoria-textos">
                        <strong>${nomeBase}</strong>
                        <p>"${snippet}"</p>
                        <div class="melhoria-stars">
                            ${gerarEstrelas(fb.estrelas)}
                        </div>
                    </div>
                `;

                melhoriasList.appendChild(li);
            });
        }
    };

    const atualizarRelatorio = async () => {
        try {
            const resposta = await fetch('/api/relatorios/resumo');
            const dados = await resposta.json();

            if (!resposta.ok || dados.sucesso === false) {
                throw new Error(dados.erro || 'Erro ao carregar relatório');
            }

            const { totalFeedbacks, mediaGeral, distribuicaoNotas, comentariosRecentes } = dados;

            if (!totalFeedbacks) {
                if (adminNoData) adminNoData.style.display = 'block';
                if (adminContent) adminContent.style.display = 'none';
                return;
            }

            if (adminNoData) adminNoData.style.display = 'none';
            if (adminContent) adminContent.style.display = 'block';

            if (kpiTotalFeedbacks) {
                kpiTotalFeedbacks.textContent = totalFeedbacks;
            }

            if (kpiMediaGeral) {
                const valorFormatado =
                    typeof mediaGeral === 'number' && !Number.isNaN(mediaGeral)
                        ? mediaGeral.toFixed(1).replace('.', ',')
                        : '-';
                kpiMediaGeral.textContent = valorFormatado;
            }

            if (ratingMediaTextoEl) {
                const valor =
                    typeof mediaGeral === 'number' && !Number.isNaN(mediaGeral)
                        ? mediaGeral.toFixed(1)
                        : '-';
                ratingMediaTextoEl.textContent = valor;
            }

            if (ratingMediaStarsEl) {
                ratingMediaStarsEl.textContent = gerarEstrelas(mediaGeral);
            }

            atualizarGauge(mediaGeral);
            atualizarDistribuicoes(distribuicaoNotas, totalFeedbacks);
            preencherRecentesEMelhorias(comentariosRecentes);
        } catch (erro) {
            console.error('Erro ao atualizar relatório:', erro);
            if (adminNoData) {
                adminNoData.style.display = 'block';
                adminNoData.textContent =
                    'Não foi possível carregar os relatórios no momento. Tente novamente mais tarde.';
            }
            if (adminContent) adminContent.style.display = 'none';
        }
    };

    // Carrega imediatamente e configura atualização automática (AC2)
    atualizarRelatorio();
    setInterval(atualizarRelatorio, 15000);
}
