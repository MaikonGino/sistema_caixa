# Sistema de Caixa para Festas Escolares.
Sistema web para gerenciar vendas e produtos em festas escolares. Possui login de administradores, cadastro de produtos com fotos, registro de vendas, fechamento de caixa e geração de relatórios PDF/Excel. Hospedado no Cloudflare Pages com Workers KV para armazenamento persistente.

## Recursos
- **Login simples:** Acesso para administradores.
- **Cadastro de Produtos:** Nome, preço (R$) e upload de foto (convertida para Base64).
- **Registro de Vendas:** Seleção de produtos, métodos de pagamento e registro de vendas.
- **Fechamento de Caixa:** Controle do valor inicial e fechamento com total de vendas.
- **Relatórios:** Geração de relatórios em PDF e Excel.
- **Impressão:** Integração com QZ Tray para imprimir fichas de venda.

## Tecnologias
- **Front-end:** HTML, CSS e JavaScript (vanilla)
- **Hospedagem:** Cloudflare Pages
- **Armazenamento:** Cloudflare Workers KV (bindings: `PRODUCTS_KV` e `SALES_KV`)
- **Impressão:** QZ Tray
- **Relatórios:** jsPDF e SheetJS


## Configuração e Deploy

1. **Prepare o Projeto:**
   - Organize o código conforme a estrutura acima.

2. **Crie um Repositório:**
   - Hospede o código em um repositório no GitHub, GitLab ou Bitbucket.

3. **Configurar no Cloudflare Pages:**
   - Acesse [Cloudflare Pages](https://pages.cloudflare.com/) e crie um novo projeto apontando para seu repositório.
   - Em "Build Settings", como o projeto é estático, não é necessário comando de build (pode usar `echo "No build step"`).

4. **Configurar Bindings do Workers KV:**
   - No Cloudflare Dashboard, vá em **Workers & Pages** > **KV** e crie dois namespaces:
     - **Products KV:** copie o Namespace ID.
     - **Sales KV:** copie o Namespace ID.
   - No painel de configurações do seu projeto no Cloudflare Pages, adicione os bindings:
     - Nome: `PRODUCTS_KV` → Cole o ID do Products KV.
     - Nome: `SALES_KV` → Cole o ID do Sales KV.
   - Salve as configurações e, se necessário, redeploy o projeto.

5. **Deploy:**
   - Após configurar, o Cloudflare Pages fará o deploy e fornecerá uma URL (ex.: `https://meu-sistema-caixa.pages.dev`).

## Uso

- **Login:** Acesse a URL do projeto e faça login.
- 
- **Gerenciamento:** Utilize as abas para:
  - Abrir/fechar o caixa.
  - Adicionar e gerenciar produtos (com upload de foto).
  - Registrar vendas e visualizar relatórios.
- **Impressão:** Após uma venda, o sistema dispara a impressão das fichas via QZ Tray.

## Licença
Este projeto é licenciado sob a MG Produções.

## Contato
Para dúvidas ou sugestões, entre em contato com o proprietário do repositório.

