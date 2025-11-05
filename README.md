# 🤖 Thumber Bot (v1.2)

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

