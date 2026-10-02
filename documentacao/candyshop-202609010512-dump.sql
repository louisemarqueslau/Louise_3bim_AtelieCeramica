-- =============================================
-- 1. LIMPEZA DE TABELAS ANTIGAS (DROP CASCADE)
-- =============================================
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS funcionarios CASCADE;
DROP TABLE IF EXISTS pessoas CASCADE;
DROP TABLE IF EXISTS cargo CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;

-- =============================================
-- 2. CRIAÇÃO DAS TABELAS
-- =============================================

-- Tabela Categorias
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nome_categoria VARCHAR(100) NOT NULL,
    descricao_categoria TEXT
);

-- Tabela Produtos
CREATE TABLE produtos (
    id_produto SERIAL PRIMARY KEY,
    categoria_id INT NOT NULL,
    nome_produto VARCHAR(150) NOT NULL,
    descricao_produto TEXT,
    preco_produto DECIMAL(10, 2) NOT NULL,
    estoque_produto INT DEFAULT 0,
    imagem_url VARCHAR(255),
    CONSTRAINT fk_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id_categoria) ON DELETE CASCADE
);

-- Tabela Cargos
CREATE TABLE cargo (
    id_cargo SERIAL PRIMARY KEY,
    nome_cargo VARCHAR(100) NOT NULL,
    descricao_cargo TEXT
);

-- Tabela Pessoas
CREATE TABLE pessoas (
    cpf_pessoa VARCHAR(20) PRIMARY KEY,
    nome_pessoa VARCHAR(150) NOT NULL,
    email_pessoa VARCHAR(150) NOT NULL UNIQUE,
    data_nascimento_pessoa DATE,
    senha_pessoa VARCHAR(255) NOT NULL,
    endereco_pessoa VARCHAR(255) NOT NULL
);

-- Tabela Funcionários
CREATE TABLE funcionarios (
    pessoa_cpf_pessoa VARCHAR(20) PRIMARY KEY,
    cargo_id_cargo INT,
    salario_funcionario DECIMAL(10, 2),
    porcentagem_comissao_funcionario VARCHAR(20),
    CONSTRAINT fk_pessoa_funcionario FOREIGN KEY (pessoa_cpf_pessoa) REFERENCES pessoas(cpf_pessoa) ON DELETE CASCADE,
    CONSTRAINT fk_cargo_funcionario FOREIGN KEY (cargo_id_cargo) REFERENCES cargo(id_cargo) ON DELETE SET NULL
);

-- Tabela Clientes
CREATE TABLE clientes (
    pessoa_cpf_pessoa VARCHAR(20) PRIMARY KEY,
    renda_cliente DECIMAL(10, 2),
    data_cadastro_cliente DATE,
    CONSTRAINT fk_pessoa_cliente FOREIGN KEY (pessoa_cpf_pessoa) REFERENCES pessoas(cpf_pessoa) ON DELETE CASCADE
);

-- =============================================
-- 3. INSERTS DE TESTE (10 EXEMPLOS POR TABELA)
-- =============================================

-- 10 Categorias
INSERT INTO categorias (id_categoria, nome_categoria, descricao_categoria) VALUES
(1, 'Canecas e Xícaras', 'Peças utilitárias para bebidas quentes e frias.'),
(2, 'Pratos e Travessas', 'Utensílios para servir refeições com acabamento esmaltado.'),
(3, 'Vasos e Cachepôs', 'Peças decorativas para plantas e arranjos florais.'),
(4, 'Decoração e Esculturas', 'Objetos ornamentais e decorativos moldados à mão.'),
(5, 'Bowls e Tigelas', 'Tigelas versáteis para sopas, saladas e cereais.'),
(6, 'Copos e Sakes', 'Copos rústicos de cerâmica e conjuntos para bebidas.'),
(7, 'Jarras e Bules', 'Recipientes para servir líquidos, chá e café.'),
(8, 'Incensários e Velas', 'Suportes para incenso e potes para velas aromáticas.'),
(9, 'Acessórios de Cozinha', 'Porta-colher, descanso de talheres e tábuas de cerâmica.'),
(10, 'Kits e Conjuntos', 'Conjuntos de louças para presente e jogos americanos.');

SELECT setval('categorias_id_categoria_seq', (SELECT MAX(id_categoria) FROM categorias));

-- 10 Produtos
INSERT INTO produtos (categoria_id, nome_produto, descricao_produto, preco_produto, estoque_produto, imagem_url) VALUES
(1, 'Caneca Rústica Sálvia', 'Caneca de cerâmica em alta temperatura tom verde-sálvia.', 68.00, 12, 'https://exemplo.com/imagens/caneca-salvia.jpg'),
(1, 'Xícara de Café Espaço', 'Xícara pequena para café expresso com textura áspera.', 42.50, 20, 'https://exemplo.com/imagens/xicara-espaco.jpg'),
(2, 'Prato Raso Texturizado', 'Prato de refeição com bordas irregulares e acabamento mate.', 85.00, 8, 'https://exemplo.com/imagens/prato-raso.jpg'),
(2, 'Bowl Botânico', 'Tigela média para sopas com decalque foliar.', 74.90, 15, 'https://exemplo.com/imagens/bowl-botanico.jpg'),
(3, 'Vaso Escultural Orgânico', 'Vaso alto para flores secas com formato assimétrico.', 140.00, 4, 'https://exemplo.com/imagens/vaso-organico.jpg'),
(3, 'Cachepô Mini Terra Cota', 'Pequeno cachepô para suculentas com furo de drenagem.', 35.00, 25, 'https://exemplo.com/imagens/cachepo-terracota.jpg'),
(4, 'Incensário Folha', 'Porta-incenso em formato de folha natural.', 29.90, 18, 'https://exemplo.com/imagens/incensario-folha.jpg'),
(5, 'Bowl Ramen Vulcânico', 'Tigela grande com esmalte reativo escuro.', 92.00, 10, 'https://exemplo.com/imagens/bowl-ramen.jpg'),
(7, 'Jarra Rústica de Água', 'Jarra feita no torno manual com capacidade de 1.5L.', 115.00, 6, 'https://exemplo.com/imagens/jarra-agua.jpg'),
(8, 'Pote para Vela Aromática', 'Pote cerâmico texturizado reutilizável.', 48.00, 14, 'https://exemplo.com/imagens/pote-vela.jpg');

SELECT setval('produtos_id_produto_seq', (SELECT MAX(id_produto) FROM produtos));

-- 10 Cargos
INSERT INTO cargo (id_cargo, nome_cargo, descricao_cargo) VALUES
(1, 'Ceramista Chefe', 'Responsável pela criação, torno e modelagem das peças.'),
(2, 'Atendente de Vendas', 'Atendimento ao cliente e suporte às compras na loja.'),
(3, 'Técnico em Esmaltação', 'Especialista no preparo e aplicação de esmaltes e vitrificação.'),
(4, 'Operador de Forno', 'Responsável pela programação, carregamento e queimas.'),
(5, 'Gerente de Estoque', 'Controle e organização dos produtos e matérias-primas.'),
(6, 'Designer de Produtos', 'Desenvolvimento de novos coleções e protótipos.'),
(7, 'Auxiliar de Atelier', 'Suporte na preparação de argila e limpeza dos equipamentos.'),
(8, 'Gerente de Marketing', 'Gestão de redes sociais, fotos das peças e campanhas.'),
(9, 'Instrutor de Oficina', 'Ministra aulas e workshops de cerâmica artesanal.'),
(10, 'Embalador e Expedição', 'Embalagem segura e envio das peças vendidas online.');

SELECT setval('cargo_id_cargo_seq', (SELECT MAX(id_cargo) FROM cargo));

-- 10 Pessoas
INSERT INTO pessoas (cpf_pessoa, nome_pessoa, email_pessoa, data_nascimento_pessoa, senha_pessoa, endereco_pessoa) VALUES
('123.456.789-00', 'Ana Clara Souza', 'ana.clara@email.com', '1995-05-20', '123456', 'Rua das Flores, 123'),
('987.654.321-11', 'Bruno Oliveira', 'bruno.oliveira@email.com', '1988-11-10', '123456', 'Av. Central, 456'),
('111.222.333-44', 'Carla Mendes', 'carla.mendes@email.com', '1992-03-15', '123456', 'Rua Sol, 789'),
('555.666.777-88', 'Diego Santos', 'diego.santos@email.com', '1990-08-25', '123456', 'Rua Lua, 321'),
('999.888.777-66', 'Elena Rostova', 'elena.rostova@email.com', '1985-01-30', '123456', 'Alameda das Rosas, 50'),
('222.333.444-55', 'Fernando Costa', 'fernando.costa@email.com', '1997-12-05', '123456', 'Rua dos Pinhais, 12'),
('333.444.555-66', 'Gabriela Lima', 'gabriela.lima@email.com', '1994-07-18', '123456', 'Av. das Nações, 100'),
('444.555.666-77', 'Heitor Pereira', 'heitor.pereira@email.com', '1991-09-02', '123456', 'Rua São José, 88'),
('666.777.888-99', 'Isabela Rocha', 'isabela.rocha@email.com', '1998-04-12', '123456', 'Praça Central, 15'),
('777.888.999-00', 'João Pedro Alves', 'joao.pedro@email.com', '1993-06-22', '123456', 'Rua Primavera, 404');

-- 10 Funcionários
INSERT INTO funcionarios (pessoa_cpf_pessoa, cargo_id_cargo, salario_funcionario, porcentagem_comissao_funcionario) VALUES
('123.456.789-00', 1, 4500.00, '5%'),
('987.654.321-11', 2, 2200.00, '3%'),
('111.222.333-44', 3, 3800.00, '0%'),
('555.666.777-88', 4, 3200.00, '0%'),
('999.888.777-66', 5, 3000.00, '2%'),
('222.333.444-55', 6, 4200.00, '0%'),
('333.444.555-66', 7, 1800.00, '0%'),
('444.555.666-77', 8, 3500.00, '4%'),
('666.777.888-99', 9, 2800.00, '0%'),
('777.888.999-00', 10, 2000.00, '1%');

-- 10 Clientes (Pessoas cadastradas como clientes)
INSERT INTO clientes (pessoa_cpf_pessoa, renda_cliente, data_cadastro_cliente) VALUES
('123.456.789-00', 3500.00, '2024-01-15'),
('987.654.321-11', 5000.00, '2024-02-10'),
('111.222.333-44', 4200.00, '2024-02-15'),
('555.666.777-88', 6100.00, '2024-03-01'),
('999.888.777-66', 8500.00, '2024-03-12'),
('222.333.444-55', 2900.00, '2024-03-20'),
('333.444.555-66', 3800.00, '2024-04-05'),
('444.555.666-77', 7200.00, '2024-04-18'),
('666.777.888-99', 4100.00, '2024-05-02'),
('777.888.999-00', 5300.00, '2024-05-20');