const API_BASE_URL = 'http://localhost:3001';

// Variável para controlar a operação atual ('inserir', 'alterar', 'excluir')
let operacaoAtual = null;

document.addEventListener('DOMContentLoaded', () => {
    carregarCategoriasEUnidades();
    carregarProdutos();
});

// 1. Carrega o Select de Unidades de Medida / Categorias
async function carregarCategoriasEUnidades() {
    const selectUnidade = document.getElementById('selectId_unidade_medida');
    if (!selectUnidade) return;

    try {
        const response = await fetch(`${API_BASE_URL}/categoria`);
        const data = await response.json();

        selectUnidade.innerHTML = '<option value="">Selecione uma opção</option>';
        selectUnidade.disabled = false;

        const lista = data.categorias || data;
        if (Array.isArray(lista)) {
            lista.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id_categoria || cat.id;
                option.textContent = cat.nome_categoria || cat.nome;
                selectUnidade.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar categorias/unidades:', error);
    }
}

// 2. Carrega e renderiza a lista de produtos na tabela
async function carregarProdutos() {
    const outputSaida = document.getElementById('outputSaida');
    if (!outputSaida) return;

    try {
        const response = await fetch(`${API_BASE_URL}/produto`);
        const data = await response.json();

        const produtos = data.produtos || data;

        if (Array.isArray(produtos) && produtos.length > 0) {
            let htmlTable = `
                <table border="1" style="width:100%; text-align:left; border-collapse: collapse; margin-top:10px;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="padding: 8px;">ID</th>
                            <th style="padding: 8px;">Nome</th>
                            <th style="padding: 8px;">Estoque</th>
                            <th style="padding: 8px;">Preço</th>
                            <th style="padding: 8px;">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            produtos.forEach(prod => {
                const preco = Number(prod.preco_produto || prod.preco_unitario_produto || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });

                htmlTable += `
                    <tr>
                        <td style="padding: 8px;">${prod.id_produto}</td>
                        <td style="padding: 8px;">${prod.nome_produto}</td>
                        <td style="padding: 8px;">${prod.estoque_produto ?? prod.quantidade_estoque_produto ?? 0} un.</td>
                        <td style="padding: 8px;">${preco}</td>
                        <td style="padding: 8px;">
                            <button type="button" class="btn-selecionar" onclick="selecionarProduto(${prod.id_produto})">Selecionar</button>
                        </td>
                    </tr>
                `;
            });

            htmlTable += '</tbody></table>';
            outputSaida.innerHTML = htmlTable;
        } else {
            outputSaida.innerHTML = '<p>Nenhum produto cadastrado no momento.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        outputSaida.innerHTML = '<p style="color:red;">Erro ao carregar produtos do servidor.</p>';
    }
}

// 3. Função de Busca pelo ID (disparada pelo botão "Procure")
async function procure() {
    const idInput = document.getElementById('inputId_produto');
    const id = idInput ? idInput.value.trim() : '';

    if (!id) {
        setAviso('Por favor, digite um ID para procurar.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/produto/${id}`);
        const data = await response.json();

        if (response.ok && data.sucesso && data.produto) {
            const prod = data.produto;

            // Preenche os campos do formulário
            document.getElementById('inputNome_produto').value = prod.nome_produto || '';
            document.getElementById('selectId_unidade_medida').value = prod.categoria_id || prod.id_unidade_medida || '';
            document.getElementById('inputQuantidade_estoque_produto').value = prod.estoque_produto ?? prod.quantidade_estoque_produto ?? 0;
            document.getElementById('inputPreco_unitario_produto').value = prod.preco_produto ?? prod.preco_unitario_produto ?? 0;

            // Define a imagem do produto (ou padrao se nao existir)
            const img = document.getElementById('imgProduto');
            if (img) {
                img.src = `${API_BASE_URL}/imagens/${prod.id_produto}.png`;
                img.onerror = () => { img.src = `${API_BASE_URL}/imagens/silhueta.png`; };
            }

            setAviso(`Produto #${prod.id_produto} encontrado! Escolha se deseja Alterar ou Excluir.`);
            
            // Exibe botões Alterar e Excluir
            mostrarBotoes({ procure: true, inserir: false, alterar: true, excluir: true, salvar: false, cancelar: true });
            desabilitarCampos(true);
        } else {
            // Se não encontrou o produto, sugere Inserir um novo com esse ID
            limparFormularioParcial();
            setAviso(`ID #${id} não encontrado. Você pode CADASTRAR um novo produto com este ID.`);
            mostrarBotoes({ procure: true, inserir: true, alterar: false, excluir: false, salvar: false, cancelar: true });
        }
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        setAviso('Erro de conexão ao buscar o produto.');
    }
}

// 4. Selecionar direto da tabela
function selecionarProduto(id) {
    document.getElementById('inputId_produto').value = id;
    procure();
}

// 5. Ações dos Botões do CRUD
function inserir() {
    operacaoAtual = 'inserir';
    desabilitarCampos(false);
    setAviso('Preencha os dados e clique em SALVAR para cadastrar.');
    mostrarBotoes({ procure: false, inserir: false, alterar: false, excluir: false, salvar: true, cancelar: true });
}

function alterar() {
    operacaoAtual = 'alterar';
    desabilitarCampos(false);
    setAviso('Modifique os dados desejados e clique em SALVAR.');
    mostrarBotoes({ procure: false, inserir: false, alterar: false, excluir: false, salvar: true, cancelar: true });
}

function excluir() {
    operacaoAtual = 'excluir';
    desabilitarCampos(true);
    setAviso('Confirme se deseja realmente EXCLUIR este produto clicando em Salvar.');
    mostrarBotoes({ procure: false, inserir: false, alterar: false, excluir: false, salvar: true, cancelar: true });
}
// 6. Salvar (POST / PUT / DELETE)
async function salvar() {
    const idInput = document.getElementById('inputId_produto').value.trim();
    const nome = document.getElementById('inputNome_produto').value.trim();
    const unidadeMedida = document.getElementById('selectId_unidade_medida').value;
    const estoque = document.getElementById('inputQuantidade_estoque_produto').value;
    const preco = document.getElementById('inputPreco_unitario_produto').value;

    if (operacaoAtual !== 'excluir' && !nome) {
        alert('O nome do produto é obrigatório.');
        return;
    }

    try {
        let res;
        const payload = {
            id_produto: idInput ? parseInt(idInput, 10) : null,
            nome_produto: nome,
            id_unidade_medida: unidadeMedida ? parseInt(unidadeMedida, 10) : null,
            quantidade_estoque_produto: estoque !== '' ? parseInt(estoque, 10) : 0,
            preco_unitario_produto: preco !== '' ? parseFloat(preco) : 0.0
        };

        if (operacaoAtual === 'inserir') {
            res = await fetch(`${API_BASE_URL}/produto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else if (operacaoAtual === 'alterar') {
            if (!idInput) {
                alert('ID do produto não especificado.');
                return;
            }
            res = await fetch(`${API_BASE_URL}/produto/${idInput}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else if (operacaoAtual === 'excluir') {
            if (!idInput) {
                alert('ID do produto não especificado para exclusão.');
                return;
            }
            res = await fetch(`${API_BASE_URL}/produto/${idInput}`, {
                method: 'DELETE'
            });
        }

        const data = await res.json();

        if (res.ok && data.sucesso) {
            const idParaImagem = data.produto?.id_produto || idInput;
            const fileInput = document.getElementById('inputImagem');

            // 1. Envia a imagem ANTES de cancelar e limpar os campos da tela
            if (fileInput && fileInput.files.length > 0 && operacaoAtual !== 'excluir' && idParaImagem) {
                await enviarImagem(idParaImagem, fileInput.files[0]);
            }

            alert(data.mensagem || 'Operação realizada com sucesso!');

            // 2. Limpa o formulário e recarrega a tabela de produtos
            cancelarOperacao();
            carregarProdutos();
        } else {
            alert(data.mensagem || 'Erro ao realizar a operação no servidor.');
        }
    } catch (error) {
        console.error('Erro na requisição salvar:', error);
        alert('Erro de conexão ao tentar salvar o produto.');
    }
}

// 7. Auxiliar para Envio de Imagem
async function enviarImagem(idProduto, file) {
    const formData = new FormData();
    formData.append('imagem', file);

    try {
        const response = await fetch(`${API_BASE_URL}/produto/upload/${idProduto}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok || !data.sucesso) {
            console.error('Erro ao salvar a imagem no servidor:', data.mensagem);
            alert('Produto salvo, mas ocorreu um erro ao salvar a imagem.');
        }
    } catch (err) {
        console.error('Erro no upload da imagem:', err);
    }
}
// 8. Funções de Controle de Interface (Exibição de Botões e Estado)
function cancelarOperacao() {
    operacaoAtual = null;
    limparFormularioCompleto();
    desabilitarCampos(true);
    setAviso('Informe o ID e clique em Procure');
    mostrarBotoes({ procure: true, inserir: false, alterar: false, excluir: false, salvar: false, cancelar: false });
}

function mostrarBotoes({ procure, inserir, alterar, excluir, salvar, cancelar }) {
    setDisp('btProcure', procure);
    setDisp('btInserir', inserir);
    setDisp('btAlterar', alterar);
    setDisp('btExcluir', excluir);
    setDisp('btSalvar', salvar);
    setDisp('btCancelar', cancelar);
}

function setDisp(id, visivel) {
    const el = document.getElementById(id);
    if (el) el.style.display = visivel ? 'inline-block' : 'none';
}

function desabilitarCampos(status) {
    const campos = ['inputNome_produto', 'selectId_unidade_medida', 'inputQuantidade_estoque_produto', 'inputPreco_unitario_produto'];
    campos.forEach(cId => {
        const el = document.getElementById(cId);
        if (el) el.disabled = status;
    });
}

function limparFormularioParcial() {
    document.getElementById('inputNome_produto').value = '';
    document.getElementById('selectId_unidade_medida').value = '';
    document.getElementById('inputQuantidade_estoque_produto').value = '';
    document.getElementById('inputPreco_unitario_produto').value = '';
}

function limparFormularioCompleto() {
    document.getElementById('inputId_produto').value = '';
    
    // Limpa a seleção do arquivo de imagem
    const fileInput = document.getElementById('inputImagem');
    if (fileInput) fileInput.value = '';

    limparFormularioParcial();
    
    const img = document.getElementById('imgProduto');
    if (img) img.src = `${API_BASE_URL}/imagens/silhueta.png`;
}

function setAviso(texto) {
    const divAviso = document.getElementById('divAviso');
    if (divAviso) divAviso.innerText = texto;
}

// Funções para Upload e Preview da Imagem
function acionarUpload() {
    const fileInput = document.getElementById('inputImagem');
    if (fileInput) fileInput.click();
}

function previewImagem() {
    const fileInput = document.getElementById('inputImagem');
    const img = document.getElementById('imgProduto');
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

// Função para carregar as categorias na tag <select id="selectId_unidade_medida"> ou <select id="selectId_categoria">
async function carregarCategoriasNoSelect() {
    const selectCat = document.getElementById('selectId_unidade_medida') || document.getElementById('selectId_categoria');
    if (!selectCat) return;

    try {
        const response = await fetch(`${API_BASE_URL}/categoria`);
        const data = await response.json();
        const categorias = data.categorias || data;

        selectCat.innerHTML = '<option value="">Selecione uma categoria...</option>';

        if (Array.isArray(categorias)) {
            categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id_categoria;
                option.textContent = cat.nome_categoria;
                selectCat.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar categorias no select:', error);
    }
}

// Chame essa função ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarCategoriasNoSelect();
    carregarProdutos();
});