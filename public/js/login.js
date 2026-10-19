const form = document.getElementById('login-Form');
const mensagem = document.getElementById('mensagem');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const password = document.getElementById('password').value.trim();

    if(!name || !password){
        return mostrar('Preecha todos os campos.', 'blue');
    }

    if(password.length < 6) {
        return mostrar('A senha deve conter 6 caracteres', 'red');
    }

    try {

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, password})
        });
        
        const data = await response.json().catch(() => ({}));

        if(!response.ok){
            return mostrar(data.mensagem || 'Nome ou senha incorretos',  'red');
        }

        mostrar('Login realizado! Redirecionando...', 'gren');

        setTimeout(() => {
            window.location.href = '/dashboard.html?sucess=1';
        }, 1500);

    } catch(error){
        mostrar('Error de conexão com o servidor.', 'blue');
    }
});

function mostrar(texto, cor){
    mensagem.textContent = texto;
    mensagem.style.color = cor;
}