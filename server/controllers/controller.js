const User = require('../models/usermodels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


const login = async (req, res) => {
  
  try {
    const  {name, password} = req.body;

    if(!name || !password){
      return res.status(400).json({error:'Nome e senha são obrigatorios'});
    }

    const user = await User.findOne({where: {name}});
    if(!user){
      return res.status(401).json({error: 'Credencias invalidas.'});
    }

    const senhaCorreta = await bcrypt.compare(password, user.password);
    if(!senhaCorreta){
      return res.status(401).json({error: 'Credencias invalidas'});
    }

    return res.status(200).json({
      success: true,
      messge: 'Login realizado com sucesso.',
      user: {id: user.id, name: user.name, email: user.email}
    });

  } catch(error){
    console.error(error);
    return res.status(500).json({error: 'Erro ao fazer login'});
  }
};

const cadastro = async (req, res) => {
  try {
    const { name, email, password, confirmar } = req.body;

    if (!name || !email || !password || !confirmar)
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });

    if (!email.includes('@'))
      return res.status(400).json({ error: 'Email inválido.' });

    if (password.length < 6)
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });

    if (password !== confirmar)
      return res.status(400).json({ error: 'Senhas não conferem' });

    // const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password });

    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso.',
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
};

const listar = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email'] });
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
};

module.exports = {login, cadastro, listar};