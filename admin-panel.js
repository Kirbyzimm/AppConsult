// admin-panel.js

const STORAGE_KEY = 'appconsulta_abastecimentos';

// Dados iniciais de fallback (usados se o localStorage estiver vazio)
const INITIAL_ABASTECIMENTOS = [
  {
    "id": 1,
    "nome": "Eternity Maça Verde",
    "codigo": "17898422679399",
    "codigoImagem": "13.1.png",
    "lastro": "13",
    "camada": "3",
    "tipo": "Batido"
  },
  {
    "id": 2,
    "nome": "Eternity Maça Verde",
    "codigo": "7898422679392",
    "codigoImagem": "13.1.png",
    "lastro": "13",
    "camada": "3",
    "tipo": "Batido"
  },
  {
    "id": 3,
    "nome": "Poste de Gasolina #2",
    "codigo": "11223",
    "codigoImagem": "generico_gas.png",
    "lastro": "50%",
    "camada": "B",
    "tipo": "Etanol"
  }
];

// --- FUNÇÕES DE ARMAZENAMENTO ---

function loadAbastecimentos() {
    const stored = localStorage.getItem(STORAGE_KEY);
    try {
        return stored ? JSON.parse(stored) : INITIAL_ABASTECIMENTOS;
    } catch (e) {
        console.error("Erro ao carregar dados do localStorage:", e);
        return INITIAL_ABASTECIMENTOS;
    }
}

function saveAbastecimentos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(abastecimentos));
}

let abastecimentos = loadAbastecimentos();
let nextId = abastecimentos.length > 0 ? Math.max(...abastecimentos.map(a => a.id)) + 1 : 1;

// Elementos do DOM (definidos no admin-panel.html)
const listContainer = document.getElementById('abastecimento-list');
const exportDataArea = document.getElementById('export-data-area');
const exportModal = document.getElementById('export-modal');
const importModal = document.getElementById('import-modal');
const importDataArea = document.getElementById('import-data-area');
const addButton = document.getElementById('add-new-button');
const editModal = document.getElementById('edit-modal');
const addModal = document.getElementById('add-modal');

// --- FUNÇÕES DE RENDERIZAÇÃO ---

function renderAbastecimentoItem(abastecimento) {
    const finalImagePath = `imagens/${abastecimento.codigoImagem}`; 

    const itemHtml = `
        <div id="item-${abastecimento.id}" class="flex items-center gap-4 bg-background-light dark:bg-gray-800/50 p-3 rounded-lg shadow-sm">
            <img alt="${abastecimento.nome}" class="w-16 h-16 rounded-lg object-cover" src="${finalImagePath}"/>
            <div class="flex-1">
                <p class="font-semibold text-gray-900 dark:text-white item-name">${abastecimento.nome}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Código: 
                    <span class="font-medium text-gray-700 dark:text-gray-300 item-code">${abastecimento.codigo}</span>
                </p>
            </div>
            <div class="flex gap-2">
                <button class="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary" 
                        data-id="${abastecimento.id}" onclick="handleEdit(${abastecimento.id})">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500"
                        data-id="${abastecimento.id}" onclick="handleDelete(${abastecimento.id})">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    `;
    listContainer.insertAdjacentHTML('beforeend', itemHtml);
}

function renderList() {
    listContainer.innerHTML = '';
    abastecimentos.forEach(renderAbastecimentoItem);
}

// --- FUNÇÕES DE EXPORTAÇÃO (Sincronização Manual) ---

function getFormattedExportData() {
    return JSON.stringify(abastecimentos, null, 2); 
}

window.openExportModal = () => {
    exportDataArea.value = getFormattedExportData();
    exportModal.classList.remove('hidden');
};

window.copyToClipboard = () => {
    exportDataArea.select();
    document.execCommand('copy');
    alert("Dados copiados! Cole o conteúdo na variável no seu VS Code.");
};

// --- FUNÇÕES DE IMPORTAÇÃO EM MASSA (CSV/Texto) ---

window.openImportModal = () => {
    importDataArea.value = ''; // Limpa a área antes de abrir
    importModal.classList.remove('hidden');
};

window.closeImportModal = () => {
    importModal.classList.add('hidden');
};

window.handleImportData = () => {
    const rawData = importDataArea.value.trim();
    if (!rawData) {
        alert("A área de texto está vazia. Cole os dados da planilha.");
        return;
    }

    const lines = rawData.split('\n');
    let importedCount = 0;
    const totalItems = lines.length;

    lines.forEach((line) => {
        // Tenta dividir por tab (padrão Excel) ou por vírgula (padrão CSV)
        const columns = line.split(/\t|,/); 

        // Esperamos 6 colunas
        if (columns.length >= 6) {
            const [nome, codigo, codigoImagem, lastro, camada, tipo] = columns.map(col => col.trim());

            if (nome && codigo && codigoImagem) {
                const novoAbastecimento = {
                    id: nextId++,
                    nome: nome,
                    codigo: codigo,
                    codigoImagem: codigoImagem,
                    lastro: lastro,
                    camada: camada,
                    tipo: tipo
                };

                abastecimentos.push(novoAbastecimento);
                importedCount++;
            }
        }
    });

    if (importedCount > 0) {
        saveAbastecimentos(); 
        renderList(); 
        alert(`Sucesso! ${importedCount} de ${totalItems} itens foram importados.`);
        closeImportModal();
    } else {
        alert("Nenhum item foi importado. Verifique se as colunas estão na ordem correta (Nome, Código, Imagem, Lastro, Camada, Tipo).");
    }
};


// --- FUNÇÕES DE EDIÇÃO (CRUD - Update) ---

window.handleEdit = (id) => {
    const item = abastecimentos.find(a => a.id === id);
    if (!item) { alert("Item não encontrado!"); return; }

    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('edit-nome').value = item.nome;
    document.getElementById('edit-codigo').value = item.codigo;
    document.getElementById('edit-codigo-imagem').value = item.codigoImagem;
    
    document.getElementById('edit-lastro').value = item.lastro;
    document.getElementById('edit-camada').value = item.camada;
    document.getElementById('edit-tipo').value = item.tipo;
    
    editModal.classList.remove('hidden');
};

window.closeModal = () => {
    editModal.classList.add('hidden');
};

window.handleSaveEdit = () => {
    const id = parseInt(document.getElementById('edit-item-id').value);
    const novoNome = document.getElementById('edit-nome').value.trim();
    const novoCodigo = document.getElementById('edit-codigo').value.trim();
    const novoCodigoImagem = document.getElementById('edit-codigo-imagem').value.trim();
    const novoLastro = document.getElementById('edit-lastro').value.trim();
    const novaCamada = document.getElementById('edit-camada').value.trim();
    const novoTipo = document.getElementById('edit-tipo').value.trim();
    
    if (!novoNome || !novoCodigo || !novoCodigoImagem || !novoLastro || !novaCamada || !novoTipo) { alert("Todos os campos são obrigatórios!"); return; }

    const item = abastecimentos.find(a => a.id === id);
    if (item) {
        item.nome = novoNome;
        item.codigo = novoCodigo;
        item.codigoImagem = novoCodigoImagem;
        item.lastro = novoLastro;
        item.camada = novaCamada;
        item.tipo = novoTipo;
        
        saveAbastecimentos(); 
        renderList();         
    }

    closeModal();
};


// --- FUNÇÕES DE ADIÇÃO (CRUD - Create) ---

window.handleAddNew = () => {
    const novoNome = document.getElementById('add-nome').value.trim();
    const novoCodigo = document.getElementById('add-codigo').value.trim();
    const novoCodigoImagem = document.getElementById('add-codigo-imagem').value.trim();
    const novoLastro = document.getElementById('add-lastro').value.trim();
    const novaCamada = document.getElementById('add-camada').value.trim();
    const novoTipo = document.getElementById('add-tipo').value.trim();

    if (!novoNome || !novoCodigo || !novoCodigoImagem || !novoLastro || !novaCamada || !novoTipo) { 
        alert("Todos os campos são obrigatórios!"); 
        return; 
    }
    
    const novoAbastecimento = {
        id: nextId++,
        nome: novoNome,
        codigo: novoCodigo,
        codigoImagem: novoCodigoImagem,
        lastro: novoLastro,
        camada: novaCamada,
        tipo: novoTipo
    };

    abastecimentos.push(novoAbastecimento);
    saveAbastecimentos(); 
    renderAbastecimentoItem(novoAbastecimento);
    
    closeAddModal();
};

window.closeAddModal = () => {
    addModal.classList.add('hidden');
};
    
// --- FUNÇÃO DE DELEÇÃO (CRUD - Delete) ---

window.handleDelete = (id) => {
    if (confirm(`Tem certeza que deseja excluir o item com ID ${id}?`)) {
        abastecimentos = abastecimentos.filter(a => a.id !== id);
        saveAbastecimentos(); 
        const element = document.getElementById(`item-${id}`);
        if (element) {
            element.remove();
        }
    }
};

// Inicializa a lista ao carregar a página
window.onload = renderList;