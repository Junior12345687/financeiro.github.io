const form = document('login-Form');
const mensagem = document('mensagem');

form.addEventListener('submit', async (e) => {
    e.preventeDefault();

    const name = document.getElementById('name').value.trim();
    const password = document.getElementById('password').value.trim();

    if(!name || !password){
        mensagem.textConten = 'Preencha nome e senha';
        mensagem.style.color = 'red';
        return;
    }

    try{
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-"Type': 'application/json'},
            body: JSON.stringify({name, password})
        });

        const data = await response.json();

        if(!response.ok){
            mensagem.textContent = data.error;
            mensagem.style.color = 'red';
            return;
        }

        localStorage.setItem('usuario', JSON.stringify(data.user));
        window.localStorage.href = '/dashboard.html';

    } catch(erro){
        mensagem.textContent = 'Error de conexão com o servidor.';
        mensagem.style.color = 'red';
    }

});