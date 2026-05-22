# Documentação: Campo Minado (DevJoy Games)

## 1. Introdução

### Visão Geral do Jogo

O Campo Minado é uma versão digital clássica do jogo, onde o objetivo é revelar todas as células seguras de um tabuleiro sem ativar as minas. O jogador configura o tamanho do campo e o número de minas, e interage com o tabuleiro por cliques esquerdo (revelar) ou direito (colocar bandeiras).

### Objetivo do Jogador

O objetivo é revelar todas as células que não contêm minas. O jogador deve usar pistas numéricas (indicando minas adjacentes) para deduzir onde estão as minas, evitando explosões.

### Tecnologias Utilizadas

* **HTML**: Estrutura da interface, botões, inputs, e layout.
* **CSS**: Estilização, cores, temas, responsividade.
* **JavaScript**: Lógica do jogo, manipulação do DOM, controle do estado, eventos.

## 2. Requisitos

### Navegador Compatível

O jogo foi desenvolvido para rodar em navegadores modernos que suportam HTML5, CSS3 e JavaScript ES6+. Testado no Google Chrome, Firefox e Edge.

### Acesso à Internet

Não é obrigatório, mas caso queira usar bibliotecas externas ou frameworks adicionais, a conexão é necessária. Atualmente, o jogo roda apenas com recursos locais, sem dependências externas.

## 3. Arquitetura do Código

### Descrição do HTML

O arquivo HTML define a estrutura principal da interface. Possui um cabeçalho com o título, uma seção de controle onde o jogador define o número de linhas, colunas e minas, além de um botão para começar um novo jogo. O grid do jogo é gerado dinamicamente dentro de uma `<div>` com o ID `board`. Há também uma seção de status que mostra o tempo, minas restantes e mensagens de vitória ou derrota.

### Descrição do CSS

O CSS define o tema visual. Usamos variáveis para facilitar a personalização, com cores elegantes em fundo escuro. A interface é responsiva, usando um grid flexível. As células do tabuleiro têm bordas sutis, cores distintas para números, e efeitos interativos (hover, clique).

### Descrição do JavaScript

O JavaScript controla a lógica do jogo. Ao clicar no botão "Novo Jogo", o estado do jogo é inicializado com base nas configurações (linhas, colunas, minas). O tabuleiro é montado dinamicamente com botões, cada célula tem eventos de clique esquerdo (revelar) ou clique direito (bandeira). O jogo garante que a primeira célula clicada nunca seja uma mina, e calcula as adjacências. O timer acompanha o tempo desde o primeiro clique.

## 4. Funcionalidades

### Geração do Tabuleiro

O tabuleiro é gerado dinamicamente com base nas configurações (número de linhas, colunas e minas). As células são representadas por botões, organizados em um grid CSS.

### Colocação de Minas após o Primeiro Clique

As minas são posicionadas somente após o primeiro clique, garantindo que o jogador nunca perca no primeiro movimento. As minas são distribuídas aleatoriamente, evitando a célula clicada e, opcionalmente, seus vizinhos.

Claro! Continuando:

### Revelação de Células (Flood Fill)

Ao clicar em uma célula, se ela for segura (ou seja, não for uma mina) e não estiver aberta, ela é revelada. Se essa célula não tiver minas adjacentes, o algoritmo faz um "flood fill", abrindo as células vizinhas recursivamente, até encontrar células adjacentes com minas. Esse comportamento permite abrir grandes áreas de uma só vez.

### Alternância de Bandeiras no Clique Direito

Ao clicar com o botão direito, o jogador alterna uma bandeira na célula. Isso permite marcar suspeitas de minas. O jogo atualiza o número de bandeiras, diminuindo ou aumentando o contador de minas restantes, conforme o jogador marca ou desmarca.

### Detecção de Vitória e Derrota

O jogo verifica se o jogador venceu sempre que uma célula é revelada ou uma bandeira é colocada. A vitória ocorre quando todas as células seguras são abertas. Se o jogador clicar em uma mina, o jogo termina com derrota. Ao fim, o jogo revela todas as minas e desabilita as interações.

### Contador de Tempo

O tempo é registrado a partir do primeiro clique. O timer atualiza a cada 250 milissegundos, mostrando o tempo decorrido até o momento. O jogo para o timer ao final (vitória ou derrota).

## 5. Fluxo de Execução

1. Ao abrir o jogo, o jogador define o número de linhas, colunas e minas.
2. Ao clicar no botão "Novo Jogo", o tabuleiro é criado.
3. O jogador clica na célula inicial, e as minas são colocadas após o primeiro clique.
4. O jogador revela células, marca bandeiras, até completar o tabuleiro.
5. A cada clique, o jogo verifica se o jogador venceu ou perdeu e atualiza a interface.

## 6. Detalhamento das Funções

* **newGame()**: Inicializa o estado do jogo, cria a matriz de células com valores iniciais, e renderiza o tabuleiro.
* **createState(rows, cols, mines)**: Cria um objeto de estado que mantém o tabuleiro, contagem de células abertas, bandeiras, tempo, e se o jogo já começou.
* **renderBoard()**: Cria os botões de cada célula no grid e associa eventos de clique (esquerdo e direito).
* **onLeftClick(e)**: Revela a célula clicada, inicia o jogo no primeiro clique, e verifica vitória ou derrota.
* **onRightClick(e)**: Alterna bandeiras na célula.
* **placeMinesAvoiding(avoidR, avoidC)**: Coloca minas aleatórias, evitando a célula clicada no início.
* **computeAdjacencies()**: Calcula o número de minas adjacentes para cada célula.
* **reveal(r, c)**: Abre a célula e faz o flood fill se não houver minas adjacentes.
* **checkWin()**: Verifica se todas as células seguras foram abertas.
* **endGame(won)**: Finaliza o jogo, revelando minas se for derrota, ou mostrando mensagem de vitória.
* **startTimer()/stopTimer()**: Inicia e para o cronômetro.

## 7. Acessibilidade

O jogo usa atributos ARIA para melhorar a navegação. Cada célula possui labels e roles apropriados, permitindo interação com teclado e leitores de tela. Além disso, as mensagens de vitória e derrota são anunciadas de forma acessível.

## 8. Utilitários

* **shuffle(arr)**: Função auxiliar que embaralha um array usando o algoritmo de Fisher-Yates, garantindo a distribuição aleatória das minas.
* **clampInt(n, min, max)**: Restringe um valor inteiro entre um mínimo e um máximo, garantindo que valores fora do intervalo sejam ajustados. Isso é usado, por exemplo, na configuração do número de linhas, colunas ou minas, assegurando que o input do usuário permaneça dentro dos limites.

9. Como Rodar

Para executar o jogo localmente, basta abrir o arquivo HTML no navegador de sua preferência. Não há necessidade de conexão com a internet, a não ser que você deseje usar bibliotecas externas. Para customizar, basta alterar os valores de input (linhas, colunas, minas) e clicar em "Novo Jogo" para gerar um novo campo.

10. Referências
Documentação MDN Web Docs (HTML, CSS, JavaScript): https://developer.mozilla.org/
Algoritmo de Fisher-Yates (para embaralhamento): https://en.wikipedia.org/wiki/Fisher–Yates_shuffle
W3C ARIA Authoring Practices: https://www.w3.org/TR/wai-aria-practices/
