const { query } = require('../database');
const path = require('path');

exports.abrirCrudPessoa = (req, res) => {
  const usuario = req.cookies ? req.cookies.usuarioLogado : null;
  if (usuario) {
    res.sendFile(path.join(__dirname, '../../frontend/pessoa/pessoa.html'));
  } else {
    res.redirect('/login');
  }
};

exports.listarPessoas = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pessoa ORDER BY cpf_pessoa');
    res.json({ sucesso: true, pessoas: result.rows });
  } catch (error) {
    console.error('Erro ao listar pessoas:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor ao listar pessoas.' });
  }
};

exports.criarPessoa = async (req, res) => {
  try {
    const { cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa } = req.body;

    if (!cpf_pessoa || !nome_pessoa || !endereco_pessoa || !senha_pessoa || !email_pessoa) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'CPF, Nome, e-mail, endereço e senha são obrigatórios.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_pessoa)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Formato de e-mail inválido.'
      });
    }

    const result = await query(
      'INSERT INTO pessoa (cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [String(cpf_pessoa).trim(), nome_pessoa, data_nascimento_pessoa || null, endereco_pessoa, senha_pessoa, email_pessoa]
    );

    res.status(201).json({ sucesso: true, pessoa: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);

    if (error.code === '23505') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'CPF ou E-mail já cadastrado no sistema.'
      });
    }

    if (error.code === '23502') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados obrigatórios não fornecidos.'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor ao criar pessoa.' });
  }
};

exports.obterPessoa = async (req, res) => {
  try {
    const id = req.params.id ? String(req.params.id).trim() : null;

    if (!id) {
      return res.status(400).json({ sucesso: false, mensagem: 'CPF inválido.' });
    }

    const result = await query(
      'SELECT * FROM pessoa WHERE cpf_pessoa = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Pessoa não encontrada.' });
    }

    res.json({ sucesso: true, pessoa: result.rows[0] });
  } catch (error) {
    console.error('Erro ao obter pessoa:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
};

exports.atualizarPessoa = async (req, res) => {
  try {
    const id = req.params.id ? String(req.params.id).trim() : null;
    const { nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa } = req.body;

    if (email_pessoa) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email_pessoa)) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Formato de e-mail inválido.'
        });
      }
    }

    const existingPersonResult = await query(
      'SELECT * FROM pessoa WHERE cpf_pessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Pessoa não encontrada.' });
    }

    const currentPerson = existingPersonResult.rows[0];
    const updatedFields = {
      nome_pessoa: nome_pessoa !== undefined ? nome_pessoa : currentPerson.nome_pessoa,
      data_nascimento_pessoa: data_nascimento_pessoa !== undefined ? data_nascimento_pessoa : currentPerson.data_nascimento_pessoa,
      endereco_pessoa: endereco_pessoa !== undefined ? endereco_pessoa : currentPerson.endereco_pessoa,
      senha_pessoa: senha_pessoa !== undefined ? senha_pessoa : currentPerson.senha_pessoa,
      email_pessoa: email_pessoa !== undefined ? email_pessoa : currentPerson.email_pessoa
    };

    const updateResult = await query(
      'UPDATE pessoa SET nome_pessoa = $1, data_nascimento_pessoa = $2, endereco_pessoa = $3, senha_pessoa = $4, email_pessoa = $5 WHERE cpf_pessoa = $6 RETURNING *',
      [updatedFields.nome_pessoa, updatedFields.data_nascimento_pessoa, updatedFields.endereco_pessoa, updatedFields.senha_pessoa, updatedFields.email_pessoa, id]
    );

    res.json({ sucesso: true, pessoa: updateResult.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);

    if (error.code === '23505') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'E-mail já está em uso por outra pessoa.'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
};

exports.deletarPessoa = async (req, res) => {
  try {
    const id = req.params.id ? String(req.params.id).trim() : null;

    const existingPersonResult = await query(
      'SELECT * FROM pessoa WHERE cpf_pessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Pessoa não encontrada.' });
    }

    await query(
      'DELETE FROM pessoa WHERE cpf_pessoa = $1',
      [id]
    );

    res.json({ sucesso: true, mensagem: 'Pessoa excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar pessoa:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Não é possível deletar pessoa com registros vinculados (ex: Cliente, Funcionário, Pedidos).'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
};

exports.obterPessoaPorEmail = async (req, res) => {
  try {
    const { email_pessoa } = req.params;

    if (!email_pessoa) {
      return res.status(400).json({ sucesso: false, mensagem: 'E-mail é obrigatório.' });
    }

    const result = await query(
      'SELECT * FROM pessoa WHERE email_pessoa = $1',
      [email_pessoa]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Pessoa não encontrada.' });
    }

    res.json({ sucesso: true, pessoa: result.rows[0] });
  } catch (error) {
    console.error('Erro ao obter pessoa por email:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
};

exports.atualizarSenha = async (req, res) => {
  try {
    const id = req.params.id ? String(req.params.id).trim() : null;
    const { senha_atual, nova_senha } = req.body;

    if (!id) {
      return res.status(400).json({ sucesso: false, mensagem: 'CPF/ID inválido.' });
    }

    if (!senha_atual || !nova_senha) {
      return res.status(400).json({ sucesso: false, mensagem: 'Senha atual e nova senha são obrigatórias.' });
    }

    const personResult = await query(
      'SELECT * FROM pessoa WHERE cpf_pessoa = $1',
      [id]
    );

    if (personResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Pessoa não encontrada.' });
    }

    const person = personResult.rows[0];

    if (person.senha_pessoa !== senha_atual) {
      return res.status(400).json({ sucesso: false, mensagem: 'Senha atual incorreta.' });
    }

    const updateResult = await query(
      'UPDATE pessoa SET senha_pessoa = $1 WHERE cpf_pessoa = $2 RETURNING cpf_pessoa, nome_pessoa, endereco_pessoa, data_nascimento_pessoa',
      [nova_senha, id]
    );

    res.json({ sucesso: true, pessoa: updateResult.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
};