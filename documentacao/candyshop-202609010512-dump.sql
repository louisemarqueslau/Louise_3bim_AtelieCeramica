-- =============================================
-- 1. LIMPEZA DE TABELAS ANTIGAS (DROP CASCADE)
-- =============================================
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS funcionarios CASCADE;
DROP TABLE IF EXISTS pessoas CASCADE;
DROP TABLE IF EXISTS cargos CASCADE;
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
CREATE TABLE cargos (
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
    CONSTRAINT fk_cargo_funcionario FOREIGN KEY (cargo_id_cargo) REFERENCES cargos(id_cargo) ON DELETE SET NULL
);

-- Tabela Clientes
CREATE TABLE clientes (
    pessoa_cpf_pessoa VARCHAR(20) PRIMARY KEY,
    renda_cliente DECIMAL(10, 2),
    data_cadastro_cliente DATE,
    CONSTRAINT fk_pessoa_cliente FOREIGN KEY (pessoa_cpf_pessoa) REFERENCES pessoas(cpf_pessoa) ON DELETE CASCADE
);

-- =============================================
-- 3. INSERTS DE TESTE
-- =============================================

-- Categorias
INSERT INTO categorias (id_categoria, nome_categoria, descricao_categoria) VALUES
(1, 'Canecas e Xícaras', 'Peças utilitárias para bebidas quentes e frias, feitas em torno e modelagem manual.'),
(2, 'Pratos e Travessas', 'Utensílios para servir refeições com acabamento esmaltado atóxico.'),
(3, 'Vasos e Cachepôs', 'Peças decorativas para plantas e arranjos florais com texturas únicas.'),
(4, 'Decoração', 'Esculturas, incensários e objetos ornamentais moldados à mão.');

-- Sincroniza o autoincremento (SERIAL) das categorias para não dar erro ao cadastrar pelo site
SELECT setval('categorias_id_categoria_seq', (SELECT MAX(id_categoria) FROM categorias));

-- Produtos
INSERT INTO produtos (categoria_id, nome_produto, descricao_produto, preco_produto, estoque_produto, imagem_url) VALUES
(1, 'Caneca Rústica Sálvia', 'Caneca em cerâmica de alta temperatura com esmalte reativo tom verde-sálvia.', 68.00, 12, 'https://exemplo.com/imagens/caneca-salvia.jpg'),
(1, 'Xícara de Café Espaço', 'Xícara pequena para café expresso com textura áspera por fora e esmaltada por dentro.', 42.50, 20, 'https://exemplo.com/imagens/xicara-espaco.jpg'),
(2, 'Prato Raso Texturizado', 'Prato de refeição com bordas irregulares e acabamento mate acetinado.', 85.00, 8, 'https://exemplo.com/imagens/prato-raso.jpg'),
(2, 'Bowl Botânico', 'Tigela média para sopas e saladas, com decalque foliar gravado na argila.', 74.90, 15, 'https://exemplo.com/imagens/bowl-botanico.jpg'),
(3, 'Vaso Escultural Orgânico', 'Vaso alto para flores secas com formato assimétrico e acabamento natural sem esmalte.', 140.00, 4, 'https://exemplo.com/imagens/vaso-organico.jpg'),
(3, 'Cachepô Mini Terra Cota', 'Pequeno cachepô para suculentas e cactos com furo de drenagem.', 35.00, 25, 'https://exemplo.com/imagens/cachepo-terracota.jpg'),
(4, 'Incensário Folha', 'Porta-incenso em formato de folha natural com detalhe em esmalte branco rústico.', 29.90, 18, 'https://exemplo.com/imagens/incensario-folha.jpg');

-- Sincroniza o autoincremento (SERIAL) dos produtos
SELECT setval('produtos_id_produto_seq', (SELECT MAX(id_produto) FROM produtos));

-- Pessoas
INSERT INTO pessoas (cpf_pessoa, nome_pessoa, email_pessoa, data_nascimento_pessoa, senha_pessoa, endereco_pessoa) VALUES
('123.456.789-00', 'Ana Clara Souza', 'ana.clara@email.com', '1995-05-20', '123456', 'Rua das Flores, 123'),
('987.654.321-11', 'Bruno Oliveira', 'bruno.oliveira@email.com', '1988-11-10', '123456', 'Av. Central, 456');

-- Clientes
INSERT INTO clientes (pessoa_cpf_pessoa, renda_cliente, data_cadastro_cliente) VALUES
('123.456.789-00', 3500.00, '2024-01-15'),
('987.654.321-11', 5000.00, '2024-02-10');