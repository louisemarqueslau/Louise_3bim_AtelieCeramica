const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importa a função de consulta do banco de dados
const { query } = require('./database');

// --- Importação de Rotas ---
const produtoRoutes = require('./routes/produtoRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes'); // <--- ADICIONADO
const unidadeMedidaRoutes = require('./routes/unidadeMedidaRoutes');
const cargoRoutes = require('./routes/cargoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const funcionarioRoutes = require('./routes/funcionarioRoutes');
const pessoaRoutes = require('./routes/pessoaRoutes');

const app = express();

// --- Middlewares Globais ---
app.use(cors());
app.use(express.json());

// Servir imagens e arquivos estáticos
// ... tuas outras configurações e rotas ...

// Servir a pasta de imagens estáticas para o navegador conseguir ler
app.use('/imagens', express.static(path.join(__dirname, 'imagens')));

// --- Definição das Rotas da API ---
app.use('/produto', produtoRoutes);
app.use('/categoria', categoriaRoutes); // <--- ADICIONADO
app.use('/unidade_medida', unidadeMedidaRoutes);
app.use('/cargo', cargoRoutes);

// Rotas de Pessoas e suas Especializações (1:1)
app.use('/cliente', clienteRoutes);
app.use('/funcionario', funcionarioRoutes);
app.use('/pessoa', pessoaRoutes);

// --- Porta e Inicialização do Servidor ---
const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
    console.log(`\n=================================`);
    console.log(`🚀 Servidor executando na porta ${PORT}`);
    
    try {
        await query('SELECT 1');
        console.log(`✅ Banco de Dados '${process.env.DB_NAME}' conectado com sucesso!`);
    } catch (error) {
        console.error(`❌ FALHA NA CONEXÃO COM O BANCO DE DADOS:`);
        console.error(`   Motivo: ${error.message}`);
    }
    console.log(`=================================\n`);
});