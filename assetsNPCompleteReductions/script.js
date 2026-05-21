const TAB_IDS = ["overview", "sat3", "clique", "independentset", "subsetsum", "vertexcover", "hampath", "about"];
const THEME_KEY = "np-reductions-theme";
const LANGUAGE_KEY = "np-reductions-language";

const TEXT = {
  en: {
    htmlLang: "en",
    pageTitle: "NP-Complete Reductions",
    metaDescription: "Interactive visualizations of classical polynomial-time reductions used in NP-completeness proofs.",
    eyebrow: "NP-Completeness",
    heading: "Classical Polynomial Reductions Visualizer",
    subtitle: "Step-by-step constructions from SAT and 3SAT to graph and arithmetic problems.",
    themeToDark: "Switch to dark mode",
    themeToLight: "Switch to light mode",
    languageButton: "PT",
    languageTitle: "Switch to Brazilian Portuguese",
    tabs: {
      overview: "Overview",
      sat3: "SAT ≤P 3SAT",
      clique: "3SAT ≤P CLIQUE",
      independentset: "3SAT ≤P INDEPENDENT-SET",
      subsetsum: "3SAT ≤P SUBSET-SUM",
      vertexcover: "3SAT ≤P VERTEX-COVER",
      hampath: "3SAT ≤P HAMPATH",
      about: "About / References"
    },
    common: {
      sourceProblem: "Source problem",
      targetProblem: "Target problem",
      input: "Input",
      preset: "Preset",
      formula: "Formula",
      useInput: "Use input",
      dragGraphNodes: "Drag nodes to reorganize the drawing; edges stay attached.",
      start: "Start",
      cancel: "Cancel",
      added: "Added",
      constructionIdle: "Start construction mode to rebuild the target instance one piece at a time.",
      constructionEmpty: "Construction mode is active. The target instance is empty; click Next to add the first piece.",
      constructionComplete: "The constructed target instance is complete.",
      emptyConstruction: "No target elements have been added yet.",
      previous: "Previous",
      next: "Next",
      step: "Step",
      construction: "Step-by-step construction",
      sourceInstance: "Source instance",
      targetInstance: "Target instance",
      solutionChecker: "Solution checker",
      compare: "Source and target solutions",
      proof: "Correctness proof",
      mistakes: "Common mistakes / intuition",
      forward: "Forward direction",
      reverse: "Reverse direction",
      polynomial: "Polynomial time",
      satisfiable: "satisfiable",
      unsatisfiable: "unsatisfiable",
      yesInstance: "YES instance",
      noInstance: "NO instance",
      notChecked: "not checked for this size",
      assignment: "Assignment",
      targetSolution: "Target solution",
      sourceAnswer: "Source formula",
      targetAnswer: "Constructed target",
      showSolution: "Show one solution",
      resetSelection: "Reset selection",
      selected: "Selected",
      valid: "valid",
      invalid: "invalid",
      variables: "variables",
      vertices: "vertices",
      clauses: "clauses",
      entry: "in",
      exit: "out",
      target: "Target",
      noSolution: "No solution exists for this preset/input.",
      bruteForceNote: "The truth search shown here is only a classroom checker; it is not part of the polynomial-time reduction.",
      parseError: "Parse error",
      requires3cnf: "This reduction requires every clause to have exactly three literal occurrences.",
      emptyClause: "Empty clauses are not supported by the classroom parser.",
      emptyFormula: "The formula is empty.",
      unbalancedParens: "Unbalanced parentheses.",
      invalidLiteral: (literal) => `Invalid literal "${literal}".`,
      invalidClauseSize: (clause, size) => `Clause ${clause} has ${size} literal occurrences.`,
      tooManyVariables: "The formula has too many variables for the built-in brute-force checker.",
      true: "true",
      false: "false",
      free: "free",
      none: "none"
    },
    overview: {
      title: "How NP-completeness reductions are used",
      intro: "A reduction is a translation of instances. To prove a new problem is NP-hard, we translate a known hard problem into it and prove that the YES/NO answer is preserved.",
      steps: [
        "Show that the target problem is in NP by giving a polynomial-size certificate and a polynomial-time verifier.",
        "Choose a problem that is already known to be NP-complete.",
        "Construct a polynomial-time function f that maps each source instance to a target instance.",
        "Prove the two correctness directions: source YES implies target YES, and target YES implies source YES.",
        "Bound the size and running time of the construction by a polynomial."
      ],
      mapTitle: "Reduction map in this tool",
      mapText: [
        "CNF clauses become 3-literal clauses by fresh variables.",
        "Clauses become triples of graph vertices; compatibility becomes edges.",
        "Clauses become triples with internal conflict edges; contradictory literals also conflict.",
        "Truth choices become decimal rows; clause satisfaction becomes target digits.",
        "Variables and clauses become edge-covering gadgets.",
        "Variables become directed diamonds; satisfied clauses become detours."
      ],
      npNote: "Each tab keeps the construction separate from the checker. The checker may brute-force small formulas so students can inspect examples, but the proof never relies on brute force."
    },
    sat3: {
      sourceDef: "SAT asks whether a Boolean formula is satisfiable. In this tab the input is already in CNF, but clauses may have any positive size.",
      targetDef: "3SAT asks whether a 3CNF formula is satisfiable, meaning every generated clause has exactly three literal positions.",
      presets: {
        mixed: "Mixed clause sizes",
        unsat: "Unsatisfiable unit conflict",
        long: "Long clause chain",
        reference: "Sipser-style four-literal clause"
      },
      presetNotes: {
        mixed: "A satisfiable CNF with unit, binary, ternary, and long clauses.",
        unsat: "The formula forces x1 and ¬x1.",
        long: "A long disjunction illustrates the implication chain of auxiliary variables.",
        reference: "The four-literal example is the smallest long-clause split."
      },
      steps: [
        "Parse the CNF formula and list the original clauses.",
        "Replace unit and binary clauses by small satisfiability-preserving 3CNF gadgets.",
        "Leave clauses of size three unchanged.",
        "Split long clauses with a chain of fresh variables.",
        "Compare assignments: original variables are preserved, auxiliaries are existential."
      ],
      unitRule: "Unit clause: (ℓ) becomes four clauses containing fresh variables p and q. If ℓ is false, every p/q choice falsifies one generated clause.",
      binaryRule: "Binary clause: (ℓ1 ∨ ℓ2) becomes two clauses with a fresh p. If both original literals are false, p and ¬p cannot both help.",
      ternaryRule: "A 3-literal clause is copied unchanged.",
      longRule: "Long clause: (ℓ1 ∨ ... ∨ ℓr) becomes a chain. Each fresh variable records whether the left prefix has already been satisfied.",
      proofForward: "Given a satisfying assignment of the original CNF, choose auxiliary variables so that each generated gadget is satisfied. Unit and binary gadgets are immediate; in a long chain, set the chain to pass responsibility until a true literal is reached.",
      proofReverse: "If the generated 3CNF is satisfiable, then each gadget forces its original clause to have at least one true literal. Forgetting auxiliary variables leaves a satisfying assignment for the original CNF.",
      proofPoly: "A clause of length r creates at most r clauses and r fresh variables. The total output length is linear in the total number of literal occurrences.",
      mistake: "The reduction preserves satisfiability, not literal-by-literal logical equivalence over only the original variables. Auxiliary variables are existential witnesses.",
      truthTable: "Small truth table",
      reducedFormula: "Generated 3CNF",
      auxVars: "Fresh variables",
      checkerHelp: "Enter original-variable assignments such as x1=true, x2=false. The checker asks whether some auxiliary extension satisfies the generated 3CNF."
    },
    clique: {
      sourceDef: "3SAT asks whether every clause can receive at least one true literal.",
      targetDef: "CLIQUE asks whether an undirected graph G contains a complete subgraph with at least k vertices.",
      presets: {
        satSmall: "Small satisfiable",
        unsatSmall: "Small unsatisfiable",
        referenceFalse: "Course false formula",
        referenceTrue: "Course true formula"
      },
      steps: [
        "Create three vertices for every clause, one per literal occurrence.",
        "Group vertices by clause.",
        "Connect vertices from different clauses unless their labels contradict.",
        "Ask for a clique of size k, where k is the number of clauses.",
        "A clique chooses one compatible literal from every clause."
      ],
      proofForward: "From a satisfying assignment, choose one true literal in each clause. Chosen vertices lie in different clause groups and cannot be contradictory, so every pair is joined by an edge.",
      proofReverse: "A k-clique cannot contain two vertices from the same clause group because those vertices have no edge. It therefore selects one literal per clause, and the absence of contradictory pairs lets us set all selected literals true.",
      proofPoly: "The graph has 3k vertices and at most O(k²) edges, and each edge is decided by comparing two literal labels.",
      mistake: "Do not connect literals inside the same clause. The whole point is that a k-clique must take one representative from each group.",
      targetK: "Clique size k",
      clickHelp: "Click vertices to build a candidate clique.",
      onePerClause: "one per clause",
      allAdjacent: "all selected pairs adjacent",
      inducedAssignment: "Induced assignment"
    },
    independentset: {
      sourceDef: "3SAT asks whether every clause can receive at least one true literal.",
      targetDef: "INDEPENDENT-SET asks whether an undirected graph G contains at least k vertices with no edge between any selected pair.",
      presets: {
        satSmall: "Small satisfiable",
        unsatSmall: "Small unsatisfiable",
        referenceFalse: "Course false formula",
        referenceTrue: "Course true formula"
      },
      steps: [
        "Create three vertices for every clause, one per literal occurrence.",
        "Add all three edges inside each clause triple.",
        "Add edges between contradictory literals in different clauses.",
        "Ask for an independent set of size k, where k is the number of clauses.",
        "An independent set chooses one noncontradictory literal from every clause."
      ],
      proofForward: "From a satisfying assignment, choose one true literal in each clause. The choices come from different clause triples, and two true literals cannot be contradictory, so no edge joins any selected pair.",
      proofReverse: "An independent set of size k can contain at most one vertex from each clause triple because each triple is a triangle. With k clauses it must choose exactly one literal per clause, and the absence of contradiction edges lets us set all chosen literals true.",
      proofPoly: "The graph has 3k vertices, 3k clause-triangle edges, and at most O(k²) contradiction edges. Each edge is decided by comparing literal labels, so the construction is polynomial.",
      mistake: "Do not use compatibility edges here. That is the CLIQUE construction. For INDEPENDENT-SET, edges mark pairs that cannot be chosen together: same-clause pairs and contradictory literal pairs.",
      targetK: "Independent-set size k",
      clickHelp: "Click vertices to build a candidate independent set.",
      onePerClause: "one per clause",
      noSelectedEdges: "no selected pair has an edge",
      inducedAssignment: "Induced assignment"
    },
    subsetsum: {
      sourceDef: "3SAT asks whether a 3CNF formula has a satisfying truth assignment.",
      targetDef: "SUBSET-SUM asks whether a multiset of decimal numbers contains a submultiset whose sum is exactly the target t.",
      presets: {
        satSmall: "Small satisfiable",
        unsatSmall: "Small unsatisfiable",
        referenceFalse: "Course false formula",
        referenceTrue: "Course true formula"
      },
      steps: [
        "Make one variable column for each xi and one clause column for each cj.",
        "Create yi and zi rows for assigning xi true or false.",
        "Put digit 1 in a clause column when the corresponding literal appears in that clause.",
        "Add two slack rows gj and hj for every clause column.",
        "Set the target to 11...133...3 and select rows that match it without carries."
      ],
      proofForward: "Given a satisfying assignment, select yi for true variables and zi for false variables. Each variable column becomes 1, and each satisfied clause column receives at least 1 from a selected truth row. Slack rows raise each clause digit to 3.",
      proofReverse: "If a subset sums to the target, the first columns force exactly one of yi or zi for each variable. In a clause column, at most 2 can come from slack rows, so at least one selected truth row must correspond to a literal appearing in that clause.",
      proofPoly: "The table has 2n + 2m rows and n + m digits. Each digit is computed by scanning literal occurrences, so the construction is polynomial.",
      mistake: "The no-carry condition is essential. Clause-column totals are at most 5 before target checking, so decimal carries cannot hide a wrong column. Repeated copies of the same literal in one clause still put a single 1 in that literal's truth row; the digit records whether that assignment can satisfy the clause.",
      table: "Digit table",
      clickHelp: "Click rows to select a subset.",
      targetDigits: "Target digits",
      currentSum: "Current column sum",
      noCarry: "No carry occurs: every relevant column total is below 10.",
      rowChoice: "truth-setting rows",
      slackChoice: "slack rows"
    },
    vertexcover: {
      sourceDef: "3SAT asks whether one literal in each clause can be made true.",
      targetDef: "VERTEX-COVER asks whether an undirected graph has at most K vertices touching every edge.",
      presets: {
        satSmall: "Small satisfiable",
        unsatSmall: "Small unsatisfiable",
        referenceFalse: "Course false formula",
        referenceTrue: "Course true formula"
      },
      steps: [
        "Create an edge xi--¬xi for each variable.",
        "Create a triangle for each clause.",
        "Connect each clause literal to the matching variable literal.",
        "Set K = number of variables + 2 times number of clauses.",
        "A satisfying assignment selects true variable literals and leaves one true clause vertex uncovered."
      ],
      proofForward: "Select the variable-gadget vertex whose literal is true. In each clause triangle, leave one true literal occurrence unselected and select the other two. Variable edges, triangle edges, and connector edges are all covered.",
      proofReverse: "A cover of size K must spend one vertex on each variable edge and two on each clause triangle. The one unselected clause vertex has its connector edge covered only by the matching variable literal, making that literal true.",
      proofPoly: "The graph has 2n + 3m vertices and n + 3m + 3m edges, hence linear size in the formula.",
      mistake: "Truth convention: selecting variable vertex xi means xi is true; selecting ¬xi means xi is false. Clause vertices follow the opposite visual role: the unselected clause vertex names the true literal that satisfies the clause.",
      targetK: "Cover bound K",
      clickHelp: "Click vertices to test a candidate cover.",
      edgeCoverage: "covered edges",
      sizeBound: "size at most K",
      inducedAssignment: "Assignment from variable gadgets",
      uncoveredEdges: "uncovered edges"
    },
    hampath: {
      sourceDef: "3SAT asks whether a 3CNF formula has a satisfying assignment.",
      targetDef: "HAMPATH asks whether a directed graph G has a Hamiltonian path from a specified start s to a specified end t.",
      presets: {
        satSmall: "Small satisfiable",
        unsatSmall: "Small unsatisfiable",
        referenceFalse: "Course false formula",
        referenceTrue: "Course true formula"
      },
      steps: [
        "Create one directed diamond for every variable.",
        "Put 3k+1 horizontal nodes in each diamond: separators plus one pair for each clause.",
        "Create one clause node cj for every clause.",
        "Add detour edges: positive literals work left-to-right; negative literals work right-to-left.",
        "A satisfying assignment chooses a traversal direction and one detour for each clause."
      ],
      proofForward: "Traverse each variable diamond left-to-right when xi is true and right-to-left when xi is false. For each clause, detour through its clause node at one true literal occurrence. This visits every vertex exactly once from s to t.",
      proofReverse: "Any Hamiltonian path must traverse the diamonds normally; a cross-diamond clause detour would strand a separator or pair node. The direction of each diamond gives a truth value, and each visited clause node identifies a true literal.",
      proofPoly: "For n variables and k clauses, the graph has O(nk + k) vertices and edges. Each literal occurrence adds two directed detour edges.",
      mistake: "The clause node is not a separate path segment. It is visited as a detour from a pair inside a variable diamond, and the detour direction must match the literal sign.",
      clickHelp: "Click nodes to append them to a manual path.",
      showLabels: "Edge labels",
      showArrows: "Arrows",
      pathValid: "Hamiltonian path valid",
      visitsAll: "visits every node once",
      startsEnds: "starts at s and ends at t",
      followsEdges: "follows directed edges"
    },
    about: {
      title: "Sources and construction notes",
      body: [
        "Historically, these reductions trace back to Richard M. Karp's 1972 paper \"Reducibility Among Combinatorial Problems,\" which introduced the polynomial-time reduction method for a list of now-classical NP-complete problems.",
        "The concrete constructions shown here follow the standard textbook presentations of SAT and 3SAT reductions to CLIQUE, INDEPENDENT-SET, VERTEX-COVER, HAMPATH, and SUBSET-SUM, especially Michael Sipser's Introduction to the Theory of Computation.",
        "For SAT to 3SAT, the long-clause chain is the standard satisfiability-preserving transformation. Unit and binary clauses use equivalent auxiliary-variable gadgets so students can see the existential role of fresh variables explicitly.",
        "All automated solving in this tool is deliberately limited to small formulas and is used only to verify classroom examples and manual selections."
      ]
    }
  },
  pt: {
    htmlLang: "pt-BR",
    pageTitle: "Reduções NP-Completas",
    metaDescription: "Visualizações interativas de reduções polinomiais clássicas usadas em provas de NP-completude.",
    eyebrow: "NP-Completude",
    heading: "Visualizador de Reduções Polinomiais Clássicas",
    subtitle: "Construções passo a passo de SAT e 3SAT para problemas em grafos e aritmética.",
    themeToDark: "Mudar para modo escuro",
    themeToLight: "Mudar para modo claro",
    languageButton: "EN",
    languageTitle: "Mudar para inglês",
    tabs: {
      overview: "Visão geral",
      sat3: "SAT ≤P 3SAT",
      clique: "3SAT ≤P CLIQUE",
      independentset: "3SAT ≤P CONJ-INDEP",
      subsetsum: "3SAT ≤P SUBSET-SUM",
      vertexcover: "3SAT ≤P COB-VERT",
      hampath: "3SAT ≤P CAMHAM",
      about: "Sobre / Referências"
    },
    common: {
      sourceProblem: "Problema fonte",
      targetProblem: "Problema alvo",
      input: "Entrada",
      preset: "Exemplo",
      formula: "Fórmula",
      useInput: "Usar entrada",
      dragGraphNodes: "Arraste os nós para reorganizar o desenho; as arestas permanecem conectadas.",
      start: "Iniciar",
      cancel: "Cancelar",
      added: "Adicionado",
      constructionIdle: "Inicie o modo de construção para reconstruir a instância alvo uma peça por vez.",
      constructionEmpty: "O modo de construção está ativo. A instância alvo está vazia; clique em Próximo para adicionar a primeira peça.",
      constructionComplete: "A instância alvo construída está completa.",
      emptyConstruction: "Nenhum elemento alvo foi adicionado ainda.",
      previous: "Anterior",
      next: "Próximo",
      step: "Passo",
      construction: "Construção passo a passo",
      sourceInstance: "Instância fonte",
      targetInstance: "Instância alvo",
      solutionChecker: "Verificador de solução",
      compare: "Soluções fonte e alvo",
      proof: "Prova de correção",
      mistakes: "Erros comuns / intuição",
      forward: "Direção direta",
      reverse: "Direção reversa",
      polynomial: "Tempo polinomial",
      satisfiable: "satisfatível",
      unsatisfiable: "insatisfatível",
      yesInstance: "instância SIM",
      noInstance: "instância NÃO",
      notChecked: "não verificado para este tamanho",
      assignment: "Atribuição",
      targetSolution: "Solução alvo",
      sourceAnswer: "Fórmula fonte",
      targetAnswer: "Alvo construído",
      showSolution: "Mostrar uma solução",
      resetSelection: "Limpar seleção",
      selected: "Selecionado",
      valid: "válido",
      invalid: "inválido",
      variables: "variáveis",
      vertices: "vértices",
      clauses: "cláusulas",
      entry: "ent.",
      exit: "sai",
      target: "Alvo",
      noSolution: "Não existe solução para este exemplo/entrada.",
      bruteForceNote: "A busca exaustiva mostrada aqui é apenas um verificador didático; ela não faz parte da redução polinomial.",
      parseError: "Erro de leitura",
      requires3cnf: "Esta redução exige que toda cláusula tenha exatamente três ocorrências de literais.",
      emptyClause: "Cláusulas vazias não são aceitas pelo parser didático.",
      emptyFormula: "A fórmula está vazia.",
      unbalancedParens: "Parênteses desbalanceados.",
      invalidLiteral: (literal) => `Literal inválido "${literal}".`,
      invalidClauseSize: (clause, size) => `A cláusula ${clause} tem ${size} ocorrências de literais.`,
      tooManyVariables: "A fórmula tem variáveis demais para o verificador exaustivo embutido.",
      true: "verdadeiro",
      false: "falso",
      free: "livre",
      none: "nenhum"
    },
    overview: {
      title: "Como reduções de NP-completude são usadas",
      intro: "Uma redução é uma tradução de instâncias. Para provar que um novo problema é NP-difícil, traduzimos um problema difícil conhecido para ele e provamos que a resposta SIM/NÃO é preservada.",
      steps: [
        "Mostre que o problema alvo pertence a NP com um certificado de tamanho polinomial e um verificador em tempo polinomial.",
        "Escolha um problema que já seja conhecido como NP-completo.",
        "Construa uma função polinomial f que leva cada instância fonte a uma instância alvo.",
        "Prove as duas direções de correção: fonte SIM implica alvo SIM, e alvo SIM implica fonte SIM.",
        "Limite o tamanho e o tempo da construção por um polinômio."
      ],
      mapTitle: "Mapa de reduções nesta ferramenta",
      mapText: [
        "Cláusulas CNF viram cláusulas de 3 literais com variáveis novas.",
        "Cláusulas viram trios de vértices; compatibilidade vira aresta.",
        "Cláusulas viram trios com arestas internas de conflito; literais contraditórios também entram em conflito.",
        "Escolhas de verdade viram linhas decimais; satisfazer cláusulas vira atingir dígitos-alvo.",
        "Variáveis e cláusulas viram gadgets de cobertura de arestas.",
        "Variáveis viram losangos dirigidos; cláusulas satisfeitas viram desvios."
      ],
      npNote: "Cada aba separa a construção do verificador. O verificador pode usar busca exaustiva em fórmulas pequenas para inspeção, mas a prova nunca depende disso."
    },
    sat3: {
      sourceDef: "SAT pergunta se uma fórmula booleana é satisfatível. Nesta aba a entrada já está em CNF, mas as cláusulas podem ter qualquer tamanho positivo.",
      targetDef: "3SAT pergunta se uma fórmula 3CNF é satisfatível, isto é, toda cláusula gerada tem exatamente três posições de literais.",
      presets: {
        mixed: "Tamanhos mistos",
        unsat: "Conflito unitário insatisfatível",
        long: "Cadeia de cláusula longa",
        reference: "Cláusula de quatro literais"
      },
      presetNotes: {
        mixed: "Uma CNF satisfatível com cláusulas unitária, binária, ternária e longa.",
        unsat: "A fórmula força x1 e ¬x1.",
        long: "Uma disjunção longa ilustra a cadeia de variáveis auxiliares.",
        reference: "O exemplo de quatro literais é a menor divisão de cláusula longa."
      },
      steps: [
        "Ler a fórmula CNF e listar as cláusulas originais.",
        "Substituir cláusulas unitárias e binárias por gadgets 3CNF que preservam satisfatibilidade.",
        "Manter inalteradas as cláusulas com três literais.",
        "Dividir cláusulas longas com uma cadeia de variáveis frescas.",
        "Comparar atribuições: variáveis originais são preservadas, auxiliares são existenciais."
      ],
      unitRule: "Cláusula unitária: (ℓ) vira quatro cláusulas com variáveis frescas p e q. Se ℓ é falso, toda escolha de p/q falsifica alguma cláusula gerada.",
      binaryRule: "Cláusula binária: (ℓ1 ∨ ℓ2) vira duas cláusulas com uma variável fresca p. Se os dois literais originais são falsos, p e ¬p não podem ajudar ao mesmo tempo.",
      ternaryRule: "Uma cláusula de 3 literais é copiada sem alteração.",
      longRule: "Cláusula longa: (ℓ1 ∨ ... ∨ ℓr) vira uma cadeia. Cada variável fresca registra se o prefixo à esquerda já foi satisfeito.",
      proofForward: "Dada uma atribuição que satisfaz a CNF original, escolha valores para as variáveis auxiliares de modo que cada gadget gerado seja satisfeito. Nas cláusulas longas, a cadeia passa a responsabilidade até encontrar um literal verdadeiro.",
      proofReverse: "Se a 3CNF gerada é satisfatível, então cada gadget força sua cláusula original a ter pelo menos um literal verdadeiro. Esquecendo as variáveis auxiliares, sobra uma atribuição que satisfaz a CNF original.",
      proofPoly: "Uma cláusula de tamanho r cria no máximo r cláusulas e r variáveis frescas. O tamanho total da saída é linear no número total de ocorrências de literais.",
      mistake: "A redução preserva satisfatibilidade, não equivalência literal por literal usando apenas as variáveis originais. Variáveis auxiliares são testemunhas existenciais.",
      truthTable: "Tabela-verdade pequena",
      reducedFormula: "3CNF gerada",
      auxVars: "Variáveis frescas",
      checkerHelp: "Digite atribuições das variáveis originais, como x1=true, x2=false. O verificador pergunta se existe alguma extensão auxiliar que satisfaça a 3CNF gerada."
    },
    clique: {
      sourceDef: "3SAT pergunta se cada cláusula pode receber pelo menos um literal verdadeiro.",
      targetDef: "CLIQUE pergunta se um grafo não-direcionado G contém um subgrafo completo com pelo menos k vértices.",
      presets: {
        satSmall: "Satisfatível pequeno",
        unsatSmall: "Insatisfatível pequeno",
        referenceFalse: "Fórmula falsa da aula",
        referenceTrue: "Fórmula verdadeira da aula"
      },
      steps: [
        "Criar três vértices para cada cláusula, um por ocorrência de literal.",
        "Agrupar vértices por cláusula.",
        "Conectar vértices de cláusulas diferentes exceto quando seus rótulos se contradizem.",
        "Pedir um clique de tamanho k, onde k é o número de cláusulas.",
        "Um clique escolhe um literal compatível de cada cláusula."
      ],
      proofForward: "A partir de uma atribuição satisfatória, escolha um literal verdadeiro em cada cláusula. Os vértices escolhidos estão em grupos diferentes e não podem se contradizer, portanto todo par tem aresta.",
      proofReverse: "Um k-clique não pode conter dois vértices do mesmo grupo, pois não há arestas dentro de uma cláusula. Ele escolhe um literal por cláusula, e a ausência de pares contraditórios permite tornar todos os literais escolhidos verdadeiros.",
      proofPoly: "O grafo tem 3k vértices e no máximo O(k²) arestas; cada aresta é decidida comparando dois rótulos de literais.",
      mistake: "Não conecte literais dentro da mesma cláusula. O objetivo é forçar o k-clique a escolher um representante de cada grupo.",
      targetK: "Tamanho k do clique",
      clickHelp: "Clique em vértices para montar um clique candidato.",
      onePerClause: "um por cláusula",
      allAdjacent: "todos os pares selecionados têm aresta",
      inducedAssignment: "Atribuição induzida"
    },
    independentset: {
      sourceDef: "3SAT pergunta se cada cláusula pode receber pelo menos um literal verdadeiro.",
      targetDef: "CONJUNTO INDEPENDENTE pergunta se um grafo não-direcionado G contém pelo menos k vértices sem aresta entre nenhum par selecionado.",
      presets: {
        satSmall: "Satisfatível pequeno",
        unsatSmall: "Insatisfatível pequeno",
        referenceFalse: "Fórmula falsa da aula",
        referenceTrue: "Fórmula verdadeira da aula"
      },
      steps: [
        "Criar três vértices para cada cláusula, um por ocorrência de literal.",
        "Adicionar as três arestas dentro de cada trio de cláusula.",
        "Adicionar arestas entre literais contraditórios de cláusulas diferentes.",
        "Pedir um conjunto independente de tamanho k, onde k é o número de cláusulas.",
        "Um conjunto independente escolhe um literal não contraditório de cada cláusula."
      ],
      proofForward: "A partir de uma atribuição satisfatória, escolha um literal verdadeiro em cada cláusula. As escolhas vêm de trios diferentes, e dois literais verdadeiros não podem se contradizer; portanto nenhuma aresta liga pares selecionados.",
      proofReverse: "Um conjunto independente de tamanho k contém no máximo um vértice de cada trio de cláusula, pois cada trio é um triângulo. Com k cláusulas, ele escolhe exatamente um literal por cláusula, e a ausência de arestas de contradição permite tornar todos os literais escolhidos verdadeiros.",
      proofPoly: "O grafo tem 3k vértices, 3k arestas de triângulos de cláusula e no máximo O(k²) arestas de contradição. Cada aresta é decidida comparando rótulos de literais, logo a construção é polinomial.",
      mistake: "Não use arestas de compatibilidade aqui. Essa é a construção de CLIQUE. Para CONJUNTO INDEPENDENTE, as arestas marcam pares que não podem ser escolhidos juntos: pares da mesma cláusula e pares de literais contraditórios.",
      targetK: "Tamanho k do conjunto independente",
      clickHelp: "Clique em vértices para montar um conjunto independente candidato.",
      onePerClause: "um por cláusula",
      noSelectedEdges: "nenhum par selecionado tem aresta",
      inducedAssignment: "Atribuição induzida"
    },
    subsetsum: {
      sourceDef: "3SAT pergunta se uma fórmula 3CNF tem uma atribuição satisfatória.",
      targetDef: "SUBSET-SUM pergunta se um multiconjunto de números decimais contém um submulticonjunto cuja soma é exatamente o alvo t.",
      presets: {
        satSmall: "Satisfatível pequeno",
        unsatSmall: "Insatisfatível pequeno",
        referenceFalse: "Fórmula falsa da aula",
        referenceTrue: "Fórmula verdadeira da aula"
      },
      steps: [
        "Criar uma coluna de variável para cada xi e uma coluna de cláusula para cada cj.",
        "Criar linhas yi e zi para atribuir xi verdadeiro ou falso.",
        "Colocar dígito 1 na coluna de cláusula quando o literal correspondente aparece naquela cláusula.",
        "Adicionar duas linhas de enchimento gj e hj para cada coluna de cláusula.",
        "Definir o alvo como 11...133...3 e selecionar linhas que o atingem sem carry."
      ],
      proofForward: "Dada uma atribuição satisfatória, selecione yi para variáveis verdadeiras e zi para falsas. Cada coluna de variável vira 1, e cada coluna de cláusula satisfeita recebe pelo menos 1 de uma linha de verdade selecionada. Linhas de enchimento elevam cada dígito de cláusula a 3.",
      proofReverse: "Se um subconjunto soma o alvo, as primeiras colunas forçam exatamente um entre yi e zi para cada variável. Em uma coluna de cláusula, no máximo 2 pode vir das linhas de enchimento; logo pelo menos uma linha de verdade selecionada corresponde a um literal que aparece naquela cláusula.",
      proofPoly: "A tabela tem 2n + 2m linhas e n + m dígitos. Cada dígito é calculado varrendo ocorrências de literais, portanto a construção é polinomial.",
      mistake: "A ausência de carry é essencial. Totais de colunas de cláusula ficam abaixo de 10, então um erro de coluna não pode ser escondido por transporte decimal. Cópias repetidas do mesmo literal em uma cláusula ainda colocam um único 1 na linha de verdade daquele literal; o dígito registra se aquela atribuição pode satisfazer a cláusula.",
      table: "Tabela de dígitos",
      clickHelp: "Clique em linhas para selecionar um subconjunto.",
      targetDigits: "Dígitos-alvo",
      currentSum: "Soma atual por coluna",
      noCarry: "Não há carry: todo total relevante fica abaixo de 10.",
      rowChoice: "linhas de atribuição",
      slackChoice: "linhas de enchimento"
    },
    vertexcover: {
      sourceDef: "3SAT pergunta se um literal em cada cláusula pode ser tornado verdadeiro.",
      targetDef: "COBERTURA COM VÉRTICES pergunta se um grafo não-direcionado tem no máximo K vértices que tocam todas as arestas.",
      presets: {
        satSmall: "Satisfatível pequeno",
        unsatSmall: "Insatisfatível pequeno",
        referenceFalse: "Fórmula falsa da aula",
        referenceTrue: "Fórmula verdadeira da aula"
      },
      steps: [
        "Criar uma aresta xi--¬xi para cada variável.",
        "Criar um triângulo para cada cláusula.",
        "Conectar cada literal de cláusula ao literal de variável correspondente.",
        "Definir K = número de variáveis + 2 vezes o número de cláusulas.",
        "Uma atribuição satisfatória seleciona literais verdadeiros nas variáveis e deixa descoberto um vértice de cláusula verdadeiro."
      ],
      proofForward: "Selecione no gadget de variável o vértice cujo literal é verdadeiro. Em cada triângulo de cláusula, deixe sem selecionar uma ocorrência verdadeira e selecione as outras duas. Arestas de variáveis, triângulos e conectores ficam cobertos.",
      proofReverse: "Uma cobertura de tamanho K precisa gastar um vértice em cada aresta de variável e dois em cada triângulo de cláusula. O vértice de cláusula não selecionado tem sua aresta conectora coberta apenas pelo literal de variável correspondente, tornando esse literal verdadeiro.",
      proofPoly: "O grafo tem 2n + 3m vértices e n + 3m + 3m arestas; tamanho linear na fórmula.",
      mistake: "Convenção de verdade: selecionar o vértice xi da variável significa xi verdadeiro; selecionar ¬xi significa xi falso. Nos triângulos, o papel visual é inverso: o vértice de cláusula não selecionado nomeia o literal verdadeiro que satisfaz a cláusula.",
      targetK: "Limite K da cobertura",
      clickHelp: "Clique em vértices para testar uma cobertura candidata.",
      edgeCoverage: "arestas cobertas",
      sizeBound: "tamanho no máximo K",
      inducedAssignment: "Atribuição pelos gadgets de variável",
      uncoveredEdges: "arestas descobertas"
    },
    hampath: {
      sourceDef: "3SAT pergunta se uma fórmula 3CNF tem uma atribuição satisfatória.",
      targetDef: "CAMINHO HAMILTONIANO pergunta se um grafo dirigido G tem um caminho hamiltoniano de um início s a um fim t especificados.",
      presets: {
        satSmall: "Satisfatível pequeno",
        unsatSmall: "Insatisfatível pequeno",
        referenceFalse: "Fórmula falsa da aula",
        referenceTrue: "Fórmula verdadeira da aula"
      },
      steps: [
        "Criar um losango dirigido para cada variável.",
        "Colocar 3k+1 nós horizontais em cada losango: separadores mais um par para cada cláusula.",
        "Criar um nó de cláusula cj para cada cláusula.",
        "Adicionar arestas de desvio: literais positivos funcionam da esquerda para a direita; negativos, da direita para a esquerda.",
        "Uma atribuição satisfatória escolhe direção de travessia e um desvio para cada cláusula."
      ],
      proofForward: "Atravesse o losango de xi da esquerda para a direita quando xi é verdadeiro e da direita para a esquerda quando xi é falso. Para cada cláusula, desvie por seu nó em uma ocorrência verdadeira. Isso visita todos os vértices exatamente uma vez de s até t.",
      proofReverse: "Qualquer caminho hamiltoniano precisa atravessar os losangos normalmente; um desvio entre losangos diferentes deixaria preso um nó separador ou de par. A direção de cada losango dá um valor verdade, e cada nó de cláusula visitado identifica um literal verdadeiro.",
      proofPoly: "Para n variáveis e k cláusulas, o grafo tem O(nk + k) vértices e arestas. Cada ocorrência de literal adiciona duas arestas dirigidas de desvio.",
      mistake: "O nó de cláusula não é um segmento separado do caminho. Ele é visitado como desvio a partir de um par dentro de um losango de variável, e a direção do desvio precisa bater com o sinal do literal.",
      clickHelp: "Clique em nós para acrescentá-los a um caminho manual.",
      showLabels: "Rótulos de arestas",
      showArrows: "Setas",
      pathValid: "Caminho hamiltoniano válido",
      visitsAll: "visita cada nó uma vez",
      startsEnds: "começa em s e termina em t",
      followsEdges: "segue arestas dirigidas"
    },
    about: {
      title: "Fontes e notas de construção",
      body: [
        "Historicamente, estas reduções remontam ao artigo de Richard M. Karp de 1972, \"Reducibility Among Combinatorial Problems\", que introduziu o método de reduções em tempo polinomial para uma lista de problemas NP-completos hoje clássicos.",
        "As construções concretas mostradas aqui seguem as apresentações didáticas padrão de reduções de SAT e 3SAT para CLIQUE, CONJUNTO INDEPENDENTE, VERTEX-COVER, HAMPATH e SUBSET-SUM, especialmente Introduction to the Theory of Computation, de Michael Sipser.",
        "Para SAT para 3SAT, a cadeia de cláusulas longas é a transformação padrão que preserva satisfatibilidade. Cláusulas unitárias e binárias usam gadgets equivalentes com variáveis auxiliares para explicitar o papel existencial das variáveis frescas.",
        "Toda resolução automática nesta ferramenta é intencionalmente limitada a fórmulas pequenas e serve apenas para verificar exemplos de aula e seleções manuais."
      ]
    }
  }
};

const PRESETS = {
  sat3: {
    mixed: {
      formula: "(x1 v !x2 v x3 v x4) ^ (!x1) ^ (x2 v x3) ^ (x3 v !x4 v x5)",
      expected: true
    },
    unsat: {
      formula: "(x1) ^ (!x1)",
      expected: false
    },
    long: {
      formula: "(x1 v x2 v !x3 v x4 v !x5 v x6) ^ (!x1 v x3) ^ (x2)",
      expected: true
    },
    reference: {
      formula: "(x1 v !x2 v x3 v x4)",
      expected: true
    }
  },
  threesat: {
    satSmall: {
      formula: "(x1 v x2 v x3) ^ (!x1 v x2 v x3) ^ (x1 v !x2 v x3)",
      expected: true
    },
    unsatSmall: {
      formula: "(x1 v x1 v x1) ^ (!x1 v !x1 v !x1)",
      expected: false
    },
    referenceFalse: {
      formula: "(x1 v x2 v x2) ^ (x1 v !x2 v !x2) ^ (!x1 v x3 v x3) ^ (!x1 v !x3 v !x3)",
      expected: false
    },
    referenceTrue: {
      formula: "(x1 v x2 v x2) ^ (x1 v !x2 v !x2) ^ (!x1 v x3 v x3) ^ (!x1 v !x3 v !x2)",
      expected: true
    }
  }
};

const DEFAULT_STEPS = {
  sat3: 5,
  clique: 5,
  independentset: 5,
  subsetsum: 5,
  vertexcover: 5,
  hampath: 5
};

const state = {
  language: readStorage(LANGUAGE_KEY, "en") === "pt" ? "pt" : "en",
  theme: readStorage(THEME_KEY, "light") === "dark" ? "dark" : "light",
  activeTab: "overview",
  graphLayouts: { clique: {}, independentset: {}, vertexcover: {}, hampath: {} },
  graphDrag: null,
  suppressNextGraphClick: false,
  graphDragEndedAt: 0,
  reductions: {
    sat3: { preset: "mixed", input: PRESETS.sat3.mixed.formula, step: 0, constructing: false, buildIndex: 0, assignmentInput: "" },
    clique: { preset: "satSmall", input: PRESETS.threesat.satSmall.formula, step: 0, constructing: false, buildIndex: 0, selected: new Set() },
    independentset: { preset: "satSmall", input: PRESETS.threesat.satSmall.formula, step: 0, constructing: false, buildIndex: 0, selected: new Set() },
    subsetsum: { preset: "satSmall", input: PRESETS.threesat.satSmall.formula, step: 0, constructing: false, buildIndex: 0, selected: new Set() },
    vertexcover: { preset: "satSmall", input: PRESETS.threesat.satSmall.formula, step: 0, constructing: false, buildIndex: 0, selected: new Set() },
    hampath: {
      preset: "satSmall",
      input: PRESETS.threesat.satSmall.formula,
      step: 0,
      constructing: false,
      buildIndex: 0,
      selectedPath: [],
      showLabels: false,
      showArrows: true
    }
  }
};

const app = document.getElementById("app");
const tabBar = document.getElementById("tabBar");
const workspace = document.getElementById("workspace");
const themeToggle = document.getElementById("themeToggle");
const languageToggle = document.getElementById("languageToggle");

function readStorage(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Persistence is optional in private or restricted contexts.
  }
}

function tx() {
  return TEXT[state.language];
}

function ctext() {
  return tx().common;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attr(value) {
  return escapeHtml(value);
}

function boolText(value) {
  if (value === true) {
    return ctext().true;
  }
  if (value === false) {
    return ctext().false;
  }
  return ctext().free;
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme === "dark" ? "dark" : "light";
  writeStorage(THEME_KEY, theme);
}

function naturalVarCompare(a, b) {
  const ma = /^([A-Za-z_]+)(\d+)$/.exec(a);
  const mb = /^([A-Za-z_]+)(\d+)$/.exec(b);
  if (ma && mb && ma[1] === mb[1]) {
    return Number(ma[2]) - Number(mb[2]);
  }
  return a.localeCompare(b, undefined, { numeric: true });
}

function literalKey(lit) {
  return `${lit.neg ? "!" : ""}${lit.name}`;
}

function copyLiteral(lit) {
  return { name: lit.name, neg: Boolean(lit.neg) };
}

function negateLiteral(lit) {
  return { name: lit.name, neg: !lit.neg };
}

function contradictory(a, b) {
  return a.name === b.name && a.neg !== b.neg;
}

function formatLiteral(lit) {
  return `${lit.neg ? "¬" : ""}${lit.name}`;
}

function formatClause(clause) {
  return `(${clause.map(formatLiteral).join(" ∨ ")})`;
}

function formatFormula(clauses) {
  return clauses.map(formatClause).join(" ∧ ");
}

function formulaVariables(clauses) {
  return [...new Set(clauses.flat().map((lit) => lit.name))].sort(naturalVarCompare);
}

function isBalancedOuterParens(text) {
  if (!text.startsWith("(") || !text.endsWith(")")) {
    return false;
  }
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "(") {
      depth += 1;
    } else if (text[i] === ")") {
      depth -= 1;
      if (depth === 0 && i < text.length - 1) {
        return false;
      }
    }
    if (depth < 0) {
      return false;
    }
  }
  return depth === 0;
}

function stripOuterParens(text) {
  let next = text.trim();
  while (isBalancedOuterParens(next)) {
    next = next.slice(1, -1).trim();
  }
  return next;
}

function splitTopLevel(text) {
  const parts = [];
  let depth = 0;
  let current = "";
  const source = text.replace(/\r/g, "\n");
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "(") {
      depth += 1;
      current += ch;
    } else if (ch === ")") {
      depth -= 1;
      if (depth < 0) {
        throw new Error(ctext().unbalancedParens);
      }
      current += ch;
    } else if (depth === 0 && (ch === "^" || ch === "∧" || ch === "&" || ch === ";" || ch === "\n")) {
      if (current.trim()) {
        parts.push(current.trim());
      }
      current = "";
    } else {
      current += ch;
    }
  }
  if (depth !== 0) {
    throw new Error(ctext().unbalancedParens);
  }
  if (current.trim()) {
    parts.push(current.trim());
  }
  return parts;
}

function splitClauseLiterals(text) {
  const clause = stripOuterParens(text)
    .replaceAll("∨", " v ")
    .replace(/\bor\b/gi, " v ");
  return clause
    .split(/\s*(?:,|\||\bv\b)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseLiteral(raw) {
  let text = raw.trim();
  text = stripOuterParens(text);
  let neg = false;
  let changed = true;
  while (changed) {
    changed = false;
    text = text.trim();
    if (/^not\b/i.test(text)) {
      neg = !neg;
      text = text.replace(/^not\b/i, "").trim();
      changed = true;
    } else if (/^[!¬~]/.test(text)) {
      neg = !neg;
      text = text.slice(1).trim();
      changed = true;
    }
  }
  text = text.replace(/\s+/g, "");
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(text)) {
    throw new Error(ctext().invalidLiteral(raw));
  }
  return { name: text, neg };
}

function parseFormula(raw, { require3 = false } = {}) {
  const input = String(raw ?? "").trim();
  if (!input) {
    throw new Error(ctext().emptyFormula);
  }
  let clauseTexts = splitTopLevel(input);
  if (clauseTexts.length === 1) {
    const matches = [...input.matchAll(/\(([^()]+)\)/g)].map((match) => match[1]);
    if (matches.length > 1) {
      clauseTexts = matches;
    }
  }
  const clauses = clauseTexts.map((part) => {
    const literalTexts = splitClauseLiterals(part);
    if (literalTexts.length === 0) {
      throw new Error(ctext().emptyClause);
    }
    return literalTexts.map(parseLiteral);
  });
  if (require3) {
    const bad = clauses.findIndex((clause) => clause.length !== 3);
    if (bad >= 0) {
      throw new Error(`${ctext().requires3cnf} ${ctext().invalidClauseSize(`c${bad + 1}`, clauses[bad].length)}`);
    }
  }
  return clauses;
}

function evalLiteral(lit, assignment) {
  const value = assignment[lit.name];
  if (value === undefined) {
    return undefined;
  }
  return lit.neg ? !value : value;
}

function evalClause(clause, assignment) {
  let unknown = false;
  for (const lit of clause) {
    const value = evalLiteral(lit, assignment);
    if (value === true) {
      return true;
    }
    if (value === undefined) {
      unknown = true;
    }
  }
  return unknown ? undefined : false;
}

function evalFormula(clauses, assignment) {
  let unknown = false;
  for (const clause of clauses) {
    const value = evalClause(clause, assignment);
    if (value === false) {
      return false;
    }
    if (value === undefined) {
      unknown = true;
    }
  }
  return unknown ? undefined : true;
}

function findSatisfyingAssignment(clauses, maxVars = 12, fixed = {}) {
  const vars = formulaVariables(clauses).filter((name) => fixed[name] === undefined);
  if (vars.length > maxVars) {
    return { skipped: true, assignment: null };
  }
  const total = 1 << vars.length;
  for (let mask = 0; mask < total; mask += 1) {
    const assignment = { ...fixed };
    vars.forEach((name, index) => {
      assignment[name] = Boolean(mask & (1 << index));
    });
    if (evalFormula(clauses, assignment) === true) {
      return { skipped: false, assignment };
    }
  }
  return { skipped: false, assignment: null };
}

function parseAssignment(raw) {
  const assignment = {};
  const text = String(raw ?? "").trim();
  if (!text) {
    return assignment;
  }
  const parts = text.split(/[;,]\s*/).filter(Boolean);
  for (const part of parts) {
    const match = /^\s*([A-Za-z][A-Za-z0-9_]*)\s*(?:=|:)\s*(true|false|t|f|1|0|verdadeiro|falso)\s*$/i.exec(part);
    if (!match) {
      throw new Error(`Invalid assignment item "${part}".`);
    }
    assignment[match[1]] = /^(true|t|1|verdadeiro)$/i.test(match[2]);
  }
  return assignment;
}

function assignmentHtml(assignment, vars = Object.keys(assignment).sort(naturalVarCompare)) {
  if (!assignment || vars.length === 0) {
    return `<p>${escapeHtml(ctext().none)}</p>`;
  }
  return `<div class="assignment-grid">${vars.map((name) => `
    <div class="assignment-cell"><strong>${escapeHtml(name)}</strong> = ${escapeHtml(boolText(assignment[name]))}</div>
  `).join("")}</div>`;
}

function makeFreshFactory(clauses) {
  const used = new Set(formulaVariables(clauses));
  let index = 1;
  return function fresh() {
    while (used.has(`u${index}`)) {
      index += 1;
    }
    const name = `u${index}`;
    used.add(name);
    index += 1;
    return name;
  };
}

function reduceCNFTo3CNF(clauses) {
  const fresh = makeFreshFactory(clauses);
  const generated = [];
  const steps = [];
  const auxVars = [];

  clauses.forEach((clause, clauseIndex) => {
    const original = clause.map(copyLiteral);
    const local = [];
    const localAux = [];
    if (clause.length === 1) {
      const p = fresh();
      const q = fresh();
      auxVars.push(p, q);
      localAux.push(p, q);
      const lit = copyLiteral(clause[0]);
      local.push(
        [lit, { name: p, neg: false }, { name: q, neg: false }],
        [copyLiteral(clause[0]), { name: p, neg: false }, { name: q, neg: true }],
        [copyLiteral(clause[0]), { name: p, neg: true }, { name: q, neg: false }],
        [copyLiteral(clause[0]), { name: p, neg: true }, { name: q, neg: true }]
      );
      steps.push({ clauseIndex, type: "unit", original, generated: local, aux: localAux });
    } else if (clause.length === 2) {
      const p = fresh();
      auxVars.push(p);
      localAux.push(p);
      local.push(
        [copyLiteral(clause[0]), copyLiteral(clause[1]), { name: p, neg: false }],
        [copyLiteral(clause[0]), copyLiteral(clause[1]), { name: p, neg: true }]
      );
      steps.push({ clauseIndex, type: "binary", original, generated: local, aux: localAux });
    } else if (clause.length === 3) {
      local.push(clause.map(copyLiteral));
      steps.push({ clauseIndex, type: "ternary", original, generated: local, aux: localAux });
    } else {
      const auxCount = clause.length - 3;
      const ys = Array.from({ length: auxCount }, () => fresh());
      auxVars.push(...ys);
      localAux.push(...ys);
      local.push([copyLiteral(clause[0]), copyLiteral(clause[1]), { name: ys[0], neg: false }]);
      for (let j = 1; j < ys.length; j += 1) {
        local.push([{ name: ys[j - 1], neg: true }, copyLiteral(clause[j + 1]), { name: ys[j], neg: false }]);
      }
      local.push([{ name: ys[ys.length - 1], neg: true }, copyLiteral(clause[clause.length - 2]), copyLiteral(clause[clause.length - 1])]);
      steps.push({ clauseIndex, type: "long", original, generated: local, aux: localAux });
    }
    generated.push(...local);
  });

  return { clauses: generated, steps, auxVars };
}

function clauseTypeText(type) {
  const text = tx().sat3;
  return {
    unit: text.unitRule,
    binary: text.binaryRule,
    ternary: text.ternaryRule,
    long: text.longRule
  }[type] ?? "";
}

function generatedClauseList(clauses) {
  return clauses.map(formatClause).join(" ∧ ");
}

function sat3ConstructionItems(reduction) {
  return reduction.steps.map((step) => {
    const auxText = step.aux.length ? `${state.language === "pt" ? "Variáveis frescas" : "Fresh variables"}: ${step.aux.join(", ")}. ` : "";
    const generatedText = `${state.language === "pt" ? "Cláusulas geradas" : "Generated clauses"}: ${generatedClauseList(step.generated)}.`;
    const sizeText = state.language === "pt"
      ? `A cláusula original tem ${step.original.length} ocorrência(s) de literal. `
      : `The original clause has ${step.original.length} literal occurrence(s). `;
    let why = clauseTypeText(step.type);
    if (step.type === "long") {
      why += state.language === "pt"
        ? " A primeira cláusula oferece satisfazer pelos dois primeiros literais ou passar a responsabilidade adiante; cada cláusula intermediária recebe ¬u da etapa anterior e um novo u; a última precisa satisfazer pelo literal atual ou por um dos dois últimos literais."
        : " The first generated clause either satisfies the original clause with the first two literals or passes responsibility forward; each middle clause receives ¬u from the previous stage and a new u; the final clause must finish with the current literal or one of the last two literals.";
    }
    return {
      title: `c${step.clauseIndex + 1}: ${formatClause(step.original)}`,
      explanation: `${sizeText}${why} ${auxText}${generatedText}`,
      clauseStep: step
    };
  });
}

function buildCliqueInstance(clauses) {
  const vertices = [];
  clauses.forEach((clause, ci) => {
    clause.forEach((lit, li) => {
      vertices.push({ id: `c${ci + 1}l${li + 1}`, clause: ci, occurrence: li, lit: copyLiteral(lit), label: formatLiteral(lit) });
    });
  });
  const edges = [];
  const missing = [];
  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = i + 1; j < vertices.length; j += 1) {
      const a = vertices[i];
      const b = vertices[j];
      if (a.clause === b.clause) {
        continue;
      }
      if (contradictory(a.lit, b.lit)) {
        missing.push([a.id, b.id]);
      } else {
        edges.push([a.id, b.id]);
      }
    }
  }
  return { vertices, edges, missing, k: clauses.length, edgeSet: edgeSet(edges) };
}

function cliqueConstructionItems(instance) {
  const items = [];
  for (let ci = 0; ci < instance.k; ci += 1) {
    const clauseVertices = instance.vertices.filter((vertex) => vertex.clause === ci);
    const vertices = clauseVertices.map((vertex) => vertex.id);
    const labels = clauseVertices.map((vertex) => `${vertex.id}=${vertex.label}`).join(", ");
    items.push({
      title: `c${ci + 1}: ${vertices.join(", ")}`,
      explanation: state.language === "pt"
        ? `Criamos um vértice para cada ocorrência de literal da cláusula c${ci + 1}: ${labels}. Não há arestas dentro deste trio; isso força qualquer k-clique a escolher no máximo um literal desta cláusula.`
        : `Create one vertex for each literal occurrence in clause c${ci + 1}: ${labels}. No edges are placed inside this triple; that forces any k-clique to choose at most one literal from this clause.`,
      vertices
    });
  }
  for (let ci = 0; ci < instance.k; ci += 1) {
    for (let cj = ci + 1; cj < instance.k; cj += 1) {
      const verticesI = new Set(instance.vertices.filter((vertex) => vertex.clause === ci).map((vertex) => vertex.id));
      const verticesJ = new Set(instance.vertices.filter((vertex) => vertex.clause === cj).map((vertex) => vertex.id));
      const edges = instance.edges
        .filter(([a, b]) => (verticesI.has(a) && verticesJ.has(b)) || (verticesI.has(b) && verticesJ.has(a)))
        .map(([a, b]) => pairKey(a, b));
      const missing = instance.missing
        .filter(([a, b]) => (verticesI.has(a) && verticesJ.has(b)) || (verticesI.has(b) && verticesJ.has(a)))
        .map(([a, b]) => pairKey(a, b));
      items.push({
        title: `c${ci + 1} ↔ c${cj + 1}`,
        explanation: state.language === "pt"
          ? `Entre c${ci + 1} e c${cj + 1}, adicionamos arestas somente entre literais compatíveis. Foram adicionadas ${edges.length} aresta(s); ${missing.length} par(es) contraditório(s) ficou/ficaram sem aresta, pois um clique não pode conter x e ¬x ao mesmo tempo.`
          : `Between c${ci + 1} and c${cj + 1}, add edges only between compatible literals. This adds ${edges.length} edge(s); ${missing.length} contradictory pair(s) stay missing because a clique cannot contain both x and ¬x.`,
        edges,
        missing
      });
    }
  }
  items.push({
    title: `${tx().clique.targetK} = ${instance.k}`,
    explanation: state.language === "pt"
      ? `O alvo é k=${instance.k}, o número de cláusulas. Como não há arestas dentro de um trio, um clique de tamanho k precisa escolher exatamente um vértice de cada cláusula, e todas essas escolhas precisam ser mutuamente compatíveis.`
      : `The target is k=${instance.k}, the number of clauses. Because there are no edges inside a triple, a k-clique must choose exactly one vertex from each clause, and all chosen literals must be mutually compatible.`
  });
  return items;
}

function edgeSet(edges) {
  return new Set(edges.map(([a, b]) => pairKey(a, b)));
}

function pairKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function cliqueSolution(instance, assignment) {
  if (!assignment) {
    return [];
  }
  const selected = [];
  for (let ci = 0; ci < instance.k; ci += 1) {
    const vertex = instance.vertices.find((v) => v.clause === ci && evalLiteral(v.lit, assignment) === true);
    if (!vertex) {
      return [];
    }
    selected.push(vertex.id);
  }
  return selected;
}

function checkCliqueSelection(instance, selectedIds) {
  const selected = [...selectedIds];
  const verticesById = Object.fromEntries(instance.vertices.map((v) => [v.id, v]));
  const clauses = new Map();
  let allAdjacent = true;
  for (let i = 0; i < selected.length; i += 1) {
    const vertex = verticesById[selected[i]];
    if (vertex) {
      clauses.set(vertex.clause, (clauses.get(vertex.clause) ?? 0) + 1);
    }
    for (let j = i + 1; j < selected.length; j += 1) {
      if (!instance.edgeSet.has(pairKey(selected[i], selected[j]))) {
        allAdjacent = false;
      }
    }
  }
  const onePerClause = selected.length === instance.k && [...clauses.values()].every((count) => count === 1) && clauses.size === instance.k;
  const assignment = {};
  let conflict = false;
  for (const id of selected) {
    const vertex = verticesById[id];
    if (!vertex) {
      continue;
    }
    const value = !vertex.lit.neg;
    if (assignment[vertex.lit.name] !== undefined && assignment[vertex.lit.name] !== value) {
      conflict = true;
    }
    assignment[vertex.lit.name] = value;
  }
  return { valid: onePerClause && allAdjacent, onePerClause, allAdjacent, assignment, conflict };
}

function buildIndependentSetInstance(clauses) {
  const vertices = [];
  clauses.forEach((clause, ci) => {
    clause.forEach((lit, li) => {
      vertices.push({ id: `c${ci + 1}l${li + 1}`, clause: ci, occurrence: li, lit: copyLiteral(lit), label: formatLiteral(lit) });
    });
  });
  const clauseEdges = [];
  const conflictEdges = [];
  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = i + 1; j < vertices.length; j += 1) {
      const a = vertices[i];
      const b = vertices[j];
      if (a.clause === b.clause) {
        clauseEdges.push([a.id, b.id]);
      } else if (contradictory(a.lit, b.lit)) {
        conflictEdges.push([a.id, b.id]);
      }
    }
  }
  const edges = [...clauseEdges, ...conflictEdges];
  return { vertices, edges, clauseEdges, conflictEdges, k: clauses.length, edgeSet: edgeSet(edges) };
}

function independentSetConstructionItems(instance) {
  const items = [];
  for (let ci = 0; ci < instance.k; ci += 1) {
    const clauseVertices = instance.vertices.filter((vertex) => vertex.clause === ci);
    const vertices = clauseVertices.map((vertex) => vertex.id);
    const labels = clauseVertices.map((vertex) => `${vertex.id}=${vertex.label}`).join(", ");
    items.push({
      title: `c${ci + 1}: ${vertices.join(", ")}`,
      explanation: state.language === "pt"
        ? `Criamos um vértice para cada ocorrência de literal da cláusula c${ci + 1}: ${labels}. Por enquanto eles são apenas candidatos; as próximas arestas dirão quais candidatos não podem ser escolhidos juntos.`
        : `Create one vertex for each literal occurrence in clause c${ci + 1}: ${labels}. For now they are just candidates; the next edges will say which candidates cannot be chosen together.`,
      vertices
    });
    const edges = instance.clauseEdges
      .filter(([a, b]) => vertices.includes(a) && vertices.includes(b))
      .map(([a, b]) => pairKey(a, b));
    items.push({
      title: `${state.language === "pt" ? "triângulo" : "triangle"} c${ci + 1}`,
      explanation: state.language === "pt"
        ? `Adicionamos as três arestas dentro do trio de c${ci + 1}. Assim, um conjunto independente pode escolher no máximo um literal desta cláusula. Mesmo literais repetidos são ocorrências separadas, mas as arestas internas impedem escolher duas cópias da mesma cláusula.`
        : `Add the three edges inside the c${ci + 1} triple. Thus an independent set can choose at most one literal from this clause. Repeated literals are still separate occurrences, but the internal edges prevent choosing two copies from the same clause.`,
      edges
    });
  }
  for (let ci = 0; ci < instance.k; ci += 1) {
    for (let cj = ci + 1; cj < instance.k; cj += 1) {
      const verticesI = new Set(instance.vertices.filter((vertex) => vertex.clause === ci).map((vertex) => vertex.id));
      const verticesJ = new Set(instance.vertices.filter((vertex) => vertex.clause === cj).map((vertex) => vertex.id));
      const edges = instance.conflictEdges
        .filter(([a, b]) => (verticesI.has(a) && verticesJ.has(b)) || (verticesI.has(b) && verticesJ.has(a)))
        .map(([a, b]) => pairKey(a, b));
      items.push({
        title: `c${ci + 1} ↔ c${cj + 1}`,
        explanation: state.language === "pt"
          ? `Entre c${ci + 1} e c${cj + 1}, adicionamos arestas somente entre pares contraditórios. Foram adicionada(s) ${edges.length} aresta(s); pares compatíveis ficam sem aresta, pois podem aparecer juntos em um conjunto independente.`
          : `Between c${ci + 1} and c${cj + 1}, add edges only between contradictory pairs. This adds ${edges.length} edge(s); compatible pairs stay nonadjacent because they may appear together in an independent set.`,
        edges
      });
    }
  }
  items.push({
    title: `${tx().independentset.targetK} = ${instance.k}`,
    explanation: state.language === "pt"
      ? `O alvo é k=${instance.k}, o número de cláusulas. Como cada trio é um triângulo, um conjunto independente de tamanho k precisa escolher exatamente um vértice de cada cláusula; como arestas entre cláusulas marcam contradições, as escolhas não podem conter x e ¬x.`
      : `The target is k=${instance.k}, the number of clauses. Because each triple is a triangle, an independent set of size k must choose exactly one vertex from each clause; because cross-clause edges mark contradictions, the choices cannot contain both x and ¬x.`,
  });
  return items;
}

function independentSetSolution(instance, assignment) {
  if (!assignment) {
    return [];
  }
  const selected = [];
  for (let ci = 0; ci < instance.k; ci += 1) {
    const vertex = instance.vertices.find((v) => v.clause === ci && evalLiteral(v.lit, assignment) === true);
    if (!vertex) {
      return [];
    }
    selected.push(vertex.id);
  }
  return selected;
}

function checkIndependentSetSelection(instance, selectedIds) {
  const selected = [...selectedIds];
  const verticesById = Object.fromEntries(instance.vertices.map((v) => [v.id, v]));
  const clauses = new Map();
  let noSelectedEdges = true;
  for (let i = 0; i < selected.length; i += 1) {
    const vertex = verticesById[selected[i]];
    if (vertex) {
      clauses.set(vertex.clause, (clauses.get(vertex.clause) ?? 0) + 1);
    }
    for (let j = i + 1; j < selected.length; j += 1) {
      if (instance.edgeSet.has(pairKey(selected[i], selected[j]))) {
        noSelectedEdges = false;
      }
    }
  }
  const onePerClause = selected.length === instance.k && [...clauses.values()].every((count) => count === 1) && clauses.size === instance.k;
  const assignment = {};
  let conflict = false;
  for (const id of selected) {
    const vertex = verticesById[id];
    if (!vertex) {
      continue;
    }
    const value = !vertex.lit.neg;
    if (assignment[vertex.lit.name] !== undefined && assignment[vertex.lit.name] !== value) {
      conflict = true;
    }
    assignment[vertex.lit.name] = value;
  }
  return { valid: onePerClause && noSelectedEdges, onePerClause, noSelectedEdges, assignment, conflict };
}

function buildSubsetSumInstance(clauses) {
  const vars = formulaVariables(clauses);
  const rows = [];
  vars.forEach((name, vi) => {
    const yDigits = Array(vars.length + clauses.length).fill(0);
    const zDigits = Array(vars.length + clauses.length).fill(0);
    yDigits[vi] = 1;
    zDigits[vi] = 1;
    clauses.forEach((clause, ci) => {
      yDigits[vars.length + ci] = clause.some((lit) => lit.name === name && !lit.neg) ? 1 : 0;
      zDigits[vars.length + ci] = clause.some((lit) => lit.name === name && lit.neg) ? 1 : 0;
    });
    rows.push({ id: `y${vi + 1}`, kind: "truth", variable: name, value: true, label: `y${vi + 1}`, digits: yDigits });
    rows.push({ id: `z${vi + 1}`, kind: "truth", variable: name, value: false, label: `z${vi + 1}`, digits: zDigits });
  });
  clauses.forEach((_, ci) => {
    const digits = Array(vars.length + clauses.length).fill(0);
    digits[vars.length + ci] = 1;
    rows.push({ id: `g${ci + 1}`, kind: "slack", clause: ci, label: `g${ci + 1}`, digits: [...digits] });
    rows.push({ id: `h${ci + 1}`, kind: "slack", clause: ci, label: `h${ci + 1}`, digits: [...digits] });
  });
  const target = [...Array(vars.length).fill(1), ...Array(clauses.length).fill(3)];
  return {
    vars,
    clauses,
    rows,
    target,
    columns: [...vars, ...clauses.map((_, i) => `c${i + 1}`)]
  };
}

function subsetConstructionItems(instance) {
  const items = [{
    title: instance.columns.join(" | "),
    explanation: state.language === "pt"
      ? `A tabela tem ${instance.vars.length} coluna(s) de variável (${instance.vars.join(", ")}) e ${instance.clauses.length} coluna(s) de cláusula (${instance.clauses.map((_, i) => `c${i + 1}`).join(", ")}). As colunas de variável forçarão escolher exatamente uma linha de verdade por variável; as colunas de cláusula registram quais linhas de verdade poderiam satisfazer cada cláusula.`
      : `The table has ${instance.vars.length} variable column(s) (${instance.vars.join(", ")}) and ${instance.clauses.length} clause column(s) (${instance.clauses.map((_, i) => `c${i + 1}`).join(", ")}). Variable columns will force exactly one truth row per variable; clause columns record which truth rows could satisfy each clause.`,
    showColumns: true
  }];
  instance.vars.forEach((name, index) => {
    const y = instance.rows.find((row) => row.id === `y${index + 1}`);
    const z = instance.rows.find((row) => row.id === `z${index + 1}`);
    const yClauseDigits = y.digits.slice(instance.vars.length).map((digit, ci) => `c${ci + 1}=${digit}`).join(", ");
    const zClauseDigits = z.digits.slice(instance.vars.length).map((digit, ci) => `c${ci + 1}=${digit}`).join(", ");
    items.push({
      title: `y${index + 1}, z${index + 1}`,
      explanation: state.language === "pt"
        ? `Criamos duas linhas para ${name}. Tanto y${index + 1} quanto z${index + 1} têm dígito 1 na coluna ${name}, então atingir o alvo 1 nessa coluna obriga escolher exatamente uma delas. Nas colunas de cláusula, y${index + 1} coloca 1 onde o literal positivo ${name} aparece pelo menos uma vez (${yClauseDigits}); z${index + 1} coloca 1 onde o literal negativo ¬${name} aparece pelo menos uma vez (${zClauseDigits}). Se o mesmo literal se repete na cláusula, ainda usamos 1, pois o dígito registra que essa atribuição pode satisfazer a cláusula, não o número de cópias do literal.`
        : `Create two rows for ${name}. Both y${index + 1} and z${index + 1} have digit 1 in the ${name} column, so hitting target digit 1 there forces choosing exactly one of them. In clause columns, y${index + 1} places 1 where positive literal ${name} occurs at least once (${yClauseDigits}); z${index + 1} places 1 where negative literal ¬${name} occurs at least once (${zClauseDigits}). If the same literal is repeated in a clause, we still use 1 because the digit records that this assignment can satisfy the clause, not how many copies of the literal appear.`,
      rows: [`y${index + 1}`, `z${index + 1}`],
      showColumns: true
    });
  });
  instance.clauses.forEach((_, index) => {
    items.push({
      title: `g${index + 1}, h${index + 1}`,
      explanation: state.language === "pt"
        ? `As linhas g${index + 1} e h${index + 1} são cópias com dígito 1 apenas na coluna c${index + 1}. Elas são enchimento: depois que as linhas de verdade contribuem 1, 2 ou 3 para uma cláusula satisfeita, escolhemos zero, uma ou duas dessas linhas para completar o dígito-alvo 3. Se a cláusula recebeu 0 das linhas de verdade, duas linhas de enchimento ainda só chegam a 2, então a soma não pode atingir o alvo.`
        : `Rows g${index + 1} and h${index + 1} are identical fillers with digit 1 only in column c${index + 1}. After truth rows contribute 1, 2, or 3 to a satisfied clause, we choose zero, one, or two filler rows to reach target digit 3. If a clause received 0 from truth rows, two fillers only reach 2, so the target cannot be met.`,
      rows: [`g${index + 1}`, `h${index + 1}`],
      showColumns: true
    });
  });
  items.push({
    title: `t = ${instance.target.join("")}`,
    explanation: state.language === "pt"
      ? `O alvo é ${instance.target.join("")}: os primeiros ${instance.vars.length} dígitos são 1 para forçar exatamente uma escolha por variável, e os últimos ${instance.clauses.length} dígitos são 3 para forçar que cada cláusula receba pelo menos uma contribuição de literal verdadeiro. Como todos os totais de coluna ficam abaixo de 10, não há carry entre colunas.`
      : `The target is ${instance.target.join("")}: the first ${instance.vars.length} digits are 1 to force exactly one truth choice per variable, and the last ${instance.clauses.length} digits are 3 to force every clause to receive at least one true-literal contribution. Since all column totals stay below 10, no carry can move information between columns.`,
    showColumns: true,
    showTarget: true
  });
  return items;
}

function subsetSolution(instance, assignment) {
  if (!assignment) {
    return [];
  }
  const ids = [];
  instance.vars.forEach((name, index) => {
    ids.push(assignment[name] ? `y${index + 1}` : `z${index + 1}`);
  });
  const selectedTruthRows = instance.rows.filter((row) => ids.includes(row.id));
  instance.clauses.forEach((_, ci) => {
    const column = instance.vars.length + ci;
    const contribution = selectedTruthRows.reduce((sum, row) => sum + row.digits[column], 0);
    const slackNeeded = 3 - contribution;
    if (slackNeeded >= 1) {
      ids.push(`g${ci + 1}`);
    }
    if (slackNeeded >= 2) {
      ids.push(`h${ci + 1}`);
    }
  });
  return ids;
}

function sumRows(instance, selectedIds) {
  const selected = new Set(selectedIds);
  const sum = Array(instance.target.length).fill(0);
  instance.rows.forEach((row) => {
    if (!selected.has(row.id)) {
      return;
    }
    row.digits.forEach((digit, index) => {
      sum[index] += digit;
    });
  });
  return sum;
}

function checkSubsetSelection(instance, selectedIds) {
  const selected = new Set(selectedIds);
  const sum = sumRows(instance, selected);
  const reachesTarget = sum.every((digit, index) => digit === instance.target[index]);
  const assignment = {};
  const variableStatus = {};
  instance.vars.forEach((name, index) => {
    const hasY = selected.has(`y${index + 1}`);
    const hasZ = selected.has(`z${index + 1}`);
    variableStatus[name] = hasY !== hasZ;
    if (hasY !== hasZ) {
      assignment[name] = hasY;
    }
  });
  return {
    reachesTarget,
    sum,
    assignment,
    variablesOk: Object.values(variableStatus).every(Boolean),
    noCarry: sum.every((digit) => digit < 10)
  };
}

function buildVertexCoverInstance(clauses) {
  const vars = formulaVariables(clauses);
  const nodes = [];
  const edges = [];
  vars.forEach((name, vi) => {
    const pos = `v_${name}_pos`;
    const neg = `v_${name}_neg`;
    nodes.push({ id: pos, kind: "variable", variable: name, lit: { name, neg: false }, label: name, varIndex: vi });
    nodes.push({ id: neg, kind: "variable", variable: name, lit: { name, neg: true }, label: `¬${name}`, varIndex: vi });
    edges.push({ id: `e_var_${name}`, from: pos, to: neg, kind: "variable" });
  });
  clauses.forEach((clause, ci) => {
    const ids = clause.map((lit, li) => `c${ci + 1}l${li + 1}`);
    clause.forEach((lit, li) => {
      nodes.push({ id: ids[li], kind: "clause", clause: ci, occurrence: li, lit: copyLiteral(lit), label: formatLiteral(lit) });
      const target = `v_${lit.name}_${lit.neg ? "neg" : "pos"}`;
      edges.push({ id: `e_link_${ci + 1}_${li + 1}`, from: ids[li], to: target, kind: "link" });
    });
    edges.push(
      { id: `e_tri_${ci + 1}_12`, from: ids[0], to: ids[1], kind: "triangle" },
      { id: `e_tri_${ci + 1}_23`, from: ids[1], to: ids[2], kind: "triangle" },
      { id: `e_tri_${ci + 1}_13`, from: ids[0], to: ids[2], kind: "triangle" }
    );
  });
  return { vars, nodes, edges, K: vars.length + 2 * clauses.length };
}

function vertexCoverConstructionItems(instance) {
  const items = [];
  instance.vars.forEach((name) => {
    items.push({
      title: `${name} -- ¬${name}`,
      explanation: state.language === "pt"
        ? `O gadget de variável para ${name} é uma aresta entre ${name} e ¬${name}. Qualquer cobertura de vértices precisa escolher pelo menos uma ponta dessa aresta. Como K reserva apenas uma escolha por variável, escolher ${name} representa ${name}=verdadeiro e escolher ¬${name} representa ${name}=falso.`
        : `The variable gadget for ${name} is one edge between ${name} and ¬${name}. Any vertex cover must choose at least one endpoint of this edge. Because K budgets only one choice per variable, selecting ${name} represents ${name}=true and selecting ¬${name} represents ${name}=false.`,
      nodes: [`v_${name}_pos`, `v_${name}_neg`],
      edges: [`e_var_${name}`]
    });
  });
  const clauseCount = Math.max(...instance.nodes.filter((node) => node.kind === "clause").map((node) => node.clause)) + 1;
  for (let ci = 0; ci < clauseCount; ci += 1) {
    const labels = instance.nodes
      .filter((node) => node.kind === "clause" && node.clause === ci)
      .map((node) => node.label)
      .join(", ");
    items.push({
      title: `c${ci + 1}`,
      explanation: state.language === "pt"
        ? `A cláusula c${ci + 1} vira um triângulo com os literais ${labels}. Um triângulo precisa de pelo menos dois vértices na cobertura. Com orçamento K, exatamente um vértice do triângulo ficará fora; esse vértice fora será o literal usado para satisfazer a cláusula.`
        : `Clause c${ci + 1} becomes a triangle with literals ${labels}. Covering a triangle requires at least two vertices. Under budget K, exactly one triangle vertex is left out; that left-out vertex is the literal used to satisfy the clause.`,
      nodes: [`c${ci + 1}l1`, `c${ci + 1}l2`, `c${ci + 1}l3`],
      edges: [`e_tri_${ci + 1}_12`, `e_tri_${ci + 1}_23`, `e_tri_${ci + 1}_13`]
    });
  }
  for (let ci = 0; ci < clauseCount; ci += 1) {
    const links = instance.edges
      .filter((edge) => edge.kind === "link" && edge.id.startsWith(`e_link_${ci + 1}_`))
      .map((edge) => {
        const from = instance.nodes.find((node) => node.id === edge.from)?.label ?? edge.from;
        const to = instance.nodes.find((node) => node.id === edge.to)?.label ?? edge.to;
        return `${from}--${to}`;
      })
      .join(", ");
    items.push({
      title: `c${ci + 1} links`,
      explanation: state.language === "pt"
        ? `Agora conectamos cada ocorrência literal da cláusula ao vértice de variável com o mesmo literal: ${links}. Se uma ocorrência de cláusula ficar fora da cobertura, sua aresta conectora só pode ser coberta pelo vértice de variável correspondente; isso força a atribuição a tornar esse literal verdadeiro.`
        : `Now connect each clause-literal occurrence to the variable vertex with the same literal: ${links}. If a clause occurrence is left out of the cover, its connector edge can only be covered by the matching variable vertex; that forces the assignment to make that literal true.`,
      edges: [`e_link_${ci + 1}_1`, `e_link_${ci + 1}_2`, `e_link_${ci + 1}_3`]
    });
  }
  items.push({
    title: `${tx().vertexcover.targetK} = ${instance.K}`,
    explanation: state.language === "pt"
      ? `Definimos K=${instance.K}: uma escolha para cada uma das ${instance.vars.length} variáveis e duas escolhas para cada um dos ${clauseCount} triângulos de cláusula. Esse orçamento apertado impede escolhas extras e faz a cobertura codificar uma atribuição booleana.`
      : `Set K=${instance.K}: one choice for each of the ${instance.vars.length} variables and two choices for each of the ${clauseCount} clause triangles. This tight budget leaves no extra choices and makes the cover encode a Boolean assignment.`
  });
  return items;
}

function vertexCoverSolution(instance, clauses, assignment) {
  if (!assignment) {
    return [];
  }
  const selected = [];
  instance.vars.forEach((name) => {
    selected.push(`v_${name}_${assignment[name] ? "pos" : "neg"}`);
  });
  clauses.forEach((clause, ci) => {
    let leave = clause.findIndex((lit) => evalLiteral(lit, assignment) === true);
    if (leave < 0) {
      leave = 0;
    }
    clause.forEach((_, li) => {
      if (li !== leave) {
        selected.push(`c${ci + 1}l${li + 1}`);
      }
    });
  });
  return selected;
}

function checkVertexCover(instance, selectedIds) {
  const selected = new Set(selectedIds);
  const uncovered = instance.edges.filter((edge) => !selected.has(edge.from) && !selected.has(edge.to));
  const assignment = {};
  const varOk = {};
  instance.vars.forEach((name) => {
    const pos = selected.has(`v_${name}_pos`);
    const neg = selected.has(`v_${name}_neg`);
    varOk[name] = pos !== neg;
    if (pos !== neg) {
      assignment[name] = pos;
    }
  });
  return {
    valid: uncovered.length === 0 && selected.size <= instance.K,
    uncovered,
    sizeOk: selected.size <= instance.K,
    assignment,
    variablesOk: Object.values(varOk).every(Boolean)
  };
}

function buildHamPathInstance(clauses) {
  const vars = formulaVariables(clauses);
  const k = clauses.length;
  const nodes = [{ id: "s", kind: "terminal", label: "s" }, { id: "t", kind: "terminal", label: "t" }];
  const edges = [];
  const pairNode = {};
  vars.forEach((name, vi) => {
    const entry = `x${vi + 1}_entry`;
    const exit = `x${vi + 1}_exit`;
    nodes.push({ id: entry, kind: "entry", variable: name, label: `${name} ${ctext().entry}` });
    nodes.push({ id: exit, kind: "exit", variable: name, label: `${name} ${ctext().exit}` });
    const row = [];
    for (let r = 0; r < 3 * k + 1; r += 1) {
      const id = `x${vi + 1}_r${r}`;
      const isPair = r % 3 !== 0;
      const clauseIndex = isPair ? Math.floor(r / 3) : null;
      const side = r % 3 === 1 ? "L" : r % 3 === 2 ? "R" : "S";
      nodes.push({ id, kind: isPair ? "pair" : "separator", variable: name, rowIndex: r, clause: clauseIndex, side, label: isPair ? `${name}:${clauseIndex + 1}${side}` : "" });
      row.push(id);
      if (isPair) {
        pairNode[`${vi}:${clauseIndex}:${side}`] = id;
      }
    }
    if (vi === 0) {
      edges.push({ from: "s", to: entry, kind: "spine" });
    }
    if (vi > 0) {
      edges.push({ from: `x${vi}_exit`, to: entry, kind: "spine" });
    }
    if (vi === vars.length - 1) {
      edges.push({ from: exit, to: "t", kind: "spine" });
    }
    edges.push({ from: entry, to: row[0], kind: "diamond" }, { from: entry, to: row[row.length - 1], kind: "diamond" });
    edges.push({ from: row[row.length - 1], to: exit, kind: "diamond" }, { from: row[0], to: exit, kind: "diamond" });
    for (let r = 0; r < row.length - 1; r += 1) {
      edges.push({ from: row[r], to: row[r + 1], kind: "row" }, { from: row[r + 1], to: row[r], kind: "row" });
    }
  });
  clauses.forEach((clause, ci) => {
    const clauseNode = `c${ci + 1}`;
    nodes.push({ id: clauseNode, kind: "clause", clause: ci, label: `c${ci + 1}` });
    clause.forEach((lit) => {
      const vi = vars.indexOf(lit.name);
      if (vi < 0) {
        return;
      }
      const left = pairNode[`${vi}:${ci}:L`];
      const right = pairNode[`${vi}:${ci}:R`];
      if (lit.neg) {
        edges.push({ from: right, to: clauseNode, kind: "detour", literal: formatLiteral(lit) });
        edges.push({ from: clauseNode, to: left, kind: "detour", literal: formatLiteral(lit) });
      } else {
        edges.push({ from: left, to: clauseNode, kind: "detour", literal: formatLiteral(lit) });
        edges.push({ from: clauseNode, to: right, kind: "detour", literal: formatLiteral(lit) });
      }
    });
  });
  return { vars, nodes, edges, edgeSet: new Set(edges.map((edge) => `${edge.from}|${edge.to}`)), pairNode, clauses };
}

function hamEdgeKey(edge) {
  return `${edge.from}|${edge.to}|${edge.kind}|${edge.literal ?? ""}`;
}

function hampathConstructionItems(instance) {
  const items = [{
    title: "s, t",
    explanation: state.language === "pt"
      ? "Começamos com os vértices especiais s e t. A instância alvo pergunta se existe um caminho dirigido de s até t que visite todos os vértices exatamente uma vez."
      : "Start with the distinguished vertices s and t. The target instance asks for a directed path from s to t that visits every vertex exactly once.",
    nodes: ["s", "t"]
  }];
  instance.vars.forEach((name, vi) => {
    const prefix = `x${vi + 1}_`;
    const nodes = instance.nodes.filter((node) => node.id.startsWith(prefix)).map((node) => node.id);
    const pairCount = instance.clauses.length;
    const horizontalCount = 3 * instance.clauses.length + 1;
    const edges = instance.edges
      .filter((edge) => (edge.from.startsWith(prefix) || edge.from === "s") && (edge.to.startsWith(prefix) || edge.to === "t"))
      .map(hamEdgeKey);
    if (vi > 0) {
      edges.push(hamEdgeKey({ from: `x${vi}_exit`, to: `x${vi + 1}_entry`, kind: "spine" }));
    }
    items.push({
      title: name,
      explanation: state.language === "pt"
        ? `O gadget de ${name} é um losango dirigido com ${horizontalCount} nós horizontais: separadores e ${pairCount} par(es), um par para cada cláusula. O caminho pode atravessar o losango da esquerda para a direita para representar ${name}=verdadeiro, ou da direita para a esquerda para representar ${name}=falso. As arestas da espinha ligam este losango ao anterior/próximo para que os gadgets sejam visitados em ordem.`
        : `The gadget for ${name} is a directed diamond with ${horizontalCount} horizontal nodes: separators and ${pairCount} pair(s), one pair for each clause. The path can traverse the diamond left-to-right to represent ${name}=true, or right-to-left to represent ${name}=false. Spine edges connect this diamond to the previous/next gadget so variables are visited in order.`,
      nodes,
      edges
    });
  });
  instance.clauses.forEach((_, ci) => {
    items.push({
      title: `c${ci + 1}`,
      explanation: state.language === "pt"
        ? `A cláusula c${ci + 1} é representada por um único vértice. Esse vértice ainda não está na espinha principal; ele será visitado por um desvio a partir de algum literal que satisfaça a cláusula.`
        : `Clause c${ci + 1} is represented by a single vertex. This vertex is not on the main spine yet; it will be visited by a detour from some literal that satisfies the clause.`,
      nodes: [`c${ci + 1}`]
    });
  });
  instance.clauses.forEach((_, ci) => {
    const detours = instance.edges.filter((edge) => edge.kind === "detour" && (edge.from === `c${ci + 1}` || edge.to === `c${ci + 1}`));
    const literals = [...new Set(detours.map((edge) => edge.literal).filter(Boolean))].join(", ");
    items.push({
      title: `detours for c${ci + 1}`,
      explanation: state.language === "pt"
        ? `Adicionamos arestas de desvio para os literais de c${ci + 1}: ${literals}. Um literal positivo usa o par correspondente no sentido esquerda→direita; um literal negativo usa o sentido direita→esquerda. Assim, o desvio pelo vértice c${ci + 1} só encaixa quando a direção escolhida para o gadget torna aquele literal verdadeiro.`
        : `Add detour edges for the literals of c${ci + 1}: ${literals}. A positive literal uses the corresponding pair in the left-to-right direction; a negative literal uses the right-to-left direction. Thus the detour through vertex c${ci + 1} fits only when the chosen gadget direction makes that literal true.`,
      edges: detours.map(hamEdgeKey)
    });
  });
  return items;
}

function hampathSolution(instance, clauses, assignment) {
  if (!assignment) {
    return [];
  }
  const chosenClauseLiteral = new Map();
  clauses.forEach((clause, ci) => {
    const li = clause.findIndex((lit) => evalLiteral(lit, assignment) === true);
    if (li >= 0) {
      chosenClauseLiteral.set(ci, clause[li]);
    }
  });
  if (chosenClauseLiteral.size !== clauses.length) {
    return [];
  }
  const path = ["s"];
  instance.vars.forEach((name, vi) => {
    path.push(`x${vi + 1}_entry`);
    const rows = Array.from({ length: 3 * clauses.length + 1 }, (_, r) => `x${vi + 1}_r${r}`);
    const sequence = assignment[name] ? rows : [...rows].reverse();
    for (let idx = 0; idx < sequence.length; idx += 1) {
      const nodeId = sequence[idx];
      path.push(nodeId);
      const rowIndex = Number(/_r(\d+)$/.exec(nodeId)?.[1] ?? -1);
      if (rowIndex % 3 === 1 || rowIndex % 3 === 2) {
        const ci = Math.floor(rowIndex / 3);
        const chosen = chosenClauseLiteral.get(ci);
        if (chosen && chosen.name === name && chosen.neg !== assignment[name]) {
          const nextId = sequence[idx + 1];
          const isPositiveDetour = !chosen.neg && assignment[name] && rowIndex % 3 === 1 && nextId?.endsWith(`_r${rowIndex + 1}`);
          const isNegativeDetour = chosen.neg && !assignment[name] && rowIndex % 3 === 2 && nextId?.endsWith(`_r${rowIndex - 1}`);
          if (isPositiveDetour || isNegativeDetour) {
            path.push(`c${ci + 1}`);
            chosenClauseLiteral.delete(ci);
          }
        }
      }
    }
    path.push(`x${vi + 1}_exit`);
  });
  path.push("t");
  return chosenClauseLiteral.size === 0 ? path : [];
}

function checkHamPath(instance, selectedPath) {
  const seen = new Set();
  let unique = true;
  selectedPath.forEach((id) => {
    if (seen.has(id)) {
      unique = false;
    }
    seen.add(id);
  });
  const followsEdges = selectedPath.every((id, index) => {
    if (index === selectedPath.length - 1) {
      return true;
    }
    return instance.edgeSet.has(`${id}|${selectedPath[index + 1]}`);
  });
  const startsEnds = selectedPath[0] === "s" && selectedPath[selectedPath.length - 1] === "t";
  const visitsAll = unique && selectedPath.length === instance.nodes.length && instance.nodes.every((node) => seen.has(node.id));
  return { valid: startsEnds && followsEdges && visitsAll, startsEnds, followsEdges, visitsAll };
}

function reductionState(key) {
  return state.reductions[key];
}

function currentPresetGroup(key) {
  return key === "sat3" ? PRESETS.sat3 : PRESETS.threesat;
}

function parseReductionFormula(key) {
  const require3 = key !== "sat3";
  const clauses = parseFormula(reductionState(key).input, { require3 });
  const vars = formulaVariables(clauses);
  const sat = findSatisfyingAssignment(clauses, 12);
  return { clauses, vars, sat };
}

function formulaLayoutKey(reduction, clauses) {
  return `${reduction}|${formatFormula(clauses)}`;
}

function graphLayoutBucket(reduction, layoutKey) {
  if (!state.graphLayouts[reduction]) {
    state.graphLayouts[reduction] = {};
  }
  if (!state.graphLayouts[reduction][layoutKey]) {
    state.graphLayouts[reduction][layoutKey] = {};
  }
  return state.graphLayouts[reduction][layoutKey];
}

function getGraphOffset(reduction, layoutKey, nodeId) {
  return graphLayoutBucket(reduction, layoutKey)[nodeId] ?? { x: 0, y: 0 };
}

function updateGraphOffset(reduction, layoutKey, nodeId, offset) {
  graphLayoutBucket(reduction, layoutKey)[nodeId] = offset;
}

function offsetGraphPositions(basePositions, reduction, layoutKey) {
  return Object.fromEntries(Object.entries(basePositions).map(([id, point]) => {
    const offset = getGraphOffset(reduction, layoutKey, id);
    return [id, { x: point.x + (offset.x ?? 0), y: point.y + (offset.y ?? 0), baseX: point.x, baseY: point.y }];
  }));
}

function graphDragAttrs(reduction, layoutKey, nodeId, basePoint, width, height, radius) {
  return `
    data-drag-item
    data-reduction="${attr(reduction)}"
    data-layout-key="${attr(layoutKey)}"
    data-node-id="${attr(nodeId)}"
    data-drag-axis="xy"
    data-min-x-offset="${radius + 18 - basePoint.x}"
    data-max-x-offset="${width - radius - 18 - basePoint.x}"
    data-min-y-offset="${radius + 18 - basePoint.y}"
    data-max-y-offset="${height - radius - 18 - basePoint.y}"
  `;
}

function constructionView(key, items) {
  const rstate = reductionState(key);
  const total = items.length;
  const visibleCount = rstate.constructing ? Math.min(rstate.buildIndex, total) : total;
  const currentItem = rstate.constructing && visibleCount > 0 ? items[visibleCount - 1] : null;
  return { active: rstate.constructing, total, visibleCount, currentItem };
}

function accumConstruction(items, visibleCount) {
  const result = {
    vertices: new Set(),
    nodes: new Set(),
    edges: new Set(),
    missing: new Set(),
    rows: new Set(),
    showTarget: false,
    showColumns: false
  };
  items.slice(0, visibleCount).forEach((item) => {
    item.vertices?.forEach((id) => result.vertices.add(id));
    item.nodes?.forEach((id) => result.nodes.add(id));
    item.edges?.forEach((id) => result.edges.add(id));
    item.missing?.forEach((id) => result.missing.add(id));
    item.rows?.forEach((id) => result.rows.add(id));
    if (item.showTarget) {
      result.showTarget = true;
    }
    if (item.showColumns) {
      result.showColumns = true;
    }
  });
  return result;
}

function renderHeader() {
  const text = tx();
  document.documentElement.lang = text.htmlLang;
  document.title = text.pageTitle;
  document.querySelector('meta[name="description"]')?.setAttribute("content", text.metaDescription);
  document.getElementById("eyebrow").textContent = text.eyebrow;
  document.getElementById("pageTitle").textContent = text.heading;
  document.getElementById("subtitle").textContent = text.subtitle;
  themeToggle.textContent = state.theme === "dark" ? "☀" : "☾";
  themeToggle.title = state.theme === "dark" ? text.themeToLight : text.themeToDark;
  themeToggle.setAttribute("aria-label", themeToggle.title);
  themeToggle.setAttribute("aria-pressed", String(state.theme === "dark"));
  languageToggle.textContent = text.languageButton;
  languageToggle.title = text.languageTitle;
  languageToggle.setAttribute("aria-label", text.languageTitle);
  languageToggle.setAttribute("aria-pressed", String(state.language === "pt"));
}

function renderTabs() {
  const labels = tx().tabs;
  tabBar.innerHTML = `<div class="tab-list">${TAB_IDS.map((id) => `
    <button class="tab-button ${state.activeTab === id ? "is-active" : ""}" type="button" data-action="tab" data-tab="${id}">
      ${escapeHtml(labels[id])}
    </button>
  `).join("")}</div>`;
}

function renderFooter() {
  const repoLabel = state.language === "pt" ? "Repositório do projeto:" : "Project repository:";
  const licenseLabel = state.language === "pt" ? "Licença MIT" : "MIT License";
  const credit = state.language === "pt" ? "Desenvolvido com assistência do Codex GPT-5.5." : "Developed with assistance from Codex GPT-5.5.";
  document.getElementById("footer").innerHTML = `
    <p>&copy; 2026 <a href="https://brunogrisci.github.io/" target="_blank" rel="noopener noreferrer">Prof. Bruno Iochins Grisci</a> · <a href="https://www.inf.ufrgs.br/site/" target="_blank" rel="noopener noreferrer">Instituto de Informática</a> · <a href="https://www.ufrgs.br/site/" target="_blank" rel="noopener noreferrer">UFRGS</a></p>
    <p>${escapeHtml(repoLabel)} <a href="https://github.com/BrunoGrisci/np-complete_reductions" target="_blank" rel="noopener noreferrer">np-complete_reductions</a> · <a href="LICENSE" target="_blank" rel="noopener noreferrer">${escapeHtml(licenseLabel)}</a></p>
    <p>${escapeHtml(credit)}</p>
  `;
}

function renderOverview() {
  const text = tx().overview;
  workspace.innerHTML = `
    <div class="full-grid">
      <section class="band">
        <h2>${escapeHtml(text.title)}</h2>
        <p>${escapeHtml(text.intro)}</p>
        <ol class="dense-list">${text.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
      </section>
      <section class="band">
        <h2>${escapeHtml(text.mapTitle)}</h2>
        <div class="reduction-map">
          ${["SAT → 3SAT", "3SAT → CLIQUE", "3SAT → INDEPENDENT-SET", "3SAT → SUBSET-SUM", "3SAT → VERTEX-COVER", "3SAT → HAMPATH"].map((label, index) => `
            <article class="map-edge">
              <strong>${escapeHtml(label)}</strong>
              <span>${escapeHtml(text.mapText[index])}</span>
            </article>
          `).join("")}
        </div>
        <p>${escapeHtml(text.npNote)}</p>
      </section>
    </div>
  `;
}

function inputPanel(key, localText) {
  const rstate = reductionState(key);
  const presets = currentPresetGroup(key);
  const presetLabels = localText.presets;
  return `
    <section class="tool-panel">
      <div class="panel-header">
        <h2>${escapeHtml(ctext().input)}</h2>
      </div>
      <div class="input-grid">
        <div class="field">
          <label for="${key}Preset">${escapeHtml(ctext().preset)}</label>
          <select id="${key}Preset" data-action="preset" data-reduction="${key}">
            ${Object.keys(presets).map((id) => `<option value="${id}" ${rstate.preset === id ? "selected" : ""}>${escapeHtml(presetLabels[id] ?? id)}</option>`).join("")}
          </select>
          ${localText.presetNotes?.[rstate.preset] ? `<p class="small-copy">${escapeHtml(localText.presetNotes[rstate.preset])}</p>` : ""}
        </div>
        <div class="field">
          <label for="${key}Input">${escapeHtml(ctext().formula)}</label>
          <textarea id="${key}Input" data-formula-input="${key}" spellcheck="false">${escapeHtml(rstate.input)}</textarea>
          <div class="toolbar">
            <button class="control" type="button" data-action="apply-input" data-reduction="${key}">${escapeHtml(ctext().useInput)}</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function definitionsPanel(localText) {
  return `
    <section class="band definition-grid">
      <div>
        <h2>${escapeHtml(ctext().sourceProblem)}</h2>
        <p>${escapeHtml(localText.sourceDef)}</p>
      </div>
      <div>
        <h2>${escapeHtml(ctext().targetProblem)}</h2>
        <p>${escapeHtml(localText.targetDef)}</p>
      </div>
    </section>
  `;
}

function statusPanels(context, targetYes, targetLabel) {
  const sourceKnown = !context.sat.skipped;
  const sourceYes = Boolean(context.sat.assignment);
  return `
    <section class="band">
      <h2>${escapeHtml(ctext().solutionChecker)}</h2>
      <div class="status-grid compare-grid">
        <article class="status-box ${sourceKnown ? (sourceYes ? "is-good" : "is-bad") : "is-warn"}">
          <h3>${escapeHtml(ctext().sourceAnswer)}</h3>
          <p><strong>${sourceKnown ? escapeHtml(sourceYes ? ctext().satisfiable : ctext().unsatisfiable) : escapeHtml(ctext().notChecked)}</strong></p>
        </article>
        <article class="status-box ${targetYes ? "is-good" : "is-bad"}">
          <h3>${escapeHtml(ctext().targetAnswer)}</h3>
          <p><strong>${escapeHtml(targetYes ? ctext().yesInstance : ctext().noInstance)}</strong>${targetLabel ? ` · ${escapeHtml(targetLabel)}` : ""}</p>
        </article>
      </div>
      <p>${escapeHtml(ctext().bruteForceNote)}</p>
    </section>
  `;
}

function stepperPanel(key, stepsOrItems) {
  const rstate = reductionState(key);
  const items = stepsOrItems.map((item, index) => typeof item === "string" ? { title: item, explanation: item, index } : item);
  const total = items.length;
  const visible = rstate.constructing ? Math.min(rstate.buildIndex, total) : total;
  const currentItem = rstate.constructing && visible > 0 ? items[visible - 1] : null;
  const note = rstate.constructing
    ? currentItem?.explanation ?? ctext().constructionEmpty
    : ctext().constructionIdle;
  return `
    <section class="tool-panel stepper">
      <div class="stepper-top">
        <h2>${escapeHtml(ctext().construction)}</h2>
        <span class="pill">${rstate.constructing ? `${escapeHtml(ctext().added)} ${visible}/${total}` : escapeHtml(ctext().constructionComplete)}</span>
      </div>
      <div class="step-dots">${items.map((_, index) => `<span class="step-dot ${index < visible ? "is-active" : ""}"></span>`).join("")}</div>
      <article class="step-card is-active">
        <h3>${escapeHtml(currentItem?.title ?? (rstate.constructing ? ctext().emptyConstruction : ctext().constructionComplete))}</h3>
        <p>${escapeHtml(note)}</p>
      </article>
      <div class="toolbar">
        ${rstate.constructing
          ? `
            <button class="control" type="button" data-action="construction-previous" data-reduction="${key}" ${visible <= 0 ? "disabled" : ""}>${escapeHtml(ctext().previous)}</button>
            <button class="control" type="button" data-action="construction-next" data-reduction="${key}" ${visible >= total ? "disabled" : ""}>${escapeHtml(ctext().next)}</button>
            <button class="control" type="button" data-action="construction-cancel" data-reduction="${key}">${escapeHtml(ctext().cancel)}</button>
          `
          : `<button class="control" type="button" data-action="construction-start" data-reduction="${key}">${escapeHtml(ctext().start)}</button>`
        }
      </div>
    </section>
  `;
}

function proofPanel(localText) {
  return `
    <section class="proof-panel">
      <h2>${escapeHtml(ctext().proof)}</h2>
      <div class="formula-list">
        <article class="proof-card"><h3>${escapeHtml(ctext().forward)}</h3><p>${escapeHtml(localText.proofForward)}</p></article>
        <article class="proof-card"><h3>${escapeHtml(ctext().reverse)}</h3><p>${escapeHtml(localText.proofReverse)}</p></article>
        <article class="proof-card"><h3>${escapeHtml(ctext().polynomial)}</h3><p>${escapeHtml(localText.proofPoly)}</p></article>
      </div>
    </section>
    <section class="proof-panel mistake-box">
      <h2>${escapeHtml(ctext().mistakes)}</h2>
      <p>${escapeHtml(localText.mistake)}</p>
    </section>
  `;
}

function sourceFormulaPanel(context) {
  const assignment = context.sat.assignment;
  return `
    <section class="visual-panel">
      <div class="visual-header">
        <h2>${escapeHtml(ctext().sourceInstance)}</h2>
        <span class="pill">${context.vars.length} ${escapeHtml(ctext().variables)} · ${context.clauses.length} ${escapeHtml(ctext().clauses)}</span>
      </div>
      <div class="visual-body">
        <div class="formula-list">${context.clauses.map((clause, index) => {
          const value = assignment ? evalClause(clause, assignment) : undefined;
          return `<article class="formula-card ${value === true ? "is-satisfied" : value === false ? "is-unsatisfied" : ""}">
            <h3>c${index + 1}</h3>
            <code class="formula-line">${escapeHtml(formatClause(clause))}</code>
          </article>`;
        }).join("")}</div>
      </div>
    </section>
  `;
}

function renderSat3() {
  const localText = tx().sat3;
  let body = `${definitionsPanel(localText)}${inputPanel("sat3", localText)}`;
  try {
    const context = parseReductionFormula("sat3");
    const reduction = reduceCNFTo3CNF(context.clauses);
    const targetSat = context.sat.assignment
      ? findSatisfyingAssignment(reduction.clauses, 14, context.sat.assignment)
      : findSatisfyingAssignment(reduction.clauses, 14);
    const targetYes = targetSat.skipped ? Boolean(context.sat.assignment) : Boolean(targetSat.assignment);
    const constructionItems = sat3ConstructionItems(reduction);
    const construction = constructionView("sat3", constructionItems);
    body += `
      <div class="page-grid">
        <div class="main-column">
          ${sourceFormulaPanel(context)}
          ${sat3ReductionPanel(context, reduction, construction)}
          ${sat3TruthTablePanel(context, reduction)}
        </div>
        <aside class="side-column">
          ${statusPanels(context, targetYes, `${reduction.clauses.length} ${ctext().clauses}`)}
          ${stepperPanel("sat3", constructionItems)}
          ${sat3ComparePanel(context, reduction, targetSat)}
          ${proofPanel(localText)}
        </aside>
      </div>
    `;
  } catch (error) {
    body += errorPanel(error);
  }
  workspace.innerHTML = body;
}

function sat3ReductionPanel(context, reduction, construction) {
  const aux = new Set(reduction.auxVars);
  const visibleSteps = construction?.active ? reduction.steps.slice(0, construction.visibleCount) : reduction.steps;
  return `
    <section class="visual-panel">
      <div class="visual-header">
        <h2>${escapeHtml(tx().sat3.reducedFormula)}</h2>
        <span class="pill">${construction?.active ? `${construction.visibleCount}/${construction.total}` : `${escapeHtml(tx().sat3.auxVars)}: ${reduction.auxVars.length ? escapeHtml(reduction.auxVars.join(", ")) : escapeHtml(ctext().none)}`}</span>
      </div>
      <div class="visual-body">
        ${visibleSteps.length === 0 ? `<div class="construction-empty">${escapeHtml(ctext().emptyConstruction)}</div>` : ""}
        <div class="formula-list">${visibleSteps.map((step) => `
          <article class="formula-card">
            <h3>c${step.clauseIndex + 1}: ${escapeHtml(formatClause(step.original))}</h3>
            <p>${escapeHtml(clauseTypeText(step.type))}</p>
            <div class="clause-group">
              ${step.generated.map((clause) => `<span class="literal-pill">${clause.map((lit) => `<span class="${aux.has(lit.name) ? "is-aux" : "is-source"}">${escapeHtml(formatLiteral(lit))}</span>`).join(" ∨ ")}</span>`).join("")}
            </div>
          </article>
        `).join("")}</div>
      </div>
    </section>
  `;
}

function sat3TruthTablePanel(context, reduction) {
  const vars = context.vars;
  if (vars.length > 4) {
    return `
      <section class="visual-panel">
        <div class="visual-header"><h2>${escapeHtml(tx().sat3.truthTable)}</h2></div>
        <div class="visual-body"><p>${escapeHtml(ctext().tooManyVariables)}</p></div>
      </section>
    `;
  }
  const rows = [];
  const total = 1 << vars.length;
  for (let mask = 0; mask < total; mask += 1) {
    const assignment = {};
    vars.forEach((name, index) => {
      assignment[name] = Boolean(mask & (1 << index));
    });
    const original = evalFormula(context.clauses, assignment);
    const extension = findSatisfyingAssignment(reduction.clauses, 10, assignment);
    rows.push({ assignment, original, extension: Boolean(extension.assignment) });
  }
  return `
    <section class="visual-panel">
      <div class="visual-header"><h2>${escapeHtml(tx().sat3.truthTable)}</h2></div>
      <div class="visual-body">
        <div class="table-wrap">
          <table class="truth-table">
            <thead><tr>${vars.map((name) => `<th>${escapeHtml(name)}</th>`).join("")}<th>CNF</th><th>3CNF ∃aux</th></tr></thead>
            <tbody>${rows.map((row) => `<tr>
              ${vars.map((name) => `<td>${row.assignment[name] ? "1" : "0"}</td>`).join("")}
              <td>${row.original ? "✓" : "×"}</td>
              <td>${row.extension ? "✓" : "×"}</td>
            </tr>`).join("")}</tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function sat3ComparePanel(context, reduction, targetSat) {
  const sourceAssignment = context.sat.assignment;
  const targetAssignment = targetSat.assignment;
  return `
    <section class="tool-panel">
      <h2>${escapeHtml(ctext().compare)}</h2>
      <p>${escapeHtml(tx().sat3.checkerHelp)}</p>
      <div class="compare-grid">
        <div class="mini-box"><h3>${escapeHtml(ctext().assignment)}</h3>${assignmentHtml(sourceAssignment, context.vars)}</div>
        <div class="mini-box"><h3>${escapeHtml(ctext().targetSolution)}</h3>${assignmentHtml(targetAssignment, formulaVariables(reduction.clauses))}</div>
      </div>
    </section>
  `;
}

function renderClique() {
  renderGraphReduction("clique", tx().clique, buildCliqueView);
}

function renderIndependentSet() {
  renderGraphReduction("independentset", tx().independentset, buildIndependentSetView);
}

function renderSubsetSum() {
  renderGraphReduction("subsetsum", tx().subsetsum, buildSubsetSumView);
}

function renderVertexCover() {
  renderGraphReduction("vertexcover", tx().vertexcover, buildVertexCoverView);
}

function renderHamPath() {
  renderGraphReduction("hampath", tx().hampath, buildHamPathView);
}

function renderGraphReduction(key, localText, viewBuilder) {
  let body = `${definitionsPanel(localText)}${inputPanel(key, localText)}`;
  try {
    const context = parseReductionFormula(key);
    body += viewBuilder(context, localText);
  } catch (error) {
    body += errorPanel(error);
  }
  workspace.innerHTML = body;
}

function buildCliqueView(context, localText) {
  const instance = buildCliqueInstance(context.clauses);
  const solution = cliqueSolution(instance, context.sat.assignment);
  const rstate = reductionState("clique");
  const check = checkCliqueSelection(instance, rstate.selected);
  const layoutKey = formulaLayoutKey("clique", context.clauses);
  const constructionItems = cliqueConstructionItems(instance);
  const construction = constructionView("clique", constructionItems);
  return `
    <div class="page-grid">
      <div class="main-column">
        ${sourceFormulaPanel(context)}
        <section class="visual-panel">
          <div class="visual-header">
            <h2>${escapeHtml(ctext().targetInstance)}</h2>
            <span class="pill">${escapeHtml(localText.targetK)} = ${instance.k}</span>
          </div>
          <div class="visual-body">
            <p>${escapeHtml(`${localText.clickHelp} ${ctext().dragGraphNodes}`)}</p>
            ${renderCliqueSvg(instance, rstate.selected, new Set(solution), layoutKey, construction)}
          </div>
        </section>
      </div>
      <aside class="side-column">
        ${statusPanels(context, Boolean(context.sat.assignment), `k = ${instance.k}`)}
        ${stepperPanel("clique", constructionItems)}
        ${cliqueCheckerPanel(check, solution)}
        ${proofPanel(localText)}
      </aside>
    </div>
  `;
}

function cliqueCheckerPanel(check, solution) {
  return `
    <section class="tool-panel">
      <h2>${escapeHtml(ctext().solutionChecker)}</h2>
      <div class="formula-list">
        <article class="status-box ${check.onePerClause ? "is-good" : "is-bad"}"><h3>${escapeHtml(tx().clique.onePerClause)}</h3></article>
        <article class="status-box ${check.allAdjacent ? "is-good" : "is-bad"}"><h3>${escapeHtml(tx().clique.allAdjacent)}</h3></article>
      </div>
      <div class="toolbar" style="margin-top:10px">
        <button class="control" type="button" data-action="show-solution" data-reduction="clique" ${solution.length ? "" : "disabled"}>${escapeHtml(ctext().showSolution)}</button>
        <button class="control" type="button" data-action="reset-selection" data-reduction="clique">${escapeHtml(ctext().resetSelection)}</button>
      </div>
      <h3 style="margin-top:12px">${escapeHtml(tx().clique.inducedAssignment)}</h3>
      ${assignmentHtml(check.assignment)}
    </section>
  `;
}

function renderCliqueSvg(instance, selectedIds, solutionIds, layoutKey, construction = null) {
  const selected = new Set(selectedIds);
  const visible = construction?.active ? accumConstruction(cliqueConstructionItems(instance), construction.visibleCount) : null;
  const width = Math.max(760, instance.k * 180 + 80);
  const height = 360;
  const basePositions = {};
  instance.vertices.forEach((vertex) => {
    basePositions[vertex.id] = {
      x: 90 + vertex.clause * 180,
      y: 100 + vertex.occurrence * 82
    };
  });
  const positions = offsetGraphPositions(basePositions, "clique", layoutKey);
  const edgeHtml = instance.edges
    .filter(([a, b]) => !visible || (visible.edges.has(pairKey(a, b)) && visible.vertices.has(a) && visible.vertices.has(b)))
    .map(([a, b]) => lineSvg(positions[a], positions[b], `graph-edge ${selected.has(a) && selected.has(b) ? "is-selected" : "is-soft"}`)).join("");
  const missingHtml = instance.missing
    .filter(([a, b]) => !visible || (visible.missing.has(pairKey(a, b)) && visible.vertices.has(a) && visible.vertices.has(b)))
    .map(([a, b]) => lineSvg(positions[a], positions[b], "graph-edge is-missing")).join("");
  const groupLabels = Array.from({ length: instance.k }, (_, ci) => {
    const clauseVisible = !visible || instance.vertices.some((vertex) => vertex.clause === ci && visible.vertices.has(vertex.id));
    return clauseVisible ? `<text class="svg-small" x="${90 + ci * 180}" y="38">c${ci + 1}</text>` : "";
  }).join("");
  const nodes = instance.vertices.filter((vertex) => !visible || visible.vertices.has(vertex.id)).map((vertex) => {
    const pos = positions[vertex.id];
    const cls = [
      "graph-node",
      selected.has(vertex.id) ? "is-selected" : "",
      solutionIds.has(vertex.id) ? "is-solution" : ""
    ].filter(Boolean).join(" ");
    return `<g class="draggable-item drag-xy" data-action="clique-node" data-id="${attr(vertex.id)}" ${graphDragAttrs("clique", layoutKey, vertex.id, basePositions[vertex.id], width, height, 25)}>
      <title>${attr(`c${vertex.clause + 1}: ${vertex.label}`)}</title>
      <circle class="${cls}" cx="${pos.x}" cy="${pos.y}" r="25"></circle>
      <text class="svg-label" x="${pos.x}" y="${pos.y}">${escapeHtml(vertex.label)}</text>
    </g>`;
  }).join("");
  const empty = construction?.active && construction.visibleCount === 0 ? `<text class="svg-small" x="${width / 2}" y="${height / 2}">${escapeHtml(ctext().emptyConstruction)}</text>` : "";
  return `<svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" data-graph-svg>${missingHtml}${edgeHtml}${groupLabels}${empty}${nodes}</svg>`;
}

function lineSvg(a, b, cls) {
  return `<line class="${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>`;
}

function buildIndependentSetView(context, localText) {
  const instance = buildIndependentSetInstance(context.clauses);
  const solution = independentSetSolution(instance, context.sat.assignment);
  const rstate = reductionState("independentset");
  const check = checkIndependentSetSelection(instance, rstate.selected);
  const layoutKey = formulaLayoutKey("independentset", context.clauses);
  const constructionItems = independentSetConstructionItems(instance);
  const construction = constructionView("independentset", constructionItems);
  return `
    <div class="page-grid">
      <div class="main-column">
        ${sourceFormulaPanel(context)}
        <section class="visual-panel">
          <div class="visual-header">
            <h2>${escapeHtml(ctext().targetInstance)}</h2>
            <span class="pill">${escapeHtml(localText.targetK)} = ${instance.k}</span>
          </div>
          <div class="visual-body">
            <p>${escapeHtml(`${localText.clickHelp} ${ctext().dragGraphNodes}`)}</p>
            ${renderIndependentSetSvg(instance, rstate.selected, new Set(solution), layoutKey, construction)}
          </div>
        </section>
      </div>
      <aside class="side-column">
        ${statusPanels(context, Boolean(context.sat.assignment), `k = ${instance.k}`)}
        ${stepperPanel("independentset", constructionItems)}
        ${independentSetCheckerPanel(check, solution)}
        ${proofPanel(localText)}
      </aside>
    </div>
  `;
}

function independentSetCheckerPanel(check, solution) {
  return `
    <section class="tool-panel">
      <h2>${escapeHtml(ctext().solutionChecker)}</h2>
      <div class="formula-list">
        <article class="status-box ${check.onePerClause ? "is-good" : "is-bad"}"><h3>${escapeHtml(tx().independentset.onePerClause)}</h3></article>
        <article class="status-box ${check.noSelectedEdges ? "is-good" : "is-bad"}"><h3>${escapeHtml(tx().independentset.noSelectedEdges)}</h3></article>
      </div>
      <div class="toolbar" style="margin-top:10px">
        <button class="control" type="button" data-action="show-solution" data-reduction="independentset" ${solution.length ? "" : "disabled"}>${escapeHtml(ctext().showSolution)}</button>
        <button class="control" type="button" data-action="reset-selection" data-reduction="independentset">${escapeHtml(ctext().resetSelection)}</button>
      </div>
      <h3 style="margin-top:12px">${escapeHtml(tx().independentset.inducedAssignment)}</h3>
      ${assignmentHtml(check.assignment)}
    </section>
  `;
}

function renderIndependentSetSvg(instance, selectedIds, solutionIds, layoutKey, construction = null) {
  const selected = new Set(selectedIds);
  const visible = construction?.active ? accumConstruction(independentSetConstructionItems(instance), construction.visibleCount) : null;
  const width = Math.max(760, instance.k * 180 + 80);
  const height = 360;
  const basePositions = {};
  instance.vertices.forEach((vertex) => {
    basePositions[vertex.id] = {
      x: 90 + vertex.clause * 180,
      y: 100 + vertex.occurrence * 82
    };
  });
  const positions = offsetGraphPositions(basePositions, "independentset", layoutKey);
  const edgeHtml = instance.edges
    .filter(([a, b]) => !visible || (visible.edges.has(pairKey(a, b)) && visible.vertices.has(a) && visible.vertices.has(b)))
    .map(([a, b]) => {
      const invalidSelected = selected.has(a) && selected.has(b);
      const isClauseEdge = instance.clauseEdges.some(([x, y]) => pairKey(x, y) === pairKey(a, b));
      return lineSvg(positions[a], positions[b], `graph-edge ${invalidSelected ? "is-uncovered" : isClauseEdge ? "" : "is-soft"}`);
    }).join("");
  const groupLabels = Array.from({ length: instance.k }, (_, ci) => {
    const clauseVisible = !visible || instance.vertices.some((vertex) => vertex.clause === ci && visible.vertices.has(vertex.id));
    return clauseVisible ? `<text class="svg-small" x="${90 + ci * 180}" y="38">c${ci + 1}</text>` : "";
  }).join("");
  const nodes = instance.vertices.filter((vertex) => !visible || visible.vertices.has(vertex.id)).map((vertex) => {
    const pos = positions[vertex.id];
    const cls = [
      "graph-node",
      selected.has(vertex.id) ? "is-selected" : "",
      solutionIds.has(vertex.id) ? "is-solution" : ""
    ].filter(Boolean).join(" ");
    return `<g class="draggable-item drag-xy" data-action="independent-node" data-id="${attr(vertex.id)}" ${graphDragAttrs("independentset", layoutKey, vertex.id, basePositions[vertex.id], width, height, 25)}>
      <title>${attr(`c${vertex.clause + 1}: ${vertex.label}`)}</title>
      <circle class="${cls}" cx="${pos.x}" cy="${pos.y}" r="25"></circle>
      <text class="svg-label" x="${pos.x}" y="${pos.y}">${escapeHtml(vertex.label)}</text>
    </g>`;
  }).join("");
  const empty = construction?.active && construction.visibleCount === 0 ? `<text class="svg-small" x="${width / 2}" y="${height / 2}">${escapeHtml(ctext().emptyConstruction)}</text>` : "";
  return `<svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" data-graph-svg>${edgeHtml}${groupLabels}${empty}${nodes}</svg>`;
}

function buildSubsetSumView(context, localText) {
  const instance = buildSubsetSumInstance(context.clauses);
  const solution = subsetSolution(instance, context.sat.assignment);
  const rstate = reductionState("subsetsum");
  const check = checkSubsetSelection(instance, rstate.selected);
  const constructionItems = subsetConstructionItems(instance);
  const construction = constructionView("subsetsum", constructionItems);
  return `
    <div class="page-grid">
      <div class="main-column">
        ${sourceFormulaPanel(context)}
        <section class="visual-panel">
          <div class="visual-header">
            <h2>${escapeHtml(localText.table)}</h2>
            <span class="pill">${escapeHtml(localText.noCarry)}</span>
          </div>
          <div class="visual-body">
            <p>${escapeHtml(localText.clickHelp)}</p>
            ${renderSubsetTable(instance, rstate.selected, new Set(solution), check, construction)}
          </div>
        </section>
      </div>
      <aside class="side-column">
        ${statusPanels(context, Boolean(context.sat.assignment), `t = ${instance.target.join("")}`)}
        ${stepperPanel("subsetsum", constructionItems)}
        ${subsetCheckerPanel(instance, check, solution)}
        ${proofPanel(localText)}
      </aside>
    </div>
  `;
}

function renderSubsetTable(instance, selectedIds, solutionIds, check, construction = null) {
  const selected = new Set(selectedIds);
  const visible = construction?.active ? accumConstruction(subsetConstructionItems(instance), construction.visibleCount) : null;
  if (construction?.active && construction.visibleCount === 0) {
    return `<div class="construction-empty">${escapeHtml(ctext().emptyConstruction)}</div>`;
  }
  const header = `<tr><th></th>${instance.columns.map((col, index) => `<th class="${index < instance.vars.length ? "var-col" : "clause-col"}">${escapeHtml(col)}</th>`).join("")}<th>${escapeHtml(ctext().target)}</th></tr>`;
  const rows = instance.rows.filter((row) => !visible || visible.rows.has(row.id)).map((row) => {
    const rowClass = selected.has(row.id) ? "is-selected" : "";
    return `<tr class="${rowClass}" data-action="subset-row" data-id="${attr(row.id)}">
      <td>${escapeHtml(row.label)} ${solutionIds.has(row.id) ? "✓" : ""}</td>
      ${row.digits.map((digit) => `<td>${digit || ""}</td>`).join("")}
      <td>${row.digits.join("")}</td>
    </tr>`;
  }).join("");
  const targetRow = !visible || visible.showTarget ? `<tr class="is-target"><td>t</td>${instance.target.map((digit) => `<td>${digit}</td>`).join("")}<td>${instance.target.join("")}</td></tr>` : "";
  const sumRow = !visible || visible.showTarget ? `<tr><td>Σ</td>${check.sum.map((digit, index) => `<td class="${digit === instance.target[index] ? "digit-hit" : digit > instance.target[index] ? "digit-over" : ""}">${digit}</td>`).join("")}<td>${check.sum.join("")}</td></tr>` : "";
  return `<div class="table-wrap"><table class="digits-table"><thead>${header}</thead><tbody>${rows}${targetRow}${sumRow}</tbody></table></div>`;
}

function subsetCheckerPanel(instance, check, solution) {
  return `
    <section class="tool-panel">
      <h2>${escapeHtml(ctext().solutionChecker)}</h2>
      <div class="formula-list">
        <article class="status-box ${check.reachesTarget ? "is-good" : "is-bad"}"><h3>${escapeHtml(tx().subsetsum.targetDigits)}</h3><p>${escapeHtml(check.sum.join(""))} / ${escapeHtml(instance.target.join(""))}</p></article>
        <article class="status-box ${check.variablesOk ? "is-good" : "is-bad"}"><h3>${escapeHtml(tx().subsetsum.rowChoice)}</h3></article>
        <article class="status-box ${check.noCarry ? "is-good" : "is-bad"}"><h3>${escapeHtml(tx().subsetsum.noCarry)}</h3></article>
      </div>
      <div class="toolbar" style="margin-top:10px">
        <button class="control" type="button" data-action="show-solution" data-reduction="subsetsum" ${solution.length ? "" : "disabled"}>${escapeHtml(ctext().showSolution)}</button>
        <button class="control" type="button" data-action="reset-selection" data-reduction="subsetsum">${escapeHtml(ctext().resetSelection)}</button>
      </div>
      <h3 style="margin-top:12px">${escapeHtml(ctext().assignment)}</h3>
      ${assignmentHtml(check.assignment, instance.vars)}
    </section>
  `;
}

function buildVertexCoverView(context, localText) {
  const instance = buildVertexCoverInstance(context.clauses);
  const solution = vertexCoverSolution(instance, context.clauses, context.sat.assignment);
  const rstate = reductionState("vertexcover");
  const check = checkVertexCover(instance, rstate.selected);
  const layoutKey = formulaLayoutKey("vertexcover", context.clauses);
  const constructionItems = vertexCoverConstructionItems(instance);
  const construction = constructionView("vertexcover", constructionItems);
  return `
    <div class="page-grid">
      <div class="main-column">
        ${sourceFormulaPanel(context)}
        <section class="visual-panel">
          <div class="visual-header">
            <h2>${escapeHtml(ctext().targetInstance)}</h2>
            <span class="pill">${escapeHtml(localText.targetK)} = ${instance.K}</span>
          </div>
          <div class="visual-body">
            <p>${escapeHtml(`${localText.clickHelp} ${ctext().dragGraphNodes}`)}</p>
            ${renderVertexCoverSvg(instance, rstate.selected, new Set(solution), check, layoutKey, construction)}
          </div>
        </section>
      </div>
      <aside class="side-column">
        ${statusPanels(context, Boolean(context.sat.assignment), `K = ${instance.K}`)}
        ${stepperPanel("vertexcover", constructionItems)}
        ${vertexCheckerPanel(instance, check, solution)}
        ${proofPanel(localText)}
      </aside>
    </div>
  `;
}

function vertexPositions(instance) {
  const positions = {};
  const width = Math.max(820, Math.max(instance.vars.length, Math.ceil((instance.nodes.filter((n) => n.kind === "clause").length) / 3)) * 190 + 120);
  instance.vars.forEach((name, vi) => {
    const x = 100 + vi * 180;
    positions[`v_${name}_pos`] = { x, y: 72 };
    positions[`v_${name}_neg`] = { x, y: 148 };
  });
  const clauseNodes = instance.nodes.filter((node) => node.kind === "clause");
  const clauseCount = Math.max(...clauseNodes.map((node) => node.clause)) + 1;
  for (let ci = 0; ci < clauseCount; ci += 1) {
    const x = 120 + ci * 180;
    const y = 330;
    positions[`c${ci + 1}l1`] = { x, y: y - 55 };
    positions[`c${ci + 1}l2`] = { x: x - 52, y: y + 38 };
    positions[`c${ci + 1}l3`] = { x: x + 52, y: y + 38 };
  }
  return { positions, width, height: 445 };
}

function renderVertexCoverSvg(instance, selectedIds, solutionIds, check, layoutKey, construction = null) {
  const selected = new Set(selectedIds);
  const visible = construction?.active ? accumConstruction(vertexCoverConstructionItems(instance), construction.visibleCount) : null;
  const layout = vertexPositions(instance);
  const { width, height } = layout;
  const basePositions = layout.positions;
  const positions = offsetGraphPositions(basePositions, "vertexcover", layoutKey);
  const uncovered = new Set(check.uncovered.map((edge) => edge.id));
  const edgeHtml = instance.edges.filter((edge) => !visible || (visible.edges.has(edge.id) && visible.nodes.has(edge.from) && visible.nodes.has(edge.to))).map((edge) => {
    const a = positions[edge.from];
    const b = positions[edge.to];
    if (!a || !b) {
      return "";
    }
    const cls = `graph-edge ${uncovered.has(edge.id) ? "is-uncovered" : selected.has(edge.from) || selected.has(edge.to) ? "is-selected" : "is-soft"}`;
    return lineSvg(a, b, cls);
  }).join("");
  const nodeHtml = instance.nodes.filter((node) => !visible || visible.nodes.has(node.id)).map((node) => {
    const pos = positions[node.id];
    if (!pos) {
      return "";
    }
    const cls = [
      "graph-node",
      node.kind === "variable" ? "is-variable" : "is-clause",
      selected.has(node.id) ? "is-selected" : "",
      solutionIds.has(node.id) ? "is-solution" : ""
    ].filter(Boolean).join(" ");
    const radius = node.kind === "variable" ? 27 : 24;
    return `<g class="draggable-item drag-xy" data-action="vc-node" data-id="${attr(node.id)}" ${graphDragAttrs("vertexcover", layoutKey, node.id, basePositions[node.id], width, height, radius)}>
      <title>${attr(node.label)}</title>
      <circle class="${cls}" cx="${pos.x}" cy="${pos.y}" r="${radius}"></circle>
      <text class="svg-label" x="${pos.x}" y="${pos.y}">${escapeHtml(node.label)}</text>
    </g>`;
  }).join("");
  const empty = construction?.active && construction.visibleCount === 0 ? `<text class="svg-small" x="${width / 2}" y="${height / 2}">${escapeHtml(ctext().emptyConstruction)}</text>` : "";
  return `<svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" data-graph-svg>${edgeHtml}${empty}${nodeHtml}</svg>`;
}

function vertexCheckerPanel(instance, check, solution) {
  return `
    <section class="tool-panel">
      <h2>${escapeHtml(ctext().solutionChecker)}</h2>
      <div class="formula-list">
        <article class="status-box ${check.uncovered.length === 0 ? "is-good" : "is-bad"}"><h3>${escapeHtml(tx().vertexcover.edgeCoverage)}</h3><p>${instance.edges.length - check.uncovered.length}/${instance.edges.length}</p></article>
        <article class="status-box ${check.sizeOk ? "is-good" : "is-bad"}"><h3>${escapeHtml(tx().vertexcover.sizeBound)}</h3><p>${reductionState("vertexcover").selected.size}/${instance.K}</p></article>
      </div>
      <div class="toolbar" style="margin-top:10px">
        <button class="control" type="button" data-action="show-solution" data-reduction="vertexcover" ${solution.length ? "" : "disabled"}>${escapeHtml(ctext().showSolution)}</button>
        <button class="control" type="button" data-action="reset-selection" data-reduction="vertexcover">${escapeHtml(ctext().resetSelection)}</button>
      </div>
      <h3 style="margin-top:12px">${escapeHtml(tx().vertexcover.inducedAssignment)}</h3>
      ${assignmentHtml(check.assignment, instance.vars)}
    </section>
  `;
}

function buildHamPathView(context, localText) {
  const instance = buildHamPathInstance(context.clauses);
  const solution = hampathSolution(instance, context.clauses, context.sat.assignment);
  const rstate = reductionState("hampath");
  const check = checkHamPath(instance, rstate.selectedPath);
  const layoutKey = formulaLayoutKey("hampath", context.clauses);
  const constructionItems = hampathConstructionItems(instance);
  const construction = constructionView("hampath", constructionItems);
  return `
    <div class="page-grid">
      <div class="main-column">
        ${sourceFormulaPanel(context)}
        <section class="visual-panel">
          <div class="visual-header">
            <h2>${escapeHtml(ctext().targetInstance)}</h2>
            <div class="toolbar">
              <button class="control ${rstate.showLabels ? "is-active" : ""}" type="button" data-action="toggle-ham-labels">${escapeHtml(localText.showLabels)}</button>
              <button class="control ${rstate.showArrows ? "is-active" : ""}" type="button" data-action="toggle-ham-arrows">${escapeHtml(localText.showArrows)}</button>
            </div>
          </div>
          <div class="visual-body">
            <p>${escapeHtml(`${localText.clickHelp} ${ctext().dragGraphNodes}`)}</p>
            ${renderHamSvg(instance, rstate.selectedPath, solution, rstate, layoutKey, construction)}
          </div>
        </section>
      </div>
      <aside class="side-column">
        ${statusPanels(context, Boolean(context.sat.assignment), `${instance.nodes.length} ${ctext().vertices}`)}
        ${stepperPanel("hampath", constructionItems)}
        ${hamCheckerPanel(instance, check, solution)}
        ${proofPanel(localText)}
      </aside>
    </div>
  `;
}

function hamPositions(instance) {
  const positions = { s: { x: 55, y: 72 }, t: { x: 945, y: 72 + instance.vars.length * 132 } };
  const width = 1000;
  const rowStart = 150;
  const rowEnd = 850;
  const rowCount = 3 * instance.clauses.length + 1;
  instance.vars.forEach((name, vi) => {
    const y = 100 + vi * 132;
    positions[`x${vi + 1}_entry`] = { x: 70, y };
    positions[`x${vi + 1}_exit`] = { x: 930, y };
    for (let r = 0; r < rowCount; r += 1) {
      positions[`x${vi + 1}_r${r}`] = { x: rowStart + (rowEnd - rowStart) * (r / (rowCount - 1)), y };
    }
  });
  const clauseY = 100 + instance.vars.length * 132;
  instance.clauses.forEach((_, ci) => {
    positions[`c${ci + 1}`] = { x: 210 + ci * Math.min(180, 560 / Math.max(1, instance.clauses.length - 1 || 1)), y: clauseY };
  });
  return { positions, width, height: clauseY + 90 };
}

function renderHamSvg(instance, selectedPath, solutionPath, rstate, layoutKey, construction = null) {
  const layout = hamPositions(instance);
  const visible = construction?.active ? accumConstruction(hampathConstructionItems(instance), construction.visibleCount) : null;
  const { width, height } = layout;
  const basePositions = layout.positions;
  const positions = offsetGraphPositions(basePositions, "hampath", layoutKey);
  const selectedNodes = new Set(selectedPath);
  const solutionNodes = new Set(solutionPath);
  const selectedEdgeKeys = new Set(selectedPath.slice(0, -1).map((id, index) => `${id}|${selectedPath[index + 1]}`));
  const solutionEdgeKeys = new Set(solutionPath.slice(0, -1).map((id, index) => `${id}|${solutionPath[index + 1]}`));
  const marker = rstate.showArrows ? 'marker-end="url(#arrow)"' : "";
  const edges = instance.edges.filter((edge) => !visible || (visible.edges.has(hamEdgeKey(edge)) && visible.nodes.has(edge.from) && visible.nodes.has(edge.to))).map((edge) => {
    const a = positions[edge.from];
    const b = positions[edge.to];
    if (!a || !b) {
      return "";
    }
    const key = `${edge.from}|${edge.to}`;
    const cls = `graph-edge ${selectedEdgeKeys.has(key) ? "is-selected" : solutionEdgeKeys.has(key) ? "is-solution" : edge.kind === "detour" ? "is-soft" : ""}`;
    const path = edge.kind === "detour"
      ? curvedSvg(a, b, cls, marker)
      : `<line class="${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" ${marker}></line>`;
    const label = rstate.showLabels && edge.literal ? `<text class="svg-edge-label" x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - 4}">${escapeHtml(edge.literal)}</text>` : "";
    return `${path}${label}`;
  }).join("");
  const nodes = instance.nodes.filter((node) => !visible || visible.nodes.has(node.id)).map((node) => {
    const pos = positions[node.id];
    if (!pos) {
      return "";
    }
    const isTiny = node.kind === "pair" || node.kind === "separator";
    const cls = [
      "graph-node",
      node.kind === "clause" ? "is-clause" : node.kind === "pair" ? "is-aux" : "",
      selectedNodes.has(node.id) ? "is-selected" : "",
      solutionNodes.has(node.id) ? "is-solution" : ""
    ].filter(Boolean).join(" ");
    const radius = isTiny ? (node.kind === "pair" ? 10 : 6) : 22;
    const label = isTiny ? "" : node.label;
    return `<g class="draggable-item drag-xy" data-action="ham-node" data-id="${attr(node.id)}" ${graphDragAttrs("hampath", layoutKey, node.id, basePositions[node.id], width, height, radius)}>
      <title>${attr(node.label || node.id)}</title>
      <circle class="${cls}" cx="${pos.x}" cy="${pos.y}" r="${radius}"></circle>
      ${label ? `<text class="svg-label" x="${pos.x}" y="${pos.y}">${escapeHtml(label)}</text>` : ""}
    </g>`;
  }).join("");
  const defs = `<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="currentColor"></path></marker></defs>`;
  const empty = construction?.active && construction.visibleCount === 0 ? `<text class="svg-small" x="${width / 2}" y="${height / 2}">${escapeHtml(ctext().emptyConstruction)}</text>` : "";
  return `<svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" data-graph-svg>${defs}${edges}${empty}${nodes}</svg>`;
}

function curvedSvg(a, b, cls, marker) {
  const midY = (a.y + b.y) / 2;
  return `<path class="${cls}" d="M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}" ${marker}></path>`;
}

function hamCheckerPanel(instance, check, solution) {
  const selected = reductionState("hampath").selectedPath;
  return `
    <section class="tool-panel">
      <h2>${escapeHtml(ctext().solutionChecker)}</h2>
      <div class="formula-list">
        <article class="status-box ${check.startsEnds ? "is-good" : "is-bad"}"><h3>${escapeHtml(tx().hampath.startsEnds)}</h3></article>
        <article class="status-box ${check.followsEdges ? "is-good" : "is-bad"}"><h3>${escapeHtml(tx().hampath.followsEdges)}</h3></article>
        <article class="status-box ${check.visitsAll ? "is-good" : "is-bad"}"><h3>${escapeHtml(tx().hampath.visitsAll)}</h3><p>${selected.length}/${instance.nodes.length}</p></article>
      </div>
      <div class="toolbar" style="margin-top:10px">
        <button class="control" type="button" data-action="show-solution" data-reduction="hampath" ${solution.length ? "" : "disabled"}>${escapeHtml(ctext().showSolution)}</button>
        <button class="control" type="button" data-action="reset-selection" data-reduction="hampath">${escapeHtml(ctext().resetSelection)}</button>
      </div>
      <div class="path-list">${selected.slice(0, 60).map((id) => `<span class="path-node">${escapeHtml(id)}</span>`).join("")}${selected.length > 60 ? `<span class="path-node">...</span>` : ""}</div>
    </section>
  `;
}

function errorPanel(error) {
  return `<section class="band"><div class="error-box"><strong>${escapeHtml(ctext().parseError)}:</strong> ${escapeHtml(error.message)}</div></section>`;
}

function renderAbout() {
  const text = tx().about;
  workspace.innerHTML = `
    <section class="band">
      <h2>${escapeHtml(text.title)}</h2>
      ${text.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    </section>
  `;
}

function render() {
  setTheme(state.theme);
  renderHeader();
  renderTabs();
  renderFooter();
  if (state.activeTab === "overview") {
    renderOverview();
  } else if (state.activeTab === "sat3") {
    renderSat3();
  } else if (state.activeTab === "clique") {
    renderClique();
  } else if (state.activeTab === "independentset") {
    renderIndependentSet();
  } else if (state.activeTab === "subsetsum") {
    renderSubsetSum();
  } else if (state.activeTab === "vertexcover") {
    renderVertexCover();
  } else if (state.activeTab === "hampath") {
    renderHamPath();
  } else {
    renderAbout();
  }
}

function currentSolutionFor(reduction) {
  const context = parseReductionFormula(reduction);
  if (reduction === "clique") {
    return cliqueSolution(buildCliqueInstance(context.clauses), context.sat.assignment);
  }
  if (reduction === "independentset") {
    return independentSetSolution(buildIndependentSetInstance(context.clauses), context.sat.assignment);
  }
  if (reduction === "subsetsum") {
    return subsetSolution(buildSubsetSumInstance(context.clauses), context.sat.assignment);
  }
  if (reduction === "vertexcover") {
    return vertexCoverSolution(buildVertexCoverInstance(context.clauses), context.clauses, context.sat.assignment);
  }
  if (reduction === "hampath") {
    return hampathSolution(buildHamPathInstance(context.clauses), context.clauses, context.sat.assignment);
  }
  return [];
}

function stopGraphDrag(event) {
  if (!state.graphDrag) {
    return;
  }
  if (state.graphDrag.moved) {
    state.suppressNextGraphClick = true;
    state.graphDragEndedAt = performance.now();
    event?.preventDefault?.();
  }
  document.body.classList.remove("is-dragging-graph");
  window.removeEventListener("pointermove", onGraphPointerMove);
  window.removeEventListener("pointerup", stopGraphDrag);
  window.removeEventListener("pointercancel", stopGraphDrag);
  state.graphDrag = null;
}

function onGraphPointerMove(event) {
  const drag = state.graphDrag;
  if (!drag) {
    return;
  }
  const deltaPixelsX = event.clientX - drag.startClientX;
  const deltaPixelsY = event.clientY - drag.startClientY;
  if (!drag.moved && Math.hypot(deltaPixelsX, deltaPixelsY) >= 3) {
    drag.moved = true;
  }
  const nextX = Math.max(drag.minOffsetX, Math.min(drag.maxOffsetX, drag.startOffsetX + deltaPixelsX * drag.unitsPerPixelX));
  const nextY = Math.max(drag.minOffsetY, Math.min(drag.maxOffsetY, drag.startOffsetY + deltaPixelsY * drag.unitsPerPixelY));
  updateGraphOffset(drag.reduction, drag.layoutKey, drag.nodeId, { x: nextX, y: nextY });
  event.preventDefault();
  render();
}

function beginGraphDrag(event) {
  const handle = event.target.closest("[data-drag-item]");
  if (!handle || event.button !== 0) {
    return;
  }
  const svg = handle.closest("[data-graph-svg]");
  if (!svg) {
    return;
  }
  const reduction = handle.dataset.reduction;
  const layoutKey = handle.dataset.layoutKey;
  const nodeId = handle.dataset.nodeId;
  if (!reduction || !layoutKey || !nodeId) {
    return;
  }
  const svgRect = svg.getBoundingClientRect();
  const viewBox = svg.viewBox?.baseVal;
  if (!viewBox || !svgRect.width || !svgRect.height) {
    return;
  }
  const currentOffset = getGraphOffset(reduction, layoutKey, nodeId);
  state.graphDrag = {
    reduction,
    layoutKey,
    nodeId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startOffsetX: currentOffset.x ?? 0,
    startOffsetY: currentOffset.y ?? 0,
    unitsPerPixelX: viewBox.width / svgRect.width,
    unitsPerPixelY: viewBox.height / svgRect.height,
    minOffsetX: Number(handle.dataset.minXOffset ?? -Infinity),
    maxOffsetX: Number(handle.dataset.maxXOffset ?? Infinity),
    minOffsetY: Number(handle.dataset.minYOffset ?? -Infinity),
    maxOffsetY: Number(handle.dataset.maxYOffset ?? Infinity),
    moved: false
  };
  document.body.classList.add("is-dragging-graph");
  window.addEventListener("pointermove", onGraphPointerMove);
  window.addEventListener("pointerup", stopGraphDrag);
  window.addEventListener("pointercancel", stopGraphDrag);
}

document.addEventListener("click", (event) => {
  if (state.suppressNextGraphClick) {
    const isImmediateDragClick = performance.now() - state.graphDragEndedAt < 24;
    state.suppressNextGraphClick = false;
    if (isImmediateDragClick && event.target.closest("[data-drag-item]")) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }
  const target = event.target.closest("[data-action]");
  if (!target) {
    return;
  }
  const action = target.dataset.action;
  if (action === "tab") {
    state.activeTab = target.dataset.tab;
    render();
    return;
  }
  if (action === "apply-input") {
    const key = target.dataset.reduction;
    const textarea = document.querySelector(`[data-formula-input="${key}"]`);
    reductionState(key).input = textarea?.value ?? reductionState(key).input;
    reductionState(key).preset = "";
    resetReductionSelection(key);
    resetGraphLayout(key);
    reductionState(key).constructing = false;
    reductionState(key).buildIndex = 0;
    render();
    return;
  }
  if (action === "construction-start") {
    const key = target.dataset.reduction;
    reductionState(key).constructing = true;
    reductionState(key).buildIndex = 0;
    render();
    return;
  }
  if (action === "construction-previous") {
    const key = target.dataset.reduction;
    reductionState(key).buildIndex = Math.max(0, reductionState(key).buildIndex - 1);
    render();
    return;
  }
  if (action === "construction-next") {
    const key = target.dataset.reduction;
    reductionState(key).buildIndex += 1;
    render();
    return;
  }
  if (action === "construction-cancel") {
    const key = target.dataset.reduction;
    reductionState(key).constructing = false;
    reductionState(key).buildIndex = 0;
    render();
    return;
  }
  if (action === "step") {
    const key = target.dataset.reduction;
    const delta = Number(target.dataset.delta);
    const max = DEFAULT_STEPS[key] - 1;
    reductionState(key).step = Math.max(0, Math.min(max, reductionState(key).step + delta));
    render();
    return;
  }
  if (action === "show-solution") {
    const key = target.dataset.reduction;
    const solution = currentSolutionFor(key);
    if (key === "hampath") {
      reductionState(key).selectedPath = solution;
    } else {
      reductionState(key).selected = new Set(solution);
    }
    render();
    return;
  }
  if (action === "reset-selection") {
    resetReductionSelection(target.dataset.reduction);
    render();
    return;
  }
  if (action === "clique-node") {
    toggleSetItem(reductionState("clique").selected, target.dataset.id);
    render();
    return;
  }
  if (action === "independent-node") {
    toggleSetItem(reductionState("independentset").selected, target.dataset.id);
    render();
    return;
  }
  if (action === "subset-row") {
    toggleSetItem(reductionState("subsetsum").selected, target.dataset.id);
    render();
    return;
  }
  if (action === "vc-node") {
    toggleSetItem(reductionState("vertexcover").selected, target.dataset.id);
    render();
    return;
  }
  if (action === "ham-node") {
    const path = reductionState("hampath").selectedPath;
    const id = target.dataset.id;
    if (path[path.length - 1] === id) {
      path.pop();
    } else {
      path.push(id);
    }
    render();
    return;
  }
  if (action === "toggle-ham-labels") {
    reductionState("hampath").showLabels = !reductionState("hampath").showLabels;
    render();
    return;
  }
  if (action === "toggle-ham-arrows") {
    reductionState("hampath").showArrows = !reductionState("hampath").showArrows;
    render();
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target?.dataset?.action === "preset") {
    const key = target.dataset.reduction;
    const preset = target.value;
    const group = currentPresetGroup(key);
    reductionState(key).preset = preset;
    reductionState(key).input = group[preset]?.formula ?? reductionState(key).input;
    resetReductionSelection(key);
    resetGraphLayout(key);
    reductionState(key).constructing = false;
    reductionState(key).buildIndex = 0;
    render();
  }
});

workspace.addEventListener("pointerdown", beginGraphDrag);

themeToggle.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  render();
});

languageToggle.addEventListener("click", () => {
  state.language = state.language === "en" ? "pt" : "en";
  writeStorage(LANGUAGE_KEY, state.language);
  render();
});

function toggleSetItem(set, id) {
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
}

function resetGraphLayout(key) {
  if (state.graphLayouts[key]) {
    state.graphLayouts[key] = {};
  }
}

function resetReductionSelection(key) {
  if (key === "hampath") {
    reductionState(key).selectedPath = [];
  } else if (reductionState(key)?.selected) {
    reductionState(key).selected = new Set();
  }
}

render();
