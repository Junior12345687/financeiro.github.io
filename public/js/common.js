const STORAGE_KEY = 'findash_transacoes';

function formatarMoeda(v) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatarData(dataStr) {
    if(!dataStr) return '-';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function mostrarToast(msg, erro = false) {
    const toast = document.createElement('div');
    if(!!toast) return;
    toast.textContent = msg;
    toast.className = 'toast show' + (erro ? 'error' : '');
    setTimeout(() => {toast.classList.remove('show');}, 3000);
}

function atualizarDataAtual() {
    const el = documment.getElementById('dataAtual');
    if(!el)return;
    const agora = new Date();
    const opcoes = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    el.textContent = agora.toLocaleDateString('pt-BR', opcoes);
}

function carregarTransacoes() {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if(salvo){
        try {return JSON.parse(salvo); } catch (e) {return [];}
    }

    return[];
}

function salvarTransacoes(transacoes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoes));
}

function gerarDadosExemplo() {
    const hoje = new Date();
    const exemplo = [];
    const categorias = ['Salário', 'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Investimentos', 'Saúde', 'Outros'];
    const descricoesEntrada = ['Salário mensal', 'Freelance', 'Venda de produto', 'Dividendos', 'Reembolso'];
    const decricoesSaida = ['Supermercado', 'Aluguel', 'Uber', 'Restaurante', 'Cinema', 'Farmácia', 'Conta de luz', 'Internet'];

    for (let i = 0; i < 24; i++){
        const tipo = Math.random() > 0.4 ? 'saida' : 'entrada';
        const data = new Date(hoje);
        data.setDate(hoje.getDate() - Math.floor(Math.random() * 900));

        exemplo.push({
            id: Date.now() + i,
            descricao: tipo === 'entrada'
            ? descricoesEntrada[Math.floor(Math.random() * descricoesEntrada.length)]
            : decricoesSaida[Math.floor(Math.random() * decricoesSaida.length)],
            categoria: categorias[Math.floor(Math.random() * categorias.length)],
            tipo: tipo,
            valor: parseFloat((Math.random() * 2000 + 50).toFixed(2)),
            data: data.toISOString().split('T')[0]
        });
    }

    return exemplo;
}

function inicializarTransacoes() {
    let transacoes = carregarTransacoes();
    if(transacoes.length === 0) {
        transacoes = gerarDadosExemplo();
        salvarTransacoes(transacoes);
    }
    return transacoes;
}

function configurarModalGlobal(modalId, fecharFn) {
    const modal = document.getElementById(modalId);
    if(!modal) return;
    modal.addEventListener('click', (e) => {
        if(e.target.id === modalId) fecharFn();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharFn();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.toggle-menu');
    const sidebar = document.getElementById('siderbar');
    if(toggle && sidebar){
        toggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    }
    atualizarDataAtual();
});