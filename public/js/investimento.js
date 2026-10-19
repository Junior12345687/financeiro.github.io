// ============================================================
// MÓDULO DE INVESTIMENTOS
// ============================================================
const INV_STORAGE_KEY = 'findash_investimentos';
let investimentos = [];
let investimentoEditandoId = null;

document.addEventListener('DOMContentLoaded', () => {
    investimentos = carregarInvestimentos();
    renderizarTabela();
    atualizarCards();
    renderizarGraficos();
    configurarModalGlobal('modalInvestimento', fecharModalInvestimento);
});

// ---------- Persistência ----------
function carregarInvestimentos() {
    const salvo = localStorage.getItem(INV_STORAGE_KEY);
    if (salvo) {
        try { return JSON.parse(salvo); } catch (e) { return []; }
    }
    // Dados de exemplo no primeiro acesso
    const exemplo = [
        { id: 1, nome: 'Tesouro Selic 2029', classe: 'Renda Fixa', investido: 5000, atual: 5420 },
        { id: 2, nome: 'PETR4', classe: 'Ações', investido: 3000, atual: 2850 },
        { id: 3, nome: 'KNRI11', classe: 'FIIs', investido: 2000, atual: 2180 },
        { id: 4, nome: 'Bitcoin', classe: 'Criptomoedas', investido: 1500, atual: 2400 },
        { id: 5, nome: 'Fundo Multimercado', classe: 'Fundos', investido: 4000, atual: 4300 }
    ];
    localStorage.setItem(INV_STORAGE_KEY, JSON.stringify(exemplo));
    return exemplo;
}

function salvarInvestimentos() {
    localStorage.setItem(INV_STORAGE_KEY, JSON.stringify(investimentos));
}

// ---------- Cards ----------
function atualizarCards() {
    const totalInvestido = investimentos.reduce((s, i) => s + parseFloat(i.investido), 0);
    const valorAtual = investimentos.reduce((s, i) => s + parseFloat(i.atual), 0);
    const rentabilidade = valorAtual - totalInvestido;

    document.getElementById('totalInvestido').textContent = formatarMoeda(totalInvestido);
    document.getElementById('valorAtual').textContent = formatarMoeda(valorAtual);
    document.getElementById('rentabilidade').textContent = formatarMoeda(rentabilidade);
    document.getElementById('rentabilidade').style.color = rentabilidade >= 0 ? '#10b981' : '#ef4444';
    document.getElementById('qtdAtivos').textContent = investimentos.length;
}

// ---------- Tabela ----------
function renderizarTabela() {
    const tbody = document.getElementById('tabelaInvestimentos');

    if (investimentos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-coins"></i>Nenhum ativo cadastrado.</div></td></tr>`;
        return;
    }

    tbody.innerHTML = investimentos.map(i => {
        const rent = parseFloat(i.atual) - parseFloat(i.investido);
        const perc = i.investido > 0 ? (rent / i.investido) * 100 : 0;
        return `
            <tr>
                <td><strong>${escapeHtml(i.nome)}</strong></td>
                <td>${escapeHtml(i.classe)}</td>
                <td style="text-align:right;">${formatarMoeda(i.investido)}</td>
                <td style="text-align:right;">${formatarMoeda(i.atual)}</td>
                <td style="text-align:right;" class="${rent >= 0 ? 'valor-positivo' : 'valor-negativo'}">
                    ${rent >= 0 ? '+' : ''}${formatarMoeda(rent)} (${perc.toFixed(1)}%)
                </td>
                <td style="text-align:center;">
                    <div class="row-actions">
                        <button class="icon-btn" onclick="editarInvestimento(${i.id})" title="Editar">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="icon-btn danger" onclick="excluirInvestimento(${i.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ---------- Gráficos ----------
function renderizarGraficos() {
    // Evolução da carteira (simulada com base no total atual)
    const meses = [];
    const valores = [];
    const hoje = new Date();
    const totalAtual = investimentos.reduce((s, i) => s + parseFloat(i.atual), 0);

    for (let i = 5; i >= 0; i--) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        meses.push(d.toLocaleDateString('pt-BR', { month: 'short' }));
        // Simula crescimento gradual até o valor atual
        const fator = 1 - (i * 0.05);
        valores.push(totalAtual * fator);
    }

    new Chart(document.getElementById('evolucaoChart'), {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Valor da Carteira',
                data: valores,
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56,189,248,0.15)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#e2e8f0' } } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
            }
        }
    });

    // Alocação por classe
    const classes = {};
    investimentos.forEach(i => {
        classes[i.classe] = (classes[i.classe] || 0) + parseFloat(i.atual);
    });

    new Chart(document.getElementById('alocacaoChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(classes),
            datasets: [{
                data: Object.values(classes),
                backgroundColor: ['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#e2e8f0', font: { size: 11 } } }
            }
        }
    });
}

// ---------- CRUD ----------
function abrirModalInvestimento(id = null) {
    investimentoEditandoId = id;
    const titulo = document.getElementById('modalTituloInvest');

    if (id) {
        const inv = investimentos.find(x => x.id === id);
        if (!inv) return;
        titulo.textContent = 'Editar Ativo';
        document.getElementById('invNome').value = inv.nome;
        document.getElementById('invClasse').value = inv.classe;
        document.getElementById('invInvestido').value = inv.investido;
        document.getElementById('invAtual').value = inv.atual;
    } else {
        titulo.textContent = 'Novo Ativo';
        document.getElementById('invNome').value = '';
        document.getElementById('invClasse').value = 'Renda Fixa';
        document.getElementById('invInvestido').value = '';
        document.getElementById('invAtual').value = '';
    }

    document.getElementById('modalInvestimento').classList.add('active');
    setTimeout(() => document.getElementById('invNome').focus(), 100);
}

function fecharModalInvestimento() {
    document.getElementById('modalInvestimento').classList.remove('active');
    investimentoEditandoId = null;
}

function salvarInvestimento() {
    const nome = document.getElementById('invNome').value.trim();
    const classe = document.getElementById('invClasse').value;
    const investido = parseFloat(document.getElementById('invInvestido').value);
    const atual = parseFloat(document.getElementById('invAtual').value);

    if (!nome) return mostrarToast('Informe o nome do ativo.', true);
    if (isNaN(investido) || investido <= 0) return mostrarToast('Valor investido inválido.', true);
    if (isNaN(atual) || atual < 0) return mostrarToast('Valor atual inválido.', true);

    if (investimentoEditandoId) {
        const idx = investimentos.findIndex(x => x.id === investimentoEditandoId);
        if (idx !== -1) {
            investimentos[idx] = { ...investimentos[idx], nome, classe, investido, atual };
            mostrarToast('Ativo atualizado!');
        }
    } else {
        investimentos.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            nome, classe, investido, atual
        });
        mostrarToast('Ativo adicionado!');
    }

    salvarInvestimentos();
    fecharModalInvestimento();
    renderizarTabela();
    atualizarCards();
    recriarGraficos();
}

function editarInvestimento(id) { abrirModalInvestimento(id); }

function excluirInvestimento(id) {
    const inv = investimentos.find(x => x.id === id);
    if (!inv || !confirm(`Excluir "${inv.nome}"?`)) return;
    investimentos = investimentos.filter(x => x.id !== id);
    salvarInvestimentos();
    renderizarTabela();
    atualizarCards();
    recriarGraficos();
    mostrarToast('Ativo excluído.');
}

// Recria gráficos (evita sobreposição do Chart.js)
function recriarGraficos() {
    Chart.helpers.each(Chart.instances, (instance) => instance.destroy());
    renderizarGraficos();
}

// ---------- Exportação CSV ----------
function exportarCSVInvestimentos() {
    if (investimentos.length === 0) {
        return mostrarToast('Nenhum ativo para exportar.', true);
    }

    const headers = ['Ativo', 'Classe', 'Investido', 'Valor Atual', 'Rentabilidade'];
    const linhas = investimentos.map(i => {
        const rent = parseFloat(i.atual) - parseFloat(i.investido);
        return [
            `"${i.nome.replace(/"/g, '""')}"`,
            i.classe,
            i.investido.toFixed(2).replace('.', ','),
            i.atual.toFixed(2).replace('.', ','),
            rent.toFixed(2).replace('.', ',')
        ];
    });

    const csv = [headers.join(';'), ...linhas.map(l => l.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `investimentos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    mostrarToast('CSV exportado!');
}
