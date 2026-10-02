const API_CATEGORIA = 'http://localhost:3001/categoria';
const API_PRODUTO = 'http://localhost:3001/produto';

const inputBusca = document.getElementById('inputBusca');
const selectCategoria = document.getElementById('selectCategoria');
const btnLimparFiltros = document.getElementById('btnLimparFiltros');
const tagsContainer = document.getElementById('tagsContainer');
const productsGrid = document.getElementById('productsGrid');
const totalProdutos = document.getElementById('totalProdutos');
const noResults = document.getElementById('noResults');

let todosProdutos = [];
let todasCategorias = [];

document.addEventListener('DOMContentLoaded', async () => {
    await carregarCategorias();
    await carregarProdutos();

    // Eventos de filtro
    inputBusca?.addEventListener('input', aplicarFiltros);
    selectCategoria?.addEventListener('change', (e) => {
        atualizarTagAtiva(e.target.value);
        aplicarFiltros();
    });
    btnLimparFiltros?.addEventListener('click', limparFiltros);
});

// 1. Carregar Categorias e Preencher Select + Tags
async function carregarCategorias() {
    try {
        const res = await fetch(API_CATEGORIA);
        const data = await res.json();

        if (res.ok && data.categorias) {
            todasCategorias = data.categorias;
            renderizarFiltrosCategorias();
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

function renderizarFiltrosCategorias() {
    if (!selectCategoria || !tagsContainer) return;

    // Limpa o select e as tags
    selectCategoria.innerHTML = '<option value="todas">Todas as Categorias</option>';
    tagsContainer.innerHTML = '';

    // 1. Cria a tag "✨ Todas" com evento de clique atrelado
    const tagTodas = document.createElement('span');
    tagTodas.className = 'tag-pill active';
    tagTodas.dataset.categoria = 'todas';
    tagTodas.textContent = '✨ Todas';
    tagTodas.addEventListener('click', () => {
        selectCategoria.value = 'todas';
        atualizarTagAtiva('todas');
        aplicarFiltros();
    });
    tagsContainer.appendChild(tagTodas);

    // 2. Cria as demais tags dinamicamente
    todasCategorias.forEach(cat => {
        // Opção do Select
        const opt = document.createElement('option');
        opt.value = cat.id_categoria;
        opt.textContent = cat.nome_categoria;
        selectCategoria.appendChild(opt);

        // Pill / Tag de Categoria
        const tag = document.createElement('span');
        tag.className = 'tag-pill';
        tag.dataset.categoria = cat.id_categoria;
        tag.textContent = cat.nome_categoria;
        tag.addEventListener('click', () => {
            selectCategoria.value = cat.id_categoria;
            atualizarTagAtiva(cat.id_categoria);
            aplicarFiltros();
        });
        tagsContainer.appendChild(tag);
    });
}

// 2. Carregar Produtos da Base de Dados
async function carregarProdutos() {
    try {
        const res = await fetch(API_PRODUTO);
        const data = await res.json();

        if (res.ok && data.produtos) {
            todosProdutos = data.produtos;
            aplicarFiltros();
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

// 3. Lógica de Filtragem (Busca por Texto + Filtro por Categoria)
function aplicarFiltros() {
    const textoBusca = inputBusca ? inputBusca.value.toLowerCase().trim() : '';
    const categoriaSelecionada = selectCategoria ? selectCategoria.value : 'todas';

    const produtosFiltrados = todosProdutos.filter(prod => {
        const bateNome = prod.nome_produto.toLowerCase().includes(textoBusca) ||
                         (prod.descricao_produto && prod.descricao_produto.toLowerCase().includes(textoBusca));
        
        const bateCategoria = (categoriaSelecionada === 'todas') || 
                              (String(prod.categoria_id) === String(categoriaSelecionada));

        return bateNome && bateCategoria;
    });

    renderizarGridProdutos(produtosFiltrados);
}

// 4. Renderizar Cards de Produtos no HTML
function renderizarGridProdutos(produtos) {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    if (totalProdutos) {
        totalProdutos.textContent = `${produtos.length} peça(s)`;
    }

    if (produtos.length === 0) {
        if (noResults) noResults.style.display = 'block';
        return;
    }

    if (noResults) noResults.style.display = 'none';

    produtos.forEach(prod => {
        // Busca o nome da categoria
        const cat = todasCategorias.find(c => c.id_categoria === prod.categoria_id);
        const nomeCategoria = cat ? cat.nome_categoria : 'Cerâmica';

        const precoFormatado = Number(prod.preco_produto || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-tag">${nomeCategoria}</div>
            <div class="product-icon">🏺</div>
            <h3>${prod.nome_produto}</h3>
            <p class="product-desc">${prod.descricao_produto || 'Peça feita artesanalmente.'}</p>
            <div class="product-footer">
                <span class="product-price">${precoFormatado}</span>
                <span class="product-stock">Estoque: ${prod.estoque_produto || 0}</span>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// 5. Funções Auxiliares
function atualizarTagAtiva(idCategoria) {
    const tags = document.querySelectorAll('.tag-pill');
    tags.forEach(tag => {
        if (String(tag.dataset.categoria) === String(idCategoria)) {
            tag.classList.add('active');
        } else {
            tag.classList.remove('active');
        }
    });
}

function limparFiltros() {
    if (inputBusca) inputBusca.value = '';
    if (selectCategoria) selectCategoria.value = 'todas';
    atualizarTagAtiva('todas');
    aplicarFiltros();
}