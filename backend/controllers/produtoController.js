const { query } = require('../database');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Listar todos os produtos
exports.listarProdutos = async (req, res) => {
    try {
        const sql = `
            SELECT * FROM public.produtos 
            ORDER BY id_produto ASC
        `;
        const result = await query(sql);
        res.json({ sucesso: true, produtos: result.rows });
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar produtos.' });
    }
};

// 2. Obter produto por ID
exports.obterProduto = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        }

        const result = await query('SELECT * FROM public.produtos WHERE id_produto = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado.' });
        }

        res.json({ sucesso: true, produto: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter produto:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

// 3. Criar produto
exports.criarProduto = async (req, res) => {
    try {
        const { id_produto, nome_produto, id_unidade_medida, categoria_id, quantidade_estoque_produto, estoque_produto, preco_unitario_produto, preco_produto } = req.body;

        const catId = categoria_id || id_unidade_medida;
        const estoque = estoque_produto ?? quantidade_estoque_produto ?? 0;
        const preco = preco_produto ?? preco_unitario_produto ?? 0.0;

        if (!nome_produto) {
            return res.status(400).json({ sucesso: false, mensagem: 'O nome do produto é obrigatório.' });
        }
        if (!catId) {
            return res.status(400).json({ sucesso: false, mensagem: 'A categoria do produto é obrigatória.' });
        }

        let sql, values;

        if (id_produto && !isNaN(parseInt(id_produto, 10))) {
            sql = `
                INSERT INTO public.produtos (id_produto, categoria_id, nome_produto, preco_produto, estoque_produto)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            values = [
                parseInt(id_produto, 10),
                parseInt(catId, 10),
                nome_produto,
                parseFloat(preco),
                parseInt(estoque, 10)
            ];
        } else {
            sql = `
                INSERT INTO public.produtos (categoria_id, nome_produto, preco_produto, estoque_produto)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            values = [
                parseInt(catId, 10),
                nome_produto,
                parseFloat(preco),
                parseInt(estoque, 10)
            ];
        }

        const result = await query(sql, values);
        
        // Sincroniza a sequência do autoincremento para não dar conflito em futuros inserts
        await query("SELECT setval('produtos_id_produto_seq', (SELECT MAX(id_produto) FROM public.produtos))");

        res.status(201).json({ sucesso: true, mensagem: 'Produto inserido com sucesso!', produto: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        if (error.code === '23505') {
            return res.status(400).json({ sucesso: false, mensagem: 'Já existe um produto cadastrado com este ID.' });
        }
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'A categoria informada não existe.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir produto no banco de dados: ' + error.message });
    }
};

// 4. Atualizar produto
exports.atualizarProduto = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { nome_produto, id_unidade_medida, categoria_id, quantidade_estoque_produto, estoque_produto, preco_unitario_produto, preco_produto } = req.body;

        const catId = categoria_id || id_unidade_medida;
        const estoque = estoque_produto ?? quantidade_estoque_produto ?? 0;
        const preco = preco_produto ?? preco_unitario_produto ?? 0.0;

        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido para atualização.' });
        }

        const sql = `
            UPDATE public.produtos 
            SET categoria_id = $1, 
                nome_produto = $2, 
                preco_produto = $3, 
                estoque_produto = $4 
            WHERE id_produto = $5
            RETURNING *
        `;

        const values = [
            catId ? parseInt(catId, 10) : null,
            nome_produto,
            parseFloat(preco),
            parseInt(estoque, 10),
            id
        ];

        const result = await query(sql, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Produto não encontrado para alteração.' });
        }

        res.json({ sucesso: true, mensagem: 'Produto alterado com sucesso!', produto: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'A categoria informada não existe.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar produto: ' + error.message });
    }
};

// 5. Upload de Imagem
exports.uploadImagem = async (req, res) => {
    try {
        const id = req.params.id;
        if (!req.file) {
            return res.status(400).json({ sucesso: false, mensagem: 'Nenhum arquivo enviado.' });
        }

        const pastaImagens = path.join(__dirname, '../imagens');
        if (!fs.existsSync(pastaImagens)) {
            fs.mkdirSync(pastaImagens, { recursive: true });
        }

        const caminhoDestino = path.join(pastaImagens, `${id}.png`);

        await sharp(req.file.buffer)
            .resize(300, 300, { fit: 'cover' })
            .toFormat('png')
            .toFile(caminhoDestino);

        res.json({ sucesso: true, mensagem: 'Imagem salva com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar imagem:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar imagem.' });
    }
};

// 6. Deletar produto
exports.deletarProduto = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        await query('DELETE FROM public.produtos WHERE id_produto = $1', [id]);

        const imgPath = path.join(__dirname, '../imagens', `${id}.png`);
        if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
        }

        res.json({ sucesso: true, mensagem: 'Produto excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir produto.' });
    }
};