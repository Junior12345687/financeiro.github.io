const form = document.getElementById('login-Form');
const mensagem = document.getElementById('mensagem');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const password = document.getElementById('password').value.trim();

    console.log('🔵 [1] Submit disparado');
    console.log('🔵 [2] Dados enviados:', {name, password});

    if(!name || !password){
        return mostrar('Preecha todos os campos.', 'blue');
    }

    if(password.length < 6) {
        return mostrar('A senha deve conter 6 caracteres', 'red');
    }

    async function Login(name, password) {
        
        try{
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'aplication/json'},
                body: JSON.stringify({name, password})
            });

            console.log('🟢 [3] Status', response.status, '| ok:', response.ok);

            const data = await response.json().catch(() => {});
            console.log('🟢 [6] Resposta:', data);

            if(!response){
                console.log('🔴[7] Erro ao efetuar o login');
                alert(data.error || 'Erro no login');
                return;
            }

            localStorage.setItem('token', data.token);
            console.log('🟢 [8] token salvo no LocalStorage:', localStorage.getItem('token'));

            console.log('🟢 [9] Redirecionando para o dashboard.html');
            window.location.href = '/dashboard.html';

        } catch(err){
            console.log('🔴 Error:', err);
            alert('Falha de conexão: ' + err.mensage);
        }
    }
});

// function mostrar(texto, cor){
//     mensagem.textContent = texto;
//     mensagem.style.color = cor;
// }