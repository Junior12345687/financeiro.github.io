const COPYRIGHT = {
    autor: 'Empresa XYD',
    ano: 2026,
    versao: '2.0.1-enterprise',
    licenca: 'Lei 9.610/1998, LGPD',
    aviso: '© 2026 Empresa XYD. Modificações substanciais configuram obra derivada.'
};

console.log('%c' + COPYRIGHT.aviso, 'color:#38bdf8;font-weight:bold');
console.log('Versão:', COPYRIGHT.versao, '| Licença:', COPYRIGHT.licenca);

const MotorCalculo = {

    somaSegura(valores){
        return valores.reduce((acc, v) => {
            return Math.round((acc + v) * 100 ) / 100;
        }, 0);
    },

    calcularReceitas(transacoes) {
        return this.somaSegura(
            transacoes.filter(t => t.tipo === 'entrada').map(t => t.valor)
        );
    },

    calcularSaldo(transacoes, investimentos){
        const r = this.calcularReceitas(transacoes);
        const d = this.calcularDespesas(transacoes);
        return this.somaSegura([r, -d, investimentos]);
    },

    calcularDespesas(transacoes) {
        return this.somaSegura(
            transacoes.filter(t => t.tipo === 'saida').map(t => t.valor)
        );
    },

    auditar(transacoes, investimentos, valoresExibidos){
        const resultados = [];

        const recCalc = this.calcularReceitas(transacoes);
        const despCalc = this.calcularDespesas(transacoes);
        const saldoCalc = this.calcularSaldo(transacoes, investimentos);

        resultados.push(this._validar('Receitas', recCalc, valoresExibidos.receitas));
        resultados.push(this._validar('Despesas', despCalc, valoresExibidos.despesas));
        resultados.push(this._validar('Saldo', saldoCalc, valoresExibidos.saldo));

        //regra de negocio: saldo não pode ser negativo sem alerta
        if(saldoCalc < 0){
            resultados.push({
                metrica: 'Regra de Negócio',
                status: 'warn',
                detalhe: 'Saldo negativo detectado - requer revisão contábil'
            });
        } else {
            resultados.push({
                metrica: 'Regra de Negócio',
                status: 'oK',
                detalhe: 'Saldo positivo dentro do esperado'
            });
        }

        //Consistência: nº de transações
        const duplicadas = this._detectarDuplicatas(transacoes);
        resultados.push({
            metrica: 'Integridade de Dados',
            status: duplicadas.length === 0 ? 'ok' : 'error',
            detalhe: duplicadas.length === 0
            ? `${transacoes.length} transações, sem duplicatas`
            : `${duplicadas.length} possivel(is) duplicata(s) detectada(s)`
        });

        return resultados;
    },

    _validar(name, valoresEsperado, valorExibido ){
        const diff = Math.abs(valoresEsperado - valorExibido);
        const ok = diff < 0.01;
        return {
            metrica: name,
            status: ok ? 'ok' : 'error',
            detalhe: ok
            ? `Verificardo: ${valoresEsperado.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`
            : `Divergencia: esperado ${valoresEsperado} vs exibido ${valorExibido}`
        };
    },

    _detectarDuplicatas(transacoes) {
        const vistos = new Set();
        const dup = [];
        transacoes.forEach(t => {
            const chave = `${t.data} | ${t.desc} | ${t.valor}`;
            if(vistos.has(chave)) dup.push(t);
            vistos.add(chave);
        });
        return dup;
    }
};

/* ============================================================
    DADOS
   ============================================================ */

let transacoes = [
    {data: '2026-01-15', desc: 'Salário', cat: 'Salário', tipo: 'entrada', valor: 7500},
    {data: '2026-01-14', desc: 'Supermercado', cat: 'Alimentação', tipo: 'saida', valor: 480 },
    { data: '2025-01-13', desc: 'Uber', cat: 'Transporte', tipo: 'saida', valor: 85 },
    { data: '2025-01-12', desc: 'Aluguel', cat: 'Moradia', tipo: 'saida', valor: 1800 },
    { data: '2025-01-11', desc: 'Cinema', cat: 'Lazer', tipo: 'saida', valor: 120 },
    { data: '2025-01-10', desc: 'Dividendos', cat: 'Investimentos', tipo: 'entrada', valor: 320 },
    { data: '2025-01-09', desc: 'Internet', cat: 'Outros', tipo: 'saida', valor: 120 },
];

const investimentos = 15000;

// Cache dos valores exibidos — para a auditoria comparar
let valoresExibidos = {receitas: 0, despesas: 0, saldo: 0};

const fmt = v => v.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

document.getElementById('dataAtual').textContent =
    new Date().toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric',
    month: 'long', year: 'numeric'});

/* ============================================================
    RENDERIZAÇÃO
   ============================================================ */
function renderTabela(){
    const tbody = document.getElementById('tabelaTransacoes');
    tbody.innerHTML = '';
    const duplicataa = MotorCalculo._detectarDuplicatas(transacoes);

    transacoes.forEach(t => {
        const dataFmt = new Date(t.data).toLocaleDateString('pt-BR');
        const isDup = duplicataa.some(d => d.data === t.data && d.desc === t.desc
            && d.valor === t.valor);
        
        tbody.innerHTML += `
            <tr>
                <td>${dataFmt}</td>
                <td>${t.desc}</td>
                <td>${t.cat}</td>
                <td><span class="badge ${t.tipo === 'entrada' ? 'entrada' : 'saida'}">
                    ${t.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                </span></td>
                <td style="text-align:right; color:${t.tipo === 'entrada' ? 'green' : 'red' } font-weight:600;">
                    ${t.tipo === 'entrada' ? '+' : '-'} ${fmt(t.valor)}
                </td>
                <td style="text-align:center;">
                    <span class="validation-badge ${isDup ? 'error' : 'ok'}">
                        ${isDup ? '⚠️ Dup' : '✓ OK'}
                    </span>
                </td>
            </tr>`;
    });
}

function calcularTotais(){
    //Usa o motor deterministico para calcular os valores corretos
    valoresExibidos.receitas = MotorCalculo.calcularReceitas(transacoes);
    valoresExibidos.despesas = MotorCalculo.calcularDespesas(transacoes);
    valoresExibidos.saldo = MotorCalculo.calcularSaldo(transacoes, investimentos);

    // valoresExibidos = {receitas, despesas, saldo};

    document.getElementById('totalReceitas').textContent = fmt(valoresExibidos.receitas);
    document.getElementById('totalDespesas').textContent = fmt(valoresExibidos.despesas);
    document.getElementById('totalInvestimentos').textContent = fmt(investimentos);
    document.getElementById('totalSaldo').textContent = fmt(valoresExibidos.saldo);

    return valoresExibidos;
}

function renderAuditoria(){
    const resultados = MotorCalculo.auditar(transacoes, investimentos, valoresExibidos);
    const grid = document.getElementById('auditGrid');
    grid.innerHTML = '';

    resultados.forEach(r => {
        const icone = r.status === 'ok' ? '✅' : r.status === 'warn' ? '⚠️' : '❌';
        grid.innerHTML += `
        <div class="audit-item ${r.status}">
            <strong> ${icone} ${r.metrica} </strong>
            <small>${r.detalhe}</small>
        </div>`;
    });

    //Badge global no header dos crads
    const temErro = resultados.some(r => r.status === 'error');
    const temWarn = resultados.some(r => r.status === 'warn');
    document.querySelectorAll('.card').forEach(card => {
        card.querySelectorAll('.validation-badge').forEach(b => b.remove());
        const badge = document.createElement('span');
        badge.className = 'validation-badge ' + (temErro ? 'error' : temWarn ? 'warn' : 'ok');
        badge.textContent = temErro ? '❌ Erro' : temWarn ? '⚠️ Atenção' : '✅ OK';
        card.appendChild(badge);
    });
};

function executarAuditoria(){
    calcularTotais();
    renderAuditoria();
    renderTabela();
    console.log('%c🔍 Auditoria executada em ' + new Date().toLocaleTimeString(),
                'color:#8b5cf6;font-weight:bold;');
}

/* ============================================================
    GRÁFICOS
   ============================================================ */
const ctxFluxo = document.getElementById('fluxoChart').getContext('2d');
const fluxoChart = new Chart(ctxFluxo, {
    type: 'line',
    data: {
        labels: ['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan'],
        datasets: [
        {
            label: 'Receitas',
            data: [6200, 6800, 7100, 7400, 7200, 7500],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.15)',
            fill: true,
            tension: 0.4,
        },
        {
            label: 'Despesas',
            data: [4200, 4500, 4800, 4100, 4600, 2605],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.15)',
            fill: true,
            tension: 0.4,
        }
        ]
    },
    options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#cbd5e1', font: { size: 12 } } } },
        scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
        y: { ticks: { color: '#94a3b8', callback: v => 'R$' + v }, grid: { color: '#334155' } }
        }
    }
});

function calcularCategorias() {
    const cats = {};
    transacoes.filter(t => t.tipo === 'saida').forEach(t => {
        cats[t.cat] = MotorCalculo.somaSegura([cats[t.cat] || 0, t.valor]);
    });
    return cats;
}

const ctxCat = document.getElementById('categoriaChart').getContext('2d');
const catChart = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
        labels: Object.keys(calcularCategorias()),
        datasets: [{
        data: Object.values(calcularCategorias()),
        backgroundColor: ['#38bdf8', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#6366f1'],
        borderWidth: 0,
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 11 }, padding: 10 } } },
        cutout: '65%'
    }
});

/* ============================================================
    MODAL
   ============================================================ */
function abrirModal() { document.getElementById('modal').classList.add('active'); }
function fecharModal() {
    document.getElementById('modal').classList.remove('active');
    document.getElementById('desc').value = '';
    document.getElementById('valor').value = '';
}

function salvarTransacao() {
    const desc = document.getElementById('desc').value.trim();
    const valor = parseFloat(document.getElementById('valor').value);
    const tipo = document.getElementById('tipo').value;
    const cat = document.getElementById('categoria').value;

    if (!desc || !valor || valor <= 0) {
        alert('Preencha todos os campos corretamente!');
        return;
    }

    transacoes.unshift({
        data: new Date().toISOString().split('T')[0],
        desc, cat, tipo, valor
    });

    // Revalidar tudo após inserção
    executarAuditoria();

    const novasCats = calcularCategorias();
    catChart.data.labels = Object.keys(novasCats);
    catChart.data.datasets[0].data = Object.values(novasCats);
    catChart.update();

    fecharModal();
}

document.getElementById('modal').addEventListener('click', e => {
    if (e.target.id === 'modal') fecharModal();
});

/* ============================================================
    INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    renderTabela();
    calcularTotais();
    renderAuditoria();
});