// index.js

const STORAGE_KEY = 'appconsulta_abastecimentos';
    
// Dados iniciais de fallback (usados se o localStorage estiver vazio ou a chave nunca foi criada)
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

function loadAbastecimentosForSearch() {
    const stored = localStorage.getItem(STORAGE_KEY);
    try {
        // Tenta carregar do localStorage, se falhar, usa os dados iniciais
        return stored ? JSON.parse(stored) : INITIAL_ABASTECIMENTOS;
    } catch (e) {
        console.error("Erro ao carregar dados do localStorage para pesquisa:", e);
        return INITIAL_ABASTECIMENTOS;
    }
}

const ALL_ABASTECIMENTOS = loadAbastecimentosForSearch();

// Elementos do DOM (usados no index.html)
const inputCode = document.getElementById('abastecimento-code');
const searchButton = document.getElementById('search-button');
const imageContainer = document.getElementById('image-container');
const productNameDisplay = document.getElementById('product-name');
const additionalInfoDisplay = document.getElementById('additional-info');

// Função principal de pesquisa
function handleSearch() {
    const code = inputCode.value.trim();

    // Limpa a área de resultados
    imageContainer.innerHTML = '';
    productNameDisplay.textContent = '';
    additionalInfoDisplay.innerHTML = '';
    
    if (!code) {
        imageContainer.innerHTML = '<p id="image-message" class="text-red-500 dark:text-red-400">Por favor, digite um código.</p>';
        return;
    }

    // Procura o item no array de abastecimentos (que contém os dados do localStorage)
    const foundItem = ALL_ABASTECIMENTOS.find(item => item.codigo === code);
    
    if (foundItem) {
        const imageFileName = foundItem.codigoImagem;
        const imagePath = `imagens/${imageFileName}`; // Usa a pasta 'imagens/'
        
        // Exibe o nome do produto
        productNameDisplay.textContent = foundItem.nome;

        // EXIBE AS NOVAS INFORMAÇÕES
        additionalInfoDisplay.innerHTML = `
            <p><strong>Lastro:</strong> ${foundItem.lastro}</p>
            <p><strong>Camada:</strong> ${foundItem.camada}</p>
            <p><strong>Tipo de Abastecimento:</strong> ${foundItem.tipo}</p>
        `;

        // Tenta carregar a imagem
        const imageElement = document.createElement('div');
        imageElement.className = 'h-full w-full bg-cover bg-center bg-no-repeat rounded-xl';
        imageElement.style.backgroundImage = `url('${imagePath}')`;
        
        // Simulação de verificação de imagem para mostrar erro 404
        const tempImg = new Image();
        tempImg.onerror = () => {
            imageContainer.innerHTML = `<p id="image-message" class="text-red-500 dark:text-red-400">Imagem (Arquivo: ${imageFileName}) não encontrada em /imagens/.</p>`;
        };
        tempImg.onload = () => {
            imageContainer.appendChild(imageElement);
        };
        tempImg.src = imagePath;

    } else {
        // Se o Código do Abastecimento não foi encontrado
        imageContainer.innerHTML = `<p id="image-message" class="text-red-500 dark:text-red-400">Código de Abastecimento "${code}" não encontrado.</p>`;
    }
}

// Adiciona o event listener ao botão
searchButton.addEventListener('click', handleSearch);