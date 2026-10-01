const { query } = require('../database');
const path = require('path');

exports.abrirCrudCliente = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/cliente/cliente.html'));
};

exports.listarClientes = async (req, res) => {
  try {
    const result = await query(
      `SELECT cli.pessoa_cpf_pessoa, p.nome_pessoa, cli.renda_cliente, cli.data_cadastro_cliente 
       FROM cliente cli 
       JOIN pessoa p ON cli.pessoa_cpf_pessoa = p.cpf_pessoa 
       ORDER BY cli.pessoa_cpf_pessoa`
    );
    res.json({ sucesso: true, clientes: result.rows });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor ao listar clientes.' });
  }
};

exports.criarCliente = async (req, res) => {
  try {
    const { pessoa_cpf_pessoa, renda_cliente, data_cadastro_cliente } = req.body;

    if (!pessoa_cpf_pessoa) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O CPF da pessoa é obrigatório para cadastrar como cliente.'
      });
    }

    const result = await query(
      'INSERT INTO cliente (pessoa_cpf_pessoa, renda_cliente, data_cadastro_cliente) VALUES ($1, $2, $3) RETURNING *',
      [pessoa_cpf_pessoa, renda_cliente || null, data_cadastro_cliente || new Date()]
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Cliente cadastrado com sucesso!',
      cliente: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);

    if (error.code === '23502') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados obrigatórios não foram fornecidos.'
      });
    }

    if (error.code === '23505') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Esta pessoa já está cadastrada como cliente.'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
};

exports.obterCliente = async (req, res) => {
  try {
    const id = req.params.id; // Mantém como String para preservar CPFs

    if (!id) {
      return res.status(400).json({ sucesso: false, mensagem: 'CPF/ID inválido.' });
    }

    const result = await query(
      'SELECT * FROM cliente WHERE pessoa_cpf_pessoa = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado.' });
    }

    res.json({
      sucesso: true,
      cliente: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao obter cliente:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
};

exports.atualizarCliente = async (req, res) => {
  try {
    const id = req.params.id;
    const { renda_cliente, data_cadastro_cliente } = req.body;

    const updateResult = await query(
      'UPDATE cliente SET renda_cliente = $1, data_cadastro_cliente = $2 WHERE pessoa_cpf_pessoa = $3 RETURNING *',
      [renda_cliente, data_cadastro_cliente, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado para atualização.' });
    }

    res.json({
      sucesso: true,
      mensagem: 'Cliente atualizado com sucesso!',
      cliente: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
};

exports.deletarCliente = async (req, res) => {
  const id = req.params.id;

  try {
    const existingPersonResult = await query(
      'SELECT * FROM cliente WHERE pessoa_cpf_pessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado.' });
    }

    await query(
      'DELETE FROM cliente WHERE pessoa_cpf_pessoa = $1',
      [id]
    );

    res.status(200).json({
      sucesso: true,
      mensagem: 'Cliente removido com sucesso!'
    });

  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Não é possível excluir o cliente pois possui registos vinculados (ex: encomendas/vendas).'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor ao tentar excluir o cliente.' });
  }
};

