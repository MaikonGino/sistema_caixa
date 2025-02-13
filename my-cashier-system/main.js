// -----------------------------
// LOGIN (credenciais hard-coded)
// -----------------------------
const allowedUsers = {
    "admin01": "senha01",
    "admin02": "senha02"
};

function doLogin() {
    const usuario = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value.trim();
    console.log("Tentando login com:", usuario, senha);
    
    if (allowedUsers[usuario] && allowedUsers[usuario] === senha) {
        console.log("Login bem-sucedido!");
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        loadProducts();
        loadSales();
        loadFiados();
        checkCashRegisterStatus();
    } else {
        console.log("Login falhou");
        document.getElementById('loginMessage').innerText = "Erro no login: credenciais inválidas";
    }
}

document.getElementById('loginBtn').addEventListener('click', doLogin);

// Adiciona o evento de "Enter" para os inputs de login
document.getElementById('email').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        doLogin();
    }
});
document.getElementById('password').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        doLogin();
    }
});

// -----------------------------
// Navegação entre abas
// -----------------------------
function openTab(tabName, event) {
    const tabs = document.getElementsByClassName('tabcontent');
    const tablinks = document.getElementsByClassName('tablink');
    
    for (let tab of tabs) tab.style.display = 'none';
    for (let link of tablinks) link.classList.remove('active');
    
    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.classList.add('active');
}

// -----------------------------
// Gerenciamento de Produtos (via API)
// -----------------------------
function loadProducts() {
    fetch("/api/products", { method: "GET" })
        .then(res => res.json())
        .then(products => {
            const productList = document.getElementById('lista-produtos');
            const saleProductsList = document.getElementById('produtos-lista');
            productList.innerHTML = "";
            saleProductsList.innerHTML = "";

            products.forEach(prod => {
                // Área de Gerenciamento de Produtos (exibe também a foto, se houver)
                const div = document.createElement('div');
                div.className = "product-item";
                div.innerHTML = `
                  ${prod.foto ? `<img src="${prod.foto}" alt="${prod.nome}">` : ''}
                  <strong>${prod.nome}</strong><br>
                  R$${prod.preco.toFixed(2)}<br>
                  <button onclick="editProduct('${prod.id}', '${prod.nome}', ${prod.preco}, '${prod.foto || ''}')">Editar</button>
                  <button onclick="deleteProduct('${prod.id}')">Remover</button>
                `;
                productList.appendChild(div);

                // Área do Caixa (botão para selecionar produto)
                const btn = document.createElement('button');
                btn.innerHTML = `
                  ${prod.foto ? `<img src="${prod.foto}" alt="${prod.nome}" style="max-height:50px; display:block; margin:0 auto 5px;">` : ''}
                  ${prod.nome} - R$${prod.preco.toFixed(2)}
                `;
                btn.onclick = () => addItemToSale(prod);
                saleProductsList.appendChild(btn);
            });
        });
}

document.getElementById('adicionar-produto').addEventListener('click', function() {
    const nome = document.getElementById('produto-nome').value.trim();
    const preco = parseFloat(document.getElementById('produto-preco').value);
    const fileInput = document.getElementById('produto-foto');
    if (!nome || isNaN(preco)) {
        alert("Preencha o nome e preço corretamente.");
        return;
    }
    // Se houver arquivo selecionado, converte para base64
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const fotoData = e.target.result; // data URL
            submitNewProduct(nome, preco, fotoData);
        };
        reader.readAsDataURL(file);
    } else {
        // Sem foto
        submitNewProduct(nome, preco, null);
    }
});

function submitNewProduct(nome, preco, foto) {
    fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, preco, foto })
    })
    .then(res => res.json())
    .then(product => {
        loadProducts();
        document.getElementById('produto-nome').value = "";
        document.getElementById('produto-preco').value = "";
        document.getElementById('produto-foto').value = "";
    });
}

function editProduct(id, nomeAtual, precoAtual, fotoAtual) {
    const novoNome = prompt("Novo nome:", nomeAtual);
    const novoPreco = prompt("Novo preço:", precoAtual);
    // Neste exemplo, mantemos a foto atual
    if (novoNome && novoPreco) {
        fetch("/api/products?id=" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome: novoNome, preco: parseFloat(novoPreco), foto: fotoAtual })
        })
        .then(res => res.json())
        .then(() => loadProducts());
    }
}

function deleteProduct(id) {
    if (confirm("Tem certeza que deseja remover este produto?")) {
        fetch("/api/products?id=" + id, { method: "DELETE" })
            .then(res => res.json())
            .then(() => loadProducts());
    }
}

// -----------------------------
// Fluxo de Caixa (Venda)
// -----------------------------
let currentSale = {
    itens: [] // Cada item: { nome, preco, quantidade }
};

function addItemToSale(prod) {
    let item = currentSale.itens.find(i => i.nome === prod.nome);
    if (item) {
        item.quantidade++;
    } else {
        currentSale.itens.push({ ...prod, quantidade: 1 });
    }
    updateSaleDisplay();
}

function updateSaleDisplay() {
    const saleList = document.getElementById('produtos-lista');
    saleList.innerHTML = '<h3>Itens da Venda</h3>';
    
    currentSale.itens.forEach(item => {
        const div = document.createElement('div');
        div.className = 'sale-item';
        div.innerHTML = `
            <span>${item.nome} x${item.quantidade}</span>
            <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
        `;
        saleList.appendChild(div);
    });
    
    const total = currentSale.itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const totalDiv = document.createElement('div');
    totalDiv.className = 'sale-total';
    totalDiv.innerHTML = `<strong>Total:</strong> R$ ${total.toFixed(2)}`;
    saleList.appendChild(totalDiv);
}

// Mostrar/ocultar campo para fiado
document.getElementById('forma-pagamento').addEventListener('change', function() {
    const metodo = this.value;
    document.getElementById('fiado-container').style.display = (metodo === 'fiado') ? 'block' : 'none';
});

// Finalizar venda
document.getElementById('finalizarVenda').addEventListener('click', function() {
    const paymentMethod = document.getElementById('forma-pagamento').value;
    let nomeFiado = "";
    if (paymentMethod === "fiado") {
        nomeFiado = document.getElementById('nome-fiado').value.trim();
        if (!nomeFiado) {
            alert("Informe o nome para fiado!");
            return;
        }
    }
    const saleData = {
        itens: currentSale.itens,
        metodo: paymentMethod,
        nomeFiado: (paymentMethod === "fiado") ? nomeFiado : null
    };

    fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData)
    })
    .then(res => res.json())
    .then(response => {
        if (response.error) {
            alert("Erro: " + response.error);
        } else {
            alert("Venda registrada com sucesso!");
            printTickets(currentSale.itens);
            currentSale = { itens: [] };
            loadSales();
            loadFiados();
        }
    });
});

// -----------------------------
// Listagem de Vendas
// -----------------------------
function loadSales() {
    fetch("/api/sales", { method: "GET" })
        .then(res => res.json())
        .then(sales => {
            const salesList = document.getElementById('lista-vendas');
            salesList.innerHTML = "";
            sales.forEach(sale => {
                const total = sale.itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
                const div = document.createElement('div');
                div.innerText = `Venda #${sale.id} - R$${total.toFixed(2)} - ${sale.metodo.toUpperCase()}`;
                salesList.appendChild(div);
            });
        });
}

// -----------------------------
// Fechamento de Fiados
// -----------------------------
function loadFiados() {
    fetch("/api/fiados", { method: "GET" })
        .then(res => res.json())
        .then(fiados => {
            const fiadosList = document.getElementById('lista-fiados');
            fiadosList.innerHTML = "";
            for (const nome in fiados) {
                const div = document.createElement('div');
                div.innerText = `${nome}: R$${fiados[nome].toFixed(2)}`;
                fiadosList.appendChild(div);
            }
        });
}

// -----------------------------
// Integração com QZ Tray para Impressão
// -----------------------------
function printTickets(itens) {
    qz.websocket.connect().then(() => {
        itens.forEach(item => {
            for (let i = 0; i < item.quantidade; i++) {
                const config = qz.configs.create("Nome_da_Sua_Impressora"); // Substitua pelo nome configurado no QZ Tray
                const htmlData = [
                    `<div style="font-size:12px; text-align:center; padding:5px;">
                        <p>${item.nome}</p>
                    </div>`
                ];
                qz.print(config, htmlData).catch(err => console.error(err));
            }
        });
    }).catch(err => console.error("Erro ao conectar ao QZ Tray:", err));
}

// -----------------------------
// Controle do Caixa (Abrir/Fechar)
// -----------------------------
function checkCashRegisterStatus() {
    fetch("/api/cashRegister", { method: "GET" })
        .then(res => res.json())
        .then(status => {
            const statusElem = document.getElementById('cash-register-status');
            const openControls = document.getElementById('open-controls');
            const closeControls = document.getElementById('close-controls');
            if (status && status.status === "open") {
                statusElem.innerText = "Caixa aberto desde: " + new Date(status.openedAt).toLocaleString();
                openControls.style.display = "none";
                closeControls.style.display = "block";
            } else {
                statusElem.innerText = "Caixa está fechado.";
                openControls.style.display = "block";
                closeControls.style.display = "none";
            }
        })
        .catch(err => {
            console.error("Erro ao verificar o status do caixa:", err);
        });
}

function openCashRegister() {
    const initialAmount = parseFloat(document.getElementById('initial-amount').value) || 0;
    fetch("/api/cashRegister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initialAmount })
    })
    .then(res => res.json())
    .then(data => {
        alert("Caixa aberto com sucesso!");
        checkCashRegisterStatus();
    })
    .catch(err => console.error("Erro ao abrir o caixa:", err));
}

function closeCashRegister() {
    const salesTotal = parseFloat(document.getElementById('sales-total').value) || 0;
    fetch("/api/cashRegister", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salesTotal })
    })
    .then(res => res.json())
    .then(data => {
        alert("Caixa fechado com sucesso!");
        checkCashRegisterStatus();
    })
    .catch(err => console.error("Erro ao fechar o caixa:", err));
}

// Eventos para os botões de abrir/fechar caixa
document.getElementById('open-cash-btn').addEventListener('click', openCashRegister);
document.getElementById('close-cash-btn').addEventListener('click', closeCashRegister);
