🖋️ Guia de Configuração de Fontes (Atlas & Layout)
Este guia define os parâmetros ideais para evitar o atropelamento de caracteres e garantir a qualidade visual conforme o tamanho da fonte.
📊 Tabela de Referência Rápida
| Faixa de Tamanho | Spacing (Layout) | Padding (Font) | Contorno (Outline) | Sombra (Shadow) |
|---|---|---|---|---|
| Pequena (< 34px) | Até 2 px | Até 2 px | 4 px a 6 px | Ativado (Padrão) |
| Média (> 34px) | 3 px a 4 px | Mín. 3 px | Conforme estilo | Ativado (Padrão) |
| Grande (> 100px) | 3 px a 4 px | Mín. 3 px | Conforme estilo | 14 px (Recomendado) |
🛠️ Detalhes das Configurações
🔹 Para fontes menores que 34 px
 * Ajuste Fino: Mantenha o Spacing e Padding baixos (até 2 px) para preservar a densidade do atlas sem perder legibilidade.
 * Definição: O contorno entre 4 px e 6 px ajuda a destacar a fonte em resoluções menores.
🔹 Para fontes maiores que 34 px
 * Espaçamento de Atlas: Aumente o Spacing para 3 px ou 4 px. Isso força uma distância segura entre as letras no arquivo de textura.
 * Prevenção de Cortes: O Padding deve ter no mínimo 3 px em todos os lados. Isso evita que o "corpo" de fontes Bold encoste na borda do glifo, eliminando a sensação de atropelamento.
🔹 Para fontes acima de 100 px
 * Efeito Visual: Para evitar que a sombra pareça desproporcional ao tamanho da letra, utilize valores acima de 10 px.
 * Preset Ideal: Recomenda-se o uso de 14 px para um sombreamento suave e profissional.
> [!TIP]
> Dica de Ouro: Se a fonte for extremamente negritada (Extra Bold), priorize aumentar o Padding antes do Spacing para garantir que as bordas do contorno não sejam cortadas.