const SCENES = {
    us: {
        name: "US Dollar",
        currencySymbol: "$",
        denominations: [1, 5, 10, 25, 100],
        denominationLabels: ["1¢", "5¢", "10¢", "25¢", "$1"],
        colors: ["#c8863f", "#d0d5db", "#bcc8d4", "#ced4db", "#f4c74c"],
        type: "coin",
        isDecimal: true
    },
    br: {
        name: "Brazilian Real",
        currencySymbol: "R$",
        denominations: [5, 10, 25, 50, 100],
        denominationLabels: ["5¢", "10¢", "25¢", "50¢", "R$1"],
        colors: ["#c79a65", "#f8cf58", "#d6d9dd", "#e4c04d", "#f7d046"],
        type: "coin",
        isDecimal: true
    },
    stamps: {
        name: "US Post Office",
        currencySymbol: "¢",
        denominations: [1, 10, 21, 34, 70, 100, 350, 1225, 1500],
        denominationLabels: ["1¢", "10¢", "21¢", "34¢", "70¢", "100¢", "350¢", "1225¢", "1500¢"],
        colors: ["#f08e8e", "#95d7a2", "#8fc2ef", "#f8df85", "#cf9ce4", "#f6b089", "#b7a18d", "#9fb8cc", "#f493b0"],
        type: "stamp",
        isDecimal: false
    }
};

const STRINGS = {
    en: {
        gameName: "Cashier's Algorithm Game",
        instructionsTitle: "Instructions",
        instructions: "Serve each customer by selecting coins or stamps that match the exact amount due.\n\nIf you give the exact value with the fewest pieces, you get a great result.\nIf your value is correct but uses more pieces than necessary, you get a warning.\nIf the value is wrong, the game ends.",
        startSubtitle: "Click Play to start serving customers.",
        playButton: "Play",
        creditsTitle: "References",
        credits: "<p class=\"ref-heading\">Main reference</p><p><a href=\"https://www.cs.princeton.edu/~wayne/kleinberg-tardos/pdf/04GreedyAlgorithmsI.pdf\" target=\"_blank\" rel=\"noopener noreferrer\">Lecture Slides for Algorithm Design (Kleinberg &amp; Tardos)</a></p><p>Lecture slides accompanying the textbook <em>Algorithm Design</em> by Jon Kleinberg and Éva Tardos.</p><p class=\"ref-heading\">Other references</p><ol><li>Cai, Xuan. <em>Canonical coin systems for change-making problems.</em> 2009 Ninth International Conference on Hybrid Intelligent Systems. Vol. 1. IEEE, 2009.</li><li><a href=\"https://en.wikipedia.org/wiki/Change-making_problem\" target=\"_blank\" rel=\"noopener noreferrer\">Change-making problem (Wikipedia)</a>.</li></ol><p class=\"ref-heading\">See more algorithms</p><p><a href=\"https://github.com/BrunoGrisci/projeto-e-analise-de-algoritmos\" target=\"_blank\" rel=\"noopener noreferrer\">https://github.com/BrunoGrisci/projeto-e-analise-de-algoritmos</a></p>",
        feedbackGood: "Nice job! Optimal solution.",
        feedbackBadCount: "Correct amount, but not the minimum number of pieces.",
        feedbackWrongAmount: "Wrong amount.",
        feedbackNoSolution: "No solution for this amount.",
        gameOverTitle: "Game Over",
        gameOverMessage: "You gave the wrong amount of change.",
        youGave: "You gave",
        expected: "Expected",
        clearTray: "Clear Tray",
        giveChange: "Give Change",
        giveStamps: "Give Stamps",
        restartGame: "Restart Game",
        close: "Close",
        customer: "Customer",
        amount: "Amount",
        algorithm: "Algorithm",
        speedLabel: "Speed",
        run: "Run",
        autoRun: "Auto-Run",
        stop: "Stop",
        greedy: "Greedy (Cashier's)",
        dp: "Dynamic Programming",
        servedLabel: "Customers Served",
        mistakeLabel: "Mistakes",
        successLabel: "Success Rate",
        registerCash: "Cash Register",
        registerPost: "Post Office Counter",
        dropTrayLabel: "Drop-Out Tray",
        checkoutTrayLabel: "Checkout Slip Tray",
        sceneUs: "US Dollar Counter",
        sceneBr: "Brazilian Real Counter",
        sceneStamps: "US Post Office",
        sceneSubtitleCash: "Give exact change using the fewest pieces.",
        sceneSubtitleStamps: "Give exact postage using the fewest stamps.",
        footer: "Created for Algorithms Analysis I - UFRGS",
        creditsLink: "References",
        repoLink: "GitHub Repo",
        licenseLink: "License",
        placeholderLinkMsg: "Add your final project URL here."
    },
    pt: {
        gameName: "Cashier's Algorithm Game",
        instructionsTitle: "Instruções",
        instructions: "Atenda cada cliente selecionando moedas ou selos que somem exatamente o valor devido.\n\nSe o valor estiver correto com o menor número de peças, o resultado é ótimo.\nSe o valor estiver correto mas com peças a mais, você recebe um aviso.\nSe o valor estiver errado, o jogo termina.",
        startSubtitle: "Clique em Jogar para começar a atender clientes.",
        playButton: "Jogar",
        creditsTitle: "Referências",
        credits: "<p class=\"ref-heading\">Referência principal</p><p><a href=\"https://www.cs.princeton.edu/~wayne/kleinberg-tardos/pdf/04GreedyAlgorithmsI.pdf\" target=\"_blank\" rel=\"noopener noreferrer\">Lecture Slides for Algorithm Design (Kleinberg &amp; Tardos)</a></p><p>Slides que acompanham o livro <em>Algorithm Design</em>, de Jon Kleinberg e Éva Tardos.</p><p class=\"ref-heading\">Outras referências</p><ol><li>Cai, Xuan. <em>Canonical coin systems for change-making problems.</em> 2009 Ninth International Conference on Hybrid Intelligent Systems. Vol. 1. IEEE, 2009.</li><li><a href=\"https://en.wikipedia.org/wiki/Change-making_problem\" target=\"_blank\" rel=\"noopener noreferrer\">Change-making problem (Wikipedia)</a>.</li></ol><p class=\"ref-heading\">Veja mais algoritmos</p><p><a href=\"https://github.com/BrunoGrisci/projeto-e-analise-de-algoritmos\" target=\"_blank\" rel=\"noopener noreferrer\">https://github.com/BrunoGrisci/projeto-e-analise-de-algoritmos</a></p>",
        feedbackGood: "Bom trabalho! Solução ótima.",
        feedbackBadCount: "Valor correto, mas não com o menor número de peças.",
        feedbackWrongAmount: "Valor errado.",
        feedbackNoSolution: "Não há solução para esse valor.",
        gameOverTitle: "Fim de Jogo",
        gameOverMessage: "Você deu o valor de troco incorreto.",
        youGave: "Você deu",
        expected: "Esperado",
        clearTray: "Limpar Bandeja",
        giveChange: "Dar Troco",
        giveStamps: "Dar Selos",
        restartGame: "Reiniciar Jogo",
        close: "Fechar",
        customer: "Cliente",
        amount: "Valor",
        algorithm: "Algoritmo",
        speedLabel: "Velocidade",
        run: "Executar",
        autoRun: "Auto-Executar",
        stop: "Parar",
        greedy: "Ganancioso (Caixa)",
        dp: "Programação Dinâmica",
        servedLabel: "Clientes Atendidos",
        mistakeLabel: "Erros",
        successLabel: "Taxa de Sucesso",
        registerCash: "Caixa",
        registerPost: "Balcão dos Correios",
        dropTrayLabel: "Bandeja de Saída",
        checkoutTrayLabel: "Bandeja de Comprovantes",
        sceneUs: "Balcão do Dólar Americano",
        sceneBr: "Balcão do Real Brasileiro",
        sceneStamps: "Correios dos EUA",
        sceneSubtitleCash: "Dê o troco exato com o menor número de peças.",
        sceneSubtitleStamps: "Dê a postagem exata com o menor número de selos.",
        footer: "Criado para Análise de Algoritmos I - UFRGS",
        creditsLink: "Referências",
        repoLink: "Repositório GitHub",
        licenseLink: "Licença",
        placeholderLinkMsg: "Adicione aqui a URL final do seu projeto."
    }
};

let currentLang = 'en';

function getString(key) {
    return STRINGS[currentLang][key] || key;
}

function formatCurrency(amount, sceneKey) {
    const scene = SCENES[sceneKey];

    if (sceneKey === 'us') {
        if (amount >= 100) {
            return `$${(amount / 100).toFixed(2)}`;
        }

        return `${amount}¢`;
    }

    if (sceneKey === 'br') {
        return `R$ ${(amount / 100).toFixed(2).replace('.', ',')}`;
    }

    return `${amount}${scene.currencySymbol}`;
}
