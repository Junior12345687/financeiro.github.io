const form = document.getElementById('login-Form');
const mensagem = document.getElementById('mensagem');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const password = document.getElementById('password').value.trim();

    const API_URL = 'http://localhost:3000/';

    console.log('🔵 [1] Submit disparado');
    console.log('🔵 [2] Dados enviados:', {name, password});

    if(!name || !password){
        return mostrar('Preecha todos os campos.', 'blue');
    }

    if(password.length < 6) {
        return mostrar('A senha deve conter 6 caracteres', 'red');
    }
    console.log('🔵 [2.5] Validação ok, chamando Login()');
    await Login(name, password);
    console.log('🔵 [10] Login() retornou (se redirecionou, isso não aparece)');

    async function Login(name, password) {
        
        try{
            console.log('🔵 [2.6] Dentro de Login(), antes do fetch');

            console.log('🟡 [A] Antes do fetch');
            const response = await fetch(`${API_URL}api/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, password})
            });

            console.log('🟢 [3] fetch resolveu. Status:', response.status, '| ok:', response.ok);

            const data = await response.json().catch(() => {});
            console.log('🟢 [6] Resposta:', data);

            if(!response.ok){
                console.log('🔴[7] Erro ao efetuar o login');
                alert(data.error || data.mesage || 'Erro no login');
                return;
            }

            if(!data.token) {
                alert('Resposta sem token');
                return;
            }

            localStorage.setItem('token', data.token);
            console.log('🟢 [8] token salvo no LocalStorage:', localStorage.getItem('token'));
            console.log('🟢 [8.5] Vai redirecionar para:', `${API_URL}dashboard.html`);
            console.log('🟢 [8.6] Conteúdo do token:', localStorage.getItem('token'));

            console.log('🟢 [9] Redirecionando para o dashboard.html');
            window.location.href = `${API_URL}dashboard.html`;

        } catch(err){
            console.log('🔴 Error:', err);
            alert('Falha de conexão: ' + err.message);
        }
    }

});

function mostrar(texto, cor){
    mensagem.textContent = texto;
    mensagem.style.color = cor;
}