let transacoes = [];
let transacoesFiltradas = [];
let transcoeEditandoId = null;
let paginaAtual = 1;
const itensPorPagina = 0;
let ordenacao = {campo: 'data', direcao: 'desc'};

document.addEventListener('DOMContentLoaded', () => {

    transacoes = inicializarTransacoes();
    preencherCategorias();
    configurarEventos();
    aplicarFiltros();
    consfigurarModalGlobal('modal', fecharModal);
});

function preencherCategorias() {

    const select = document.getElementById('filtroCategoria');
    const categorias = [...new Set(transacoes.map(t => t.categoria))].sort();
    select.innerHTML = '<option value="">Todas</option>' +
        categorias.map(c => `<option value="${c}>${c}</option"`).join('');
}

function configurarEventos() {

    ['filtroBusca', 'filtroTipo', 'filtroCategoria', 'filtroDataIni', 'filtroDataFim']
        .forEach(id => document.getElementById(id).addEventListener('input', aplicarFiltros));

    ['filtroTipo', 'filtroCategoria', 'filtroDataIni', 'filtroDataFim']
        .forEach(id => document.getElementById(id).addEventListener('change', aplicarFiltros));

    document.querySelectorAll('th[data-sort').forEach(th => {
        th.addEventListener('click', () => {
            const campo = th.dataset.sort;
            if(ordenacao.campo === campo){
                ordenacao.direcao = ordenacao.direcao === 'asc' ? 'desc' : 'asc';
            }else{
                ordenacao.campo = campo;
                ordenacao.direcao = 'asc';
            }
            atualizarIconesOrdenacao();
            aplicarFiltros();
        });
    });
}

function atualizarIconesOrdenacao() {

    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.classList.remove('sorted');
        const icon = th.querySelector('.sort-icon');
        icon.textContent = '↕';
        if(th.dataset.sort === ordenacao.campo) {
            th.classList.add('sorted');
            icon.textContent = ordenacao.direcao === 'asc' ? '↑' : '↓';
        }
    });
}

function aplicarFiltros() {

    const busca = document.getElementById('filtroBusca').value.toLowerCase().trim();
    const tipo = document.getElementById('filtroTipo').value;
    const categoria = document.getElementById('filtroCategoria').value;
    const dataIni = document.getElementById('filtroDataIni').value;
    const dataFim = document.getElementById('filtroDataFim').value;

    transacoesFiltradas = transacoes.filter(t => {
        if(busca && !t.descricao.toLowerCase().includes(busca) &&
            !t.categoria.toLowerCase().includes(busca)) return false;
        if(tipo && t.tipo !== tipo) return false;
        if(categoria && t.categoria !== categoria) return false;
        if(dataIni && t.data < dataIni) return false;
        if(dataFim && t.data > dataFim) return false;

        return true;
    });

    transacoesFiltradas.sort((a, b) => {
        let va = a[ordenacao.campo];
        let vb = b[ordenacao.campo];

        if(ordenacao.campo === 'valor') {
            va = va.toLowerCase();
            vb = vb.toLowerCase();
        }

        if(typeof va === 'string'){
            va = va.toLowerCase();
            vb = vb.toLowerCase();
        }
        
        if (va < vb ) return ordenacao.direcao === 'asc' ? -1 : 1;
        if(va > vb) return ordenacao.direcao === 'asc' ? 1 : -1;
    });

    paginaAtual = 1;
    renderizarTabela();
    atualizarResumo();
    
}

function renderizarTabela() {
    const tbody = document.getElementById('tabelaTransacoes');
    const total = transacoesFiltradas.length;
    const totalPaginas = Math.ceil(total / itensPorPagina) || 1;
    if(paginaAtual > totalPaginas) paginaAtual = totalPaginas;

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const pagina = transacoesFiltradas.slice(inicio, fim);

    if(pagina.length === 0){
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-inbox"></i>Nenhuma transação encontrada.</div></td></tr>`;
    }else{
        tbody.innerHTML = pagina.map(t => `<tr>
                <td>${formatarData(t.data)}</td>
                <td>${escapeHtml(t.descricao)}</td>
                <td>${escapeHtml(t.categoria)}</td>
                <td><span class="badge ${t.tipo}">${t.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}</span></td>
                <td style="text-align:right;" class="${t.tipo === 'entrada' ? 'valor-positivo' : 'valor-negativo'}">
                    ${t.tipo === 'entrada' ? '+' : '-'} ${formatarMoeda(t.valor)}
                </td>
                <td style="text-align:center;">
                    <div class="row-actions">
                        <button class="icon-btn" onclick="editarTransacao(${t.id})" title="Editar">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="icon-btn danger" onclick="excluirTransacao(${t.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    document.getElementById('paginationInfo').textContent = total === 0
        ? 'Mostrando 0 de 0'
        : `Mostrando ${inicio + 1 } -${Math.min(fim, total)} de ${total}`;
    
    renderizarPaginacao(totalPaginas);
}

function renderizarPaginacao(totalPaginas){
    const controls = document.getElementById('paginationControls');
    let html = `<button class="page-btn" onclick="irParaPagina(${paginaAtual - 1})" ${paginaAtual === 1 ? 'disabled' : ''}>‹</button>`;

    const maxBotoes = 5;
    let start = Math.max(1, paginaAtual - Math.floor(maxBotoes / 2));
    let end = Math.min(totalPaginas, start + maxBotoes - 1);
    if(end  - start < maxBotoes - 1 ) start = Math.max(1, end - maxBotoes + 1);

    if(start > 1){
        html += `<button class="page-btn" onclick="irParaPagina(1)">1</button>`;
        if (start > 2) html += `<span style="color:#64748b; padding:0 4px;">…</span>`;
    }

    for(let i = start; i <= end; i++){
        html += `<button class="page-btn ${i === paginaAtual ? 'active' : ''}"
            onclick="irParaPagina(${i})">${i}</button>`;
    }

    if(end < totalPaginas){
        if (end < totalPaginas - 1) html += `<span style="color:#64748b; padding:0 4px;">…</span>`;
            html += `<button class="page-btn" onclick="irParaPagina(${totalPaginas})">${totalPaginas}</button>`;
    }

    html += `<button class="page-btn" onclick="irParaPagina(${paginaAtual + 1})" ${paginaAtual === totalPaginas ? 'disabled' : ''}>›</button>`;
    controls.innerHTML = html;

}

function irParaPagina(p){
    const totalPaginas = Math.ceil(transacoesFiltradas.length / itensPorPagina) || 1;
    if(p < 1 || p > totalPaginas) return;
    paginaAtual = p;
    renderizarTabela();
}

function atualizarResumo(){
    const entradas = transacoesFiltradas.filter(t => t.tipo === 'entrada')
        .reduce((s, t) => s + parseFloat(t.valor), 0);
    const saidas = transacoesFiltradas.filter(t => t.tipo === 'saida')
        .reduce((s, t) => s + parseFloat(t.valor), 0);
    const saldo = entradas - saidas;

    document.getElementById('resumoEntradas').textContent = formatarMoeda(entradas);
    document.getElementById('resumoSaidas').textContent = formatarMoeda(saidas);
    document.getElementById('resumoSaldo').textContent = formatarMoeda(saldo);
    document.getElementById('resumoSaldo').style.color = saldo >= 0 ? '#10b981' : '#ef4444';
    document.getElementById('resumoSaldo').textContent = transacoesFiltradas.length;
}

function abrirModal(id = null){
    transcoeEditandoId = id;
    const titulo = document.getElementById('modalTitulo');

    if(id){
        const t = transacoes.find(x => x.id === id);
        if (!t) return;
        titulo.textContent = 'Editar Transação';
        document.getElementById('desc').value = t.descricao;
        document.getElementById('valor').value = t.valor;
        document.getElementById('tipo').value = t.tipo;
        document.getElementById('categoria').value = t.categoria;
        document.getElementById('data').value = t.data;
    } else {
        titulo.textContent = 'Nova Transção';
        document.getElementById('desc').value = '';
        document.getElementById('valor').value = '';
        document.getElementById('tipo').value = 'entrada';
        document.getElementById('categoria').valor = 'Salário';
        document.getElementById('data').value = new Date().toDateString().split('T')[0];
    }

    document.getElementById('modal').classList.add('active');
    setTimeout(() => document.getElementById('desc').focus(), 100);
}

