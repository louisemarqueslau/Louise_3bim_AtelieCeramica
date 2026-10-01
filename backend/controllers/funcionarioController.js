const { query } = require('../database');
const path = require('path');

exports.abrirCrudFuncionario = (req, res) => {
  const usuario = req.cookies ? req.cookies.usuarioLogado : null;
  if (usuario) {
    res.sendFile(path.join(__dirname, '../../frontend/funcionario/funcionario.html'));
  } else {
    res.redirect('/login');
  }
};

exports.listarFuncionarios = async (req, res) => {
  try {
    const result = await query(
      `SELECT func.pessoa_cpf_pessoa, p.nome_pessoa, func.salario_funcionario, 
              func.cargo_id_cargo, c.nome_cargo, func.porcentagem_comissao_funcionario 
       FROM funcionario func
       JOIN pessoa p ON func.pessoa_cpf_pessoa = p.cpf_pessoa
       LEFT JOIN cargo c ON func.cargo_id_cargo = c.id_cargo
       ORDER BY func.pessoa_cpf_pessoa`
    );
    res.json({ sucesso: true, funcionarios: result.rows });
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor ao listar funcionários.' });
  }
};

exports.criarFuncionario = async (req, res) => {
  try {
    const { pessoa_cpf_pessoa, salario_funcionario, cargo_id_cargo, porcentagem_comissao_funcionario } = req.body;

    if (!pessoa_cpf_pessoa || salario_funcionario === undefined) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'CPF e salário do funcionário são obrigatórios.'
      });
    }

    const result = await query(
      'INSERT INTO funcionario (pessoa_cpf_pessoa, salario_funcionario, cargo_id_cargo, porcentagem_comissao_funcionario) VALUES ($1, $2, $3, $4) RETURNING *',
      [
        String(pessoa_cpf_pessoa).trim(),
        salario_funcionario,
        cargo_id_cargo || null,
        porcentagem_comissao_funcionario || 0
      ]
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Funcionário cadastrado com sucesso!',
      funcionario: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);

    if (error.code === '23505') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Esta pessoa já está cadastrada como funcionária.'
      });
    }

    if (error.code === '23503') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'CPF da pessoa ou ID do cargo informado não existe.'
      });
    }

    if (error.code === '23502') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Dados obrigatórios não fornecidos.'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor ao cadastrar funcionário.' });
  }
};

exports.obterFuncionario = async (req, res) => {
  try {
    const id = req.params.id ? String(req.params.id).trim() : null;

    if (!id) {
      return res.status(400).json({ sucesso: false, mensagem: 'CPF inválido.' });
    }

    const result = await query(
      'SELECT * FROM funcionario WHERE pessoa_cpf_pessoa = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Funcionário não encontrado.' });
    }

    res.json({ sucesso: true, funcionario: result.rows[0] });
  } catch (error) {
    console.error('Erro ao obter funcionário:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
};

exports.atualizarFuncionario = async (req, res) => {
  try {
    const id = req.params.id ? String(req.params.id).trim() : null;
    const { salario_funcionario, cargo_id_cargo, porcentagem_comissao_funcionario } = req.body;

    const existingPersonResult = await query(
      'SELECT * FROM funcionario WHERE pessoa_cpf_pessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Funcionário não encontrado.' });
    }

    const currentFunc = existingPersonResult.rows[0];

    const updatedFields = {
      salario_funcionario: salario_funcionario !== undefined ? salario_funcionario : currentFunc.salario_funcionario,
      cargo_id_cargo: cargo_id_cargo !== undefined ? cargo_id_cargo : currentFunc.cargo_id_cargo,
      porcentagem_comissao_funcionario: porcentagem_comissao_funcionario !== undefined ? porcentagem_comissao_funcionario : currentFunc.porcentagem_comissao_funcionario
    };

    const updateResult = await query(
      'UPDATE funcionario SET salario_funcionario = $1, cargo_id_cargo = $2, porcentagem_comissao_funcionario = $3 WHERE pessoa_cpf_pessoa = $4 RETURNING *',
      [updatedFields.salario_funcionario, updatedFields.cargo_id_cargo, updatedFields.porcentagem_comissao_funcionario, id]
    );

    res.json({
      sucesso: true,
      mensagem: 'Funcionário atualizado com sucesso!',
      funcionario: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'O cargo informado não existe.'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor ao atualizar funcionário.' });
  }
};

exports.deletarFuncionario = async (req, res) => {
  try {
    const id = req.params.id ? String(req.params.id).trim() : null;

    const existingPersonResult = await query(
      'SELECT * FROM funcionario WHERE pessoa_cpf_pessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Funcionário não encontrado.' });
    }

    await query(
      'DELETE FROM funcionario WHERE pessoa_cpf_pessoa = $1',
      [id]
    );

    res.json({ sucesso: true, mensagem: 'Funcionário excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);

    if (error.code === '23503') {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Não é possível excluir o funcionário pois possui vendas ou registros associados.'
      });
    }

    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
  }
};