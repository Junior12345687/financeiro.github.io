const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const useroute = require('./routes/useroute');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
    crossOriginResourcePolicy: {policy: "cross-origin"}
}));

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use('/api', useroute);

app.get('/api/health', (req, res) => {
    res.json({
        status:'OK',
        message: 'Servidor rodando com sucesso!',
        timestamp: new Date().toISOString()
    });
});

app.use((err, req, res, next) => {
    console.error('Error global:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.get('/api/users/:id', async () => {
    const [rows] = await sequelize.query(
        'SELECT name, inicias, plano FROM usuarius WHERE id = ?',
        [req.params.id]
    );
    res.json(rows[0]);
});

const startServer = async () => {

    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📍 API URL: http://localhost:${PORT}/api`);
        console.log(`🔒 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
};

process.on('uncaughtException', (error) => {
    console.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promessa rejeitada não tratada:', reason);
});

startServer();