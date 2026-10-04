const form = document.getElementById('Form-cadastro');
const mensagem = document.getElementById('mensagem');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmar = document.getElementById('confirmar').value.trim();

    if(!name || !email || !password || !confirmar){
        return mostrar('Preencha todos os campos.', 'red');
    }

    if(password !== confirmar){
        return mostrar('As senhas não coinciden', 'red');
    }

    if(password.lengt < 6) {
        return mostrar('A senha deve conter pelo menos 6 caracteres.', 'red');
    }

    try{

        const response = await fetch('/api/cadastro', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(name, email, password)
        });

        mostrar('Cadastro realizado! Redirecionando...', 'green');

        setTimeout(() => {
            window.location.href = '/index.html?sucess=1';
        }, 1500);

    } catch(err){
        mostrar('Error de conexão com o servidor.', 'red');
    }

});

function mostrar(texto, cor){
    mensagem.textContent = texto;
    mensagem.style.color = cor;
}