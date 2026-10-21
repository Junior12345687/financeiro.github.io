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

    user = await User.findOne({where: {name}});

    if(!user){
      return res.status(401).json({error: 'Credencias invalidas.'});
    }

    const senhaCorreta = await bcrypt.compare(password, user.password);
    if(!senhaCorreta){
      return res.status(401).json({error: 'Credencias invalidas'});
    }

    const token = jwt.sign(
      {id: user.id, name: user.name},
      process.eventNames.JWT_SECRET || 'segredo_dev',
      {expiresIn: '1d'}
    );

    return res.status(200).json({
      success: true,
      messge: 'Login realizado com sucesso.',
      token,
      user: {id: user.id, name: user.name, email: user.email}
    });

  } catch(error){
    console.error(error);
    return res.status(500).json({error: 'Erro ao fazer login'});
  }
};

authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if(!authHeader){
    return res.status(401).json({error: 'Token não fornecido.'});
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch(err){
    return res.status(401).json({error: 'Token invalido ou expirado.'});
  }
}

const cadastro = async (req, res) => {

  console.log('🟢 [1] controller chamando, body =', req.body);

  try {

    const { name, email, password, confirmar } = req.body || {};
    console.log('🟢 [2] campos:', {name, email, password, confirmar});

    if (!name || !email || !password || !confirmar)
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });

    if (!email.includes('@'))
      return res.status(400).json({ error: 'Email inválido.' });

    if (password.length < 6)
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });

    if (password !== confirmar)
      return res.status(400).json({ error: 'Senhas não conferem' });

    const existe = await User.findOne({ where: { name } });
    if (existe)
      return res.status(409).json({ error: 'Nome já cadastrado.' });

    console.log('🟢 [3] gerando hash...');
    const hash = await bcrypt.hash(password, 10);
    console.log('🟢 [4] hash= ', hash.substring(0, 15) + '...');

    console.log('🟢 [5] criando usuario no banco...');
    await User.create({ name, email, password: hash });
    res.redirect('/login?sucess=1');
    console.log('🟢 [6] usuario criado, id = ', user.id);

    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso.',
      user: { id: user.id, name: user.name, email: user.email}

    });
  } catch (error) {
    console.error('💥 erro no cadastro',error);

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

module.exports = {login, cadastro, listar, authMiddleware};