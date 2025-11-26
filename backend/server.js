const express = require('express');
const cors = require('cors');
const path = require('path');
const rotas = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

// API
app.use('/api', rotas);

// Frontend estático
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Rota principal -> index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Rotas amigáveis para outras páginas
app.get('/feedback', (req, res) => {
    res.sendFile(path.join(frontendPath, 'feedback.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(frontendPath, 'login.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}/`);
});
