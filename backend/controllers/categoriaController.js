const { query } = require('../database');

// 1. Listar todas as categorias
exports.listarCategorias = async (req, res) => {
    try {
        const sql = `
            SELECT * FROM public.categorias 
            ORDER BY id_categoria ASC
        `;
        const result = await query(sql);
        res.json({ sucesso: true, categorias: result.rows });
    } catch (error) {
        console.error('Erro ao listar categorias:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar categorias.' });
    }
};

// 2. Obter categoria por ID
exports.obterCategoria = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        }

        const result = await query('SELECT * FROM public.categorias WHERE id_categoria = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Categoria não encontrada.' });
        }

        res.json({ sucesso: true, categoria: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter categoria:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

// 3. Criar categoria
exports.criarCategoria = async (req, res) => {
    try {
        const { id_categoria, nome_categoria, descricao_categoria } = req.body;

        if (!nome_categoria) {
            return res.status(400).json({ sucesso: false, mensagem: 'O nome da categoria é obrigatório.' });
        }

        let sql, values;

        if (id_categoria && !isNaN(parseInt(id_categoria, 10))) {
            sql = `
                INSERT INTO public.categorias (id_categoria, nome_categoria, descricao_categoria)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            values = [parseInt(id_categoria, 10), nome_categoria, descricao_categoria || null];
        } else {
            sql = `
                INSERT INTO public.categorias (nome_categoria, descricao_categoria)
                VALUES ($1, $2)
                RETURNING *
            `;
            values = [nome_categoria, descricao_categoria || null];
        }

        const result = await query(sql, values);

        // Sincroniza a sequência do SERIAL
        await query("SELECT setval('categorias_id_categoria_seq', (SELECT MAX(id_categoria) FROM public.categorias))");

        res.status(201).json({ sucesso: true, mensagem: 'Categoria inserida com sucesso!', categoria: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar categoria:', error);
        if (error.code === '23505') {
            return res.status(400).json({ sucesso: false, mensagem: 'Já existe uma categoria cadastrada com este ID.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir categoria: ' + error.message });
    }
};

// 4. Atualizar categoria
exports.atualizarCategoria = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { nome_categoria, descricao_categoria } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido para atualização.' });
        }

        const sql = `
            UPDATE public.categorias 
            SET nome_categoria = $1, 
                descricao_categoria = $2 
            WHERE id_categoria = $3
            RETURNING *
        `;

        const values = [nome_categoria, descricao_categoria || null, id];

        const result = await query(sql, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Categoria não encontrada para alteração.' });
        }

        res.json({ sucesso: true, mensagem: 'Categoria alterada com sucesso!', categoria: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar categoria: ' + error.message });
    }
};

// 5. Deletar categoria
exports.deletarCategoria = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        await query('DELETE FROM public.categorias WHERE id_categoria = $1', [id]);

        res.json({ sucesso: true, mensagem: 'Categoria excluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir categoria.' });
    }
};