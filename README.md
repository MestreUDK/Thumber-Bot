# 🤖 Thumber Bot (v1.2.)

Um bot robusto para Telegram focado em gerar capas (thumbnails) personalizadas para postagens de anime, de forma rápida e intuitiva. O bot busca dados reais de animes, permite edição completa através de um menu interativo e gera uma imagem de alta qualidade (1280x720) pronta para uso.

## ✨ Funcionalidades Principais

* **Busca na AniList:** Busca dados do anime (título, estúdio, gêneros, ano, etc.) usando a API GraphQL da AniList.
* **Múltiplos Modelos:** Oferece três layouts de capa distintos:
    * **TV:** Layout completo com fundo, pôster, info, título, estúdio, tags e classificação.
    * **ONA:** Layout similar ao de TV, mas com a informação "ONA" e o ano.
    * **FILME:** Layout minimalista focado no pôster e no título.
* **Menu de Edição Completo:** Um fluxo de edição baseado em sessão (`telegraf-session-local`) que permite ao usuário:
    * Editar **Título** e **Estúdio**.
    * Editar **Tags** (através de texto separado por vírgula).
    * Editar **Pôster** (via upload ou link URL).
    * Editar **Imagem de Fundo** (via upload ou link URL).
* **Seleção por Botões:** Permite escolher a **Classificação Indicativa** (L, A10, A12, A14, A16, A18) através de um menu de botões, evitando erros de digitação.
* **Geração de Imagem (Jimp):** Utiliza a biblioteca `Jimp` para desenhar a capa de forma dinâmica.
* **Design Inteligente:**
    * O **fundo** se ajusta (redimensiona/distorce) automaticamente para preencher o espaço restante ao lado do pôster.
    * Os **textos** (título, info) são alinhados à direita, encostados no pôster.
    * As **tags** fluem dinamicamente entre duas linhas, ocupando o espaço de forma otimizada.
    * O **Estúdio** se posiciona condicionalmente: se a 2ª linha de tags estiver vazia, ele desce para preencher o espaço.
* **Segurança:** O bot é protegido por um sistema de "whitelist", permitindo o uso apenas por IDs autorizados definidos no `.env`.

## 🚀 Como Usar

1.  **`/start`**
    Exibe a mensagem de boas-vindas do bot.

2.  **`/ajuda`**
    Mostra um guia rápido de como iniciar a geração de uma capa.

3.  **`/capa [Nome do Anime]`**
    Inicia o fluxo de geração.
    * **Exemplo:** `/capa Sword Art Online`
    * O bot buscará o anime.
    * Você escolherá o Layout (TV, Filme, ONA).
    * Você entrará no menu de edição para confirmar ou alterar os dados.
    * Clique em "Gerar Capa Agora!" para receber a imagem final.

## 📁 Estrutura do Projeto

* `/` (Raiz do projeto)
    * **assets/**: Arquivos estáticos
        * `classificacao/`: Imagens (A14.png, A16.png, ...)
        * `fonts/`: Fontes .fnt
        * `tags/`: Moldes das tags (tag_azul.png, ...)
    * **src/**: Código fonte principal
        * `drawing/`: Módulos de desenho (background.js, poster.js, text.js, bottomBar.js)
        * `models/`: Modelos de layout (tv.js, ona.js, filme.js)
        * `anilist.js`: Lógica de busca na API AniList
        * `confirmation.js`: Funções que enviam os menus de botões
        * `events.js`: Onde todos os 'bot.action' e 'bot.on' são registrados
        * `image.js`: Orquestrador principal do Jimp (chama os modelos)
        * `security.js`: Middleware 'checkPermission'
        * `utils.js`: Funções auxiliares (traduzirTemporada, getRatingImageName)
    * `.env.example`: Arquivo de exemplo para variáveis de ambiente
    * `bot.js`: Arquivo principal (Inicializa o Telegraf)
    * `package.json`: Dependências do Node.js
    * `query.graphql`: Query da API AniList
    * `tag_config.json`: Mapeamento de gêneros para cores de tags




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
    # Token do seu bot, obtido com o @BotFather no Telegram
    BOT_TOKEN=123456:ABC-DEF123456789

    # ID de Admin (seu ID do Telegram)
    ADMIN_ID=987654321

    # (Opcional) IDs extras que podem usar o bot, separados por vírgula
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

