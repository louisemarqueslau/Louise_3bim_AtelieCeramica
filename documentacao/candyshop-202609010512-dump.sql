-- ============================================
-- 1. LIMPEZA (CASO PRECISE RECRIAR O BANCO)
-- ============================================
DROP TABLE IF EXISTS public.pagamento CASCADE;
DROP TABLE IF EXISTS public.pedido_item CASCADE;
DROP TABLE IF EXISTS public.pedido CASCADE;
DROP TABLE IF EXISTS public.produto CASCADE;
DROP TABLE IF EXISTS public.categoria CASCADE;
DROP TABLE IF EXISTS public.unidade_medida CASCADE;
DROP TABLE IF EXISTS public.funcionario CASCADE;
DROP TABLE IF EXISTS public.cliente CASCADE;
DROP TABLE IF EXISTS public.pessoa CASCADE;
DROP TABLE IF EXISTS public.perfil CASCADE;
DROP TABLE IF EXISTS public.cargo CASCADE;
DROP TABLE IF EXISTS public.forma_pagamento CASCADE;

-- ============================================
-- 2. CRIAÇÃO DAS TABELAS INDEPENDENTES
-- ============================================

-- Tabela de Cargos dos Funcionários
CREATE TABLE public.cargo (
    id_cargo SERIAL PRIMARY KEY,
    nome_cargo VARCHAR(45) NOT NULL
);

-- Tabela de Unidades de Medida dos Produtos
CREATE TABLE public.unidade_medida (
    id_unidade_medida VARCHAR(5) PRIMARY KEY,
    nome_unidade_medida VARCHAR(30) NOT NULL
);

-- Tabela de Categorias dos Produtos
CREATE TABLE public.categoria (
    id_categoria SERIAL PRIMARY KEY,
    nome_categoria VARCHAR(50) NOT NULL,
    descricao_categoria TEXT
);

-- Tabela de Formas de Pagamento
CREATE TABLE public.forma_pagamento (
    id_forma_pagamento SERIAL PRIMARY KEY,
    nome_forma_pagamento VARCHAR(50) NOT NULL
);

-- Tabela de Perfis/Níveis de Acesso para Login
CREATE TABLE public.perfil (
    id_perfil SERIAL PRIMARY KEY,
    nome_perfil VARCHAR(30) NOT NULL -- ex: 'ADMIN', 'FUNCIONARIO', 'CLIENTE'
);

-- ============================================
-- 3. CRIAÇÃO DAS TABELAS COM DEPENDÊNCIAS
-- ============================================

-- Tabela Geral de Pessoas (Dados Pessoais e Autenticação)
CREATE TABLE public.pessoa (
    cpf_pessoa VARCHAR(20) PRIMARY KEY,
    nome_pessoa VARCHAR(60) NOT NULL,
    data_nascimento_pessoa DATE,
    endereco_pessoa VARCHAR(150),
    email_pessoa VARCHAR(75) UNIQUE NOT NULL,
    senha_pessoa VARCHAR(255) NOT NULL, -- Recomendado guardar Hash
    id_perfil INTEGER REFERENCES public.perfil(id_perfil)
);

-- Tabela de Clientes
CREATE TABLE public.cliente (
    pessoa_cpf_pessoa VARCHAR(20) PRIMARY KEY REFERENCES public.pessoa(cpf_pessoa) ON DELETE CASCADE,
    renda_cliente DOUBLE PRECISION DEFAULT 0.0,
    data_cadastro_cliente DATE DEFAULT CURRENT_DATE
);

-- Tabela de Funcionários
CREATE TABLE public.funcionario (
    pessoa_cpf_pessoa VARCHAR(20) PRIMARY KEY REFERENCES public.pessoa(cpf_pessoa) ON DELETE CASCADE,
    salario_funcionario DOUBLE PRECISION DEFAULT 0.0,
    porcentagem_comissao DOUBLE PRECISION DEFAULT 0.0,
    cargo_id_cargo INTEGER REFERENCES public.cargo(id_cargo)
);

-- Tabela de Produtos (com Categoria e Unidade de Medida)
CREATE TABLE public.produto (
    id_produto SERIAL PRIMARY KEY,
    nome_produto VARCHAR(60) NOT NULL,
    quantidade_estoque INTEGER DEFAULT 0,
    preco_unitario DOUBLE PRECISION NOT NULL,
    id_unidade_medida VARCHAR(5) REFERENCES public.unidade_medida(id_unidade_medida),
    id_categoria INTEGER REFERENCES public.categoria(id_categoria) ON DELETE SET NULL
);

-- Tabela de Pedidos
CREATE TABLE public.pedido (
    id_pedido SERIAL PRIMARY KEY,
    data_pedido TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cliente_cpf VARCHAR(20) REFERENCES public.cliente(pessoa_cpf_pessoa),
    funcionario_cpf VARCHAR(20) REFERENCES public.funcionario(pessoa_cpf_pessoa)
);

-- Tabela de Itens do Pedido (Relacionamento N:M)
CREATE TABLE public.pedido_item (
    id_pedido INTEGER REFERENCES public.pedido(id_pedido) ON DELETE CASCADE,
    id_produto INTEGER REFERENCES public.produto(id_produto),
    quantidade INTEGER NOT NULL,
    preco_unitario DOUBLE PRECISION NOT NULL,
    PRIMARY KEY (id_pedido, id_produto)
);

-- Tabela de Pagamentos
CREATE TABLE public.pagamento (
    id_pedido INTEGER REFERENCES public.pedido(id_pedido) ON DELETE CASCADE,
    id_forma_pagamento INTEGER REFERENCES public.forma_pagamento(id_forma_pagamento),
    valor_pago DOUBLE PRECISION NOT NULL,
    data_pagamento TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_pedido, id_forma_pagamento)
);

-- ============================================
-- 4. INSERTS DE INICIALIZAÇÃO (DADOS PADRÃO)
-- ============================================

-- Perfis de Acesso
INSERT INTO public.perfil (nome_perfil) VALUES ('ADMIN'), ('FUNCIONARIO'), ('CLIENTE');

-- Unidades de Medida
INSERT INTO public.unidade_medida VALUES ('UN', 'Unidade'), ('KG', 'Quilograma'), ('L', 'Litro'), ('CX', 'Caixa'), ('PC', 'Pacote');

-- Categorias Exemplo
INSERT INTO public.categoria (nome_categoria, descricao_categoria) VALUES 
('Doces & Confeitaria', 'Bolos, Pães de Mel, Doces Variados'),
('Bebidas', 'Refrigerantes, Sucos e Águas'),
('Salgados', 'Coxinhas, Empadas e Assados');

-- Formas de Pagamento
INSERT INTO public.forma_pagamento (nome_forma_pagamento) VALUES 
('Dinheiro'), ('Pix'), ('Cartão de Crédito'), ('Cartão de Débito');

-- Cargos
INSERT INTO public.cargo (nome_cargo) VALUES ('Gerente'), ('Atendente'), ('Caixa');

-- Pessoa / Usuário Admin Exemplo (Senha: 123456)
INSERT INTO public.pessoa (cpf_pessoa, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, email_pessoa, senha_pessoa, id_perfil) 
VALUES ('00000000000', 'Administrador da Loja', '1990-01-01', 'Rua Principal, 100', 'admin@loja.com', '123456', 1);

-- Inserindo o Admin como Funcionário Gerente
INSERT INTO public.funcionario (pessoa_cpf_pessoa, salario_funcionario, porcentagem_comissao, cargo_id_cargo)
VALUES ('00000000000', 3500.00, 5.0, 1);

-- Produtos Iniciais
INSERT INTO public.produto (nome_produto, quantidade_estoque, preco_unitario, id_unidade_medida, id_categoria) VALUES
('Pão de Mel', 40, 6.50, 'UN', 1),
('Doce de Leite', 30, 12.00, 'UN', 1),
('Refrigerante 2L', 50, 8.50, 'UN', 2),
('Biscoito Amanteigado', 80, 4.50, 'PC', 1);