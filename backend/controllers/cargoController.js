const { query } = require('../database');
const path = require('path');

exports.abrirCrudCargo = (req, res) => {
  const usuario = req.cookies?.usuarioLogado; // Acesso seguro com Optional Chaining

  if (usuario) {
    res.sendFile(path.join(__dirname, '../../frontend/cargo/cargo.html'));
  } else {
    res.redirect('/login');
  }
};

exports.listarCargos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM cargo ORDER BY id_cargo');
    res.json({ sucesso: true, cargos: result.rows });
  } catch (error) {
    console.error('Erro ao listar cargos:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor ao listar cargos.' });
  }
};

exports.criarCargo = async (req, res) => {
  try {
    const { id_cargo, nome_cargo } = req.body;

    // Validação básica
    if (!nome_cargo || nome_cargo.trim() === '') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome do cargo é obrigatório.'
      });
    }

    let result;

    // Se o ID for fornecido manualmente, insere com o ID; caso contrário, deixa a chave primária auto-incrementar (SERIAL)
    if (id_cargo) {
      result = await query(
        'INSERT INTO cargo (id_cargo, nome_cargo) VALUES ($1, $2) RETURNING *',
        [id_cargo, nome_cargo.trim()]
      );
    } else {
      result = await query(
        'INSERT INTO cargo (nome_cargo) VALUES ($1) RETURNING *',
        [nome_cargo.trim()]
      );
    }

    res.status(201).json({
      sucesso: true,
      mensagem: 'Cargo criado com sucesso!',
      cargo: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar cargo:', error);

    // Violação de Chave Única (ex: ID ou nome já existente)
    if (error.code === '23505') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Já existe um cargo cadastrado com este ID ou Nome.'
      });
    }

    // Violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados obrigatórios não foram fornecidos.'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor ao criar cargo.' });
  }
};

exports.obterCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID do cargo deve ser um número válido.' });
    }

    const result = await query(
      'SELECT * FROM cargo WHERE id_cargo = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cargo não encontrado.' });
    }

    res.json({ sucesso: true, cargo: result.rows[0] });
  } catch (error) {
    console.error('Erro ao obter cargo:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
};

exports.atualizarCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nome_cargo } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID do cargo deve ser um número válido.' });
    }

    if (!nome_cargo || nome_cargo.trim() === '') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O nome do cargo não pode ficar em branco.'
      });
    }

    // Verifica se o cargo existe
    const existingCargoResult = await query(
      'SELECT * FROM cargo WHERE id_cargo = $1',
      [id]
    );

    if (existingCargoResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cargo não encontrado.' });
    }

    // Atualiza o cargo
    const updateResult = await query(
      'UPDATE cargo SET nome_cargo = $1 WHERE id_cargo = $2 RETURNING *',
      [nome_cargo.trim(), id]
    );

    res.json({
      sucesso: true,
      mensagem: 'Cargo atualizado com sucesso!',
      cargo: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error);

    if (error.code === '23505') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Já existe um cargo cadastrado com este nome.'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor ao atualizar cargo.' });
  }
};

exports.deletarCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID do cargo deve ser um número válido.' });
    }

    // Verifica se o cargo existe
    const existingCargoResult = await query(
      'SELECT * FROM cargo WHERE id_cargo = $1',
      [id]
    );

    if (existingCargoResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cargo não encontrado.' });
    }

    // Deleta o cargo
    await query(
      'DELETE FROM cargo WHERE id_cargo = $1',
      [id]
    );

    res.json({ sucesso: true, mensagem: 'Cargo excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar cargo:', error);

    // Violação de integridade referencial (FK)
    if (error.code === '23503') {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Não é possível excluir o cargo, pois existem funcionários vinculados a ele.'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor ao tentar excluir o cargo.' });
  }
};