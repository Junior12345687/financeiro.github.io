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