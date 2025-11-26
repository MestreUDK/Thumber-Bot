# 🤖 Thumber Bot (v1.3.5)

Um bot robusto para Telegram focado em gerar capas (thumbnails) personalizadas para postagens de anime, de forma rápida e intuitiva. O bot busca dados reais de animes, permite edição completa (incluindo modo manual) e gera uma imagem de alta qualidade (1280x720) pronta para uso.

## ✨ Funcionalidades Principais

* **Busca na AniList:** Busca dados do anime (título, estúdio, gêneros, ano, etc.) usando a API GraphQL da AniList.
* **✍️ Modo Manual:** Permite criar capas do zero para obras que não estão na AniList ou para conteúdos personalizados.
* **🔐 Sistema de Passcode (Save/Load):** Funcionalidade exclusiva que gera um código único ao final da criação. Esse código serve como um "Save State", permitindo restaurar todos os dados da capa futuramente para correções rápidas, sem precisar refazer todo o processo.
* **Múltiplos Modelos:** Oferece três layouts de capa distintos:
    * **TV:** Layout completo com fundo, pôster, info, título, estúdio, tags e classificação.
    * **ONA:** Layout similar ao de TV, mas ajustado para o formato ONA (exibindo o ano específico).
    * **FILME:** Layout minimalista focado no pôster e no título.
* **Menu de Edição Completo:** Um fluxo de edição baseado em sessão (`telegraf-session-local`) que permite ao usuário:
    * Editar **Título**, **Info** (Texto superior) e **Estúdio**.
    * Editar **Tags** (através de texto separado por vírgula).
    * Editar **Pôster** e **Imagem de Fundo** (via upload ou link URL).
* **Seleção por Botões:** Permite escolher a **Classificação Indicativa** (L, A10, A12, A14, A16, A18) através de um menu de botões, evitando erros de digitação.
* **Design Inteligente:**
    * O **fundo** se ajusta (redimensiona/distorce) automaticamente para preencher o espaço restante.
    * Os **textos** (título, info) são alinhados à direita, encostados no pôster.
    * As **tags** fluem dinamicamente entre duas linhas com bordas arredondadas.
    * O **Estúdio** se posiciona condicionalmente para otimizar o espaço.
* **Segurança:** O bot é protegido por um sistema de "whitelist", permitindo o uso apenas por IDs autorizados definidos no `.env`.

## 🚀 Como Usar

1.  **`/start`**
    Exibe a mensagem de boas-vindas do bot.

2.  **`/ajuda`**
    Mostra um guia rápido e a versão atual do bot.

3.  **`/capa [Nome do Anime]`**
    Inicia o fluxo de geração.
    * **Exemplo:** `/capa To Your Eternity`
    
    O bot abrirá um menu perguntando a **Fonte dos Dados**:
    
    * **🔗 AniList:** Busca as informações automaticamente na API.
    * **✍️ Manual:** Abre o editor com os campos vazios para preenchimento manual.
    * **🔐 Passcode:** Pede o código de uma capa anterior para restaurar os dados e editar imediatamente.

    **Após selecionar a fonte:**
    1.  Escolha o Layout (TV, Filme, ONA).
    2.  Use o menu de botões para editar qualquer informação.
    3.  Clique em **"Gerar Capa Agora!"**.
    4.  O bot enviará a **Imagem** pronta e o **Passcode** para edições futuras.

## 📁 Estrutura do Projeto

* `/` (Raiz do projeto)
    * **assets/**: Arquivos estáticos (imagens, fontes, moldes de tags).
    * **src/**: Código fonte principal.
        * `drawing/`: Módulos de desenho (`background.js`, `poster.js`, `text.js`, `bottomBar.js`, `tags.js`).
        * `models/`: Modelos de layout (`tv.js`, `ona.js`, `filme.js`).
        * `anilist.js`: Lógica de busca na API AniList.
        * `confirmation.js`: Menus de botões (Layout, Edição, Fonte de Dados).
        * `events.js`: Gerenciamento de eventos, lógica de Passcode e fluxo de edição.
        * `image.js`: Carregamento de fontes e orquestração do Jimp.
        * `security.js`: Middleware de permissão (Whitelist).
        * `utils.js`: Funções auxiliares (Passcode, tradução, classificação).
    * `.env.example`: Exemplo de variáveis de ambiente.
    * `bot.js`: Arquivo principal.
    * `package.json`: Dependências e versão.
    * `query.graphql`: Query da API AniList.
    * `tag_config.json`: Configuração de cores das tags.

## 🛠️ Instalação e Setup

1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd [NOME_DO_PROJETO]
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Crie seu arquivo `.env`:**
    Copie o `.env.example` para um novo arquivo chamado `.env` e preencha as variáveis:

    ```ini
    # Token do seu bot (BotFather)
    BOT_TOKEN=123456:ABC-DEF123456789

    # ID de Admin
    ADMIN_ID=987654321

    # IDs permitidos (separados por vírgula)
    WHITELIST=111111,222222
    ```

4.  **Inicie o bot:**
    ```bash
    npm start
    ```

## 📦 Principais Dependências

* **Telegraf:** Framework principal para o bot do Telegram.
* **Telegraf Session Local:** Gerenciamento de sessão local para o fluxo de edição.
* **Jimp:** Biblioteca de processamento de imagem para gerar as capas.
* **Axios:** Cliente HTTP para fazer as requisições à API AniList.
* **Dotenv:** Para carregar as variáveis de ambiente.
