/* pcp2cfg_i18n.js — bilingual i18n (en / pt-BR) + help modal content */

(function () {
  const I18N = {
    en: {
      // UI
      "title.main": "PCP → CFG Ambiguity",
      "about.line1": "An interactive tool for the reduction PCP ⇒ CFG Ambiguity.",
      "about.line2": "Build or import a PCP instance (dominoes), generate the grammar G_D, and explore derivations via T and B.",
      "about.note_ai": "(Webtool built using Generative AI — ChatGPT)",
      "about.dev_block": `
        <strong>Developed by Prof. Bruno Iochins Grisci</strong><br />
        <em>(Webtool built using Generative AI)</em><br />
        Departamento de Informática Teórica —
        <a href="https://www.inf.ufrgs.br/site/" target="_blank" rel="noreferrer">Instituto de Informática</a><br />
        <a href="https://www.ufrgs.br/site/" target="_blank" rel="noreferrer">Universidade Federal do Rio Grande do Sul (UFRGS)</a><br />
        Website:
        <a href="https://brunogrisci.github.io/" target="_blank" rel="noreferrer">https://brunogrisci.github.io/</a><br /><br />
        <strong>Based and inspired by the class of Prof. Rodrigo Machado:</strong><br />
        <a href="https://link.inf.ufrgs.br/212-AALr" target="_blank" rel="noreferrer">https://link.inf.ufrgs.br/212-AALr</a><br /><br />
        <em>Tip:</em> Try the TM → PCP Domino Generator first (<a href="https://brunogrisci.github.io/tm2pcp" target="_blank" rel="noreferrer">tm2pcp</a>). The exported .csv works as input here.
      `,

      "label.csv_file": "Import dominoes (.csv):",
      "button.add_domino": "Add domino",
      "button.clear_dominoes": "Clear dominoes",
      "button.export_csv": "Export CSV",
      "button.delete": "Delete",
      "button.build_derivation": "Build derivations",
      "button.clear_derivations": "Clear derivations",
      "button.zoom_in": "Zoom in",
      "button.zoom_out": "Zoom out",
      "button.clear_tree": "Clear tree",
      "button.load_example": "Load example",
      "tree.select_rule": "Select a rule number:",
      "tree.select_rule_title": "Choose a rule",

      "title.dominoes": "PCP instance (dominoes)",
      "note.dominoes": "Each domino i is a pair (t_i, b_i). The tool assigns a new terminal a_i used as an index marker in the grammar.",
      "domino.header.id": "ID",
      "domino.header.top": "Top (t_i)",
      "domino.header.bottom": "Bottom (b_i)",
      "domino.header.actions": "Actions",

      "summary.k": "k",
      "summary.ai": "Index symbols",
      "note.ai_symbols": "The symbols a1, a2, … are fresh terminals that do not appear in any t_i or b_i.",

      "title.grammar": "Generated CFG G_D",
      "note.grammar": "The grammar is constructed from your dominoes using the classical reduction PCP ⇒ AMB_CFG.",

      "title.derivations": "Derivation explorer",
      "label.sequence": "Index sequence (e.g., 1,3,2):",
      "note.sequence": "This builds two derivations: S⇒T⇒* and S⇒B⇒*. Matching outputs witness ambiguity.",

      "result.top_concat": "Top concat",
      "result.bottom_concat": "Bottom concat",
      "result.word_T": "Word via T",
      "result.word_B": "Word via B",
      "result.match_yes": "MATCH",
      "result.match_no": "NO MATCH",
      "result.match_explain_yes": "This sequence witnesses ambiguity: the same terminal string is derived via T and via B.",
      "result.match_explain_no": "This sequence does not witness ambiguity. Try another sequence or increase length.",
      "result.match_weak": "PARTIAL MATCH",
      "result.match_explain_weak": "The concatenated characters match, but the token structure differs. This is not a formal PCP solution.",

      "tree.label": "Tree",
      "note.undecidable": "Reminder: this tool does not decide PCP or CFG ambiguity. It helps you explore the reduction and witness ambiguity when a solution is found.",

    "footer.note": "Educational tool; no decision procedure for undecidable problems.",
    "footer.code_label": "Code on GitHub:",
    "footer.licensed_label": "Licensed under",

      // Status
      "status.ready_empty": "Ready. Add dominoes or import a CSV.",
      "status.ready_k": "Ready. Current instance has k={K} dominoes.",
      "status.need_dominoes": "Please add/import at least one domino first.",
      "status.csv_bad_header": "CSV header must contain: top_string and bottom_string (like tm2pcp export).",
      "status.import_ok": "Imported CSV successfully (k={K}).",
      "status.import_fail": "Failed to import CSV: {ERR}",
      "status.export_none": "Nothing to export: there are no dominoes.",
      "status.export_ok": "Exported CSV (k={K}).",
      "status.example_loaded": "Loaded a small example instance.",
      "status.bad_sequence": "Invalid sequence. Use positive integers separated by commas/spaces (e.g., 1,3,2).",
      "status.empty_sequence": "Sequence is empty. PCP solutions must be non-empty.",
      "status.sequence_out_of_range": "Sequence contains an index outside the range 1..{K}.",
      "status.forbidden_ai": "Your domino strings contain a pattern like a1, a2, ... These are reserved for fresh index symbols in the reduction. Please rename such terminals.",
      "status.witness_ambiguity": "Match found: this sequence witnesses ambiguity of G_D.",
      "status.no_witness": "No match for this sequence.",

      // Grammar box messages
      "grammar.empty": "Add at least one domino to generate G_D.",
      "grammar.forbidden_ai": "Cannot generate G_D because your domino strings contain reserved patterns a1, a2, ...\nPlease rename these terminals in your PCP instance.",

      "summary.prefix": "Index prefix",

      "result.aligned_legend": "Green = match, red = mismatch, · = missing token.",
      "help.solver_bounded.title": "Bounded (M)PCP Solver",
      "help.solver_bounded.body_html": `
        <p>This solver attempts to find a solution for the <strong>(Modified) Post Correspondence Problem</strong> instance currently shown in the tool.</p>
        <p><strong>Important:</strong> PCP is <em>undecidable</em>. That means <strong>no algorithm</strong> can always decide if a solution exists.</p>
        <p>The solver does <em>not</em> contradict undecidability: it performs a <strong>bounded search</strong> limited by user settings for <em>depth</em>, <em>time</em>, and <em>number of explored states</em>.</p>

        <h4 style="margin-top:0.8em;">How the solver works</h4>
        <p>It follows an <strong>incremental prefix-matching search</strong>, inspired by Ling Zhao (PhD thesis, Ch. 2.2) and Arne Vogel’s solver/blog.</p>
        <p>The search keeps only prefix-consistent sequences of domino indices:</p>
<pre style="background:var(--panel-bg); padding:0.6em; border-radius:0.5rem;">// Pseudocode (simplified)
solutions := all single-tile sequences that are prefix-consistent

for depth = 1 .. maxDepth:
  newSolutions := {}
  for seq in solutions:
    for each domino j:
      if concat(top(seq)+top(j)) and concat(bottom(seq)+bottom(j))
         are prefix-compatible:
         add (seq + j) to newSolutions

  if any seq in newSolutions has equal top and bottom concatenations:
     return seq  // solution found

  solutions := newSolutions

stop when limits are reached
</pre>
        <p>Prefix-incompatible sequences are discarded early to prune the search, but the space is still infinite in general.</p>

        <h4 style="margin-top:0.8em;">Why bounded search fits undecidability</h4>
        <p>If a solution is found, it is <strong>correct</strong>. If the solver stops without one, it <strong>does not</strong> prove unsolvability—more depth/time/nodes might be needed.</p>
        <p>This asymmetry reflects undecidability: positive instances may be found; negative instances cannot be certified in general.</p>

        <h4 style="margin-top:0.8em;">Solver controls</h4>
        <ul>
          <li><strong>Try solve:</strong> start the bounded search with current parameters.</li>
          <li><strong>Cancel:</strong> stop the running search immediately.</li>
          <li><strong>Load solution into workspace:</strong> insert the found sequence for inspection.</li>
        </ul>
        <p>When the solver stops, the interface reports whether a solution was found or which limit (depth, time, nodes) ended the search.</p>

        <h4 style="margin-top:0.8em;">Common misconceptions</h4>
        <ul>
          <li><strong>“No solution was found, so none exists.”</strong><br>This is <em>not</em> guaranteed; bounded search may stop before reaching a valid solution.</li>
          <li><strong>“Bigger limits turn this into a decision procedure.”</strong><br>No finite bounds can decide all PCP instances; some need arbitrarily long searches.</li>
          <li><strong>“Solver failure contradicts undecidability.”</strong><br>On the contrary: solutions may appear; non-solutions cannot be reliably certified.</li>
        </ul>
        <p style="margin-top:0.8em; font-size:0.9em;"><em>Credits:</em> Algorithm inspired by Ling Zhao (Ch. 2.2) and Arne Vogel; JavaScript adaptation for this educational tool.</p>
      `,
      "help.solver_max_depth.title": "Max depth",
      "help.solver_max_depth.body_html": `
        <p>This sets the maximum length of the domino sequence the solver explores.</p>
        <p>Depth <em>d</em> means only sequences with at most <em>d</em> dominoes are considered.</p>
        <p>Higher depth increases the chance of finding solutions that need long sequences, but the search grows exponentially.</p>
        <p>If the solver stops due to this limit, a solution may still exist at a greater depth.</p>
      `,
      "help.solver_time_limit.title": "Time limit (ms)",
      "help.solver_time_limit.body_html": `
        <p>This sets the <strong>maximum wall-clock time</strong> (in milliseconds) the solver may run.</p>
        <p>If the limit is reached, the solver stops immediately, even with unexplored states remaining.</p>
        <p>Time limits keep the interface responsive because PCP search can grow very quickly.</p>
        <p>Stopping due to time does <strong>not</strong> imply that no solution exists.</p>
      `,
      "help.solver_node_limit.title": "Node limit",
      "help.solver_node_limit.body_html": `
        <p>This sets the <strong>maximum number of search states (nodes)</strong> the solver may expand.</p>
        <p>Each node is a partial domino sequence that remains prefix-consistent.</p>
        <p>Limiting nodes directly controls memory use and prevents exhausting system resources.</p>
        <p>Hitting this limit does <strong>not</strong> imply the instance has no solution.</p>
      `,
      "help.solver_toggle_mpcp.title": "PCP vs. MPCP",
      "help.solver_toggle_mpcp.body_html": `
        <h4 style="margin-top:0.8em;">PCP vs. MPCP</h4>
        <p>In the <strong>Post Correspondence Problem (PCP)</strong>, a solution is any non-empty sequence of dominoes whose top and bottom strings match after concatenation. There is <em>no restriction</em> on which domino must appear first.</p>
        <p>The <strong>Modified PCP (MPCP)</strong> adds one constraint: the solution sequence must <strong>start with a designated first domino</strong>. Otherwise, the matching condition is the same as PCP.</p>
        <p>This extra constraint is very useful in reductions from Turing machines because it forces a well-defined <strong>initial configuration</strong> of the simulated computation.</p>
      `,
      "help.main_tool.title": "What does this tool do?",
      "help.main_tool.body_html": `
        <p><strong>pcp2cfg</strong> visualizes the reduction <code>PCP ⇒ CFG ambiguity</code>.</p>
        <ul>
          <li><strong>PCP</strong>: Given dominoes <code>(t_i,b_i)</code>, find a non-empty sequence whose top and bottom concatenations match.</li>
          <li><strong>CFG ambiguity</strong>: A CFG is ambiguous if some word has two distinct derivation trees.</li>
          <li><strong>Reduction (slides-based)</strong>: For dominoes 1..k, build <code>G_D</code>:
<pre class="mono">S → T | B
T → t1 T a1 | … | tk T ak | t1 a1 | … | tk ak
B → b1 B a1 | … | bk B ak | b1 a1 | … | bk ak</pre>
          A PCP solution <code>i1…in</code> produces the same word via <code>T</code> and <code>B</code>, proving ambiguity.</li>
        </ul>
        <p>Use the panels to enter/import dominoes, see <code>G_D</code>, run a bounded solver, and build/expand derivation trees.</p>
      `,
      "help.csv_import.title": "CSV import",
      "help.csv_import.body_html": `
        <p>Import a CSV with header <code>domino_id,top_string,bottom_string</code> (same as tm2pcp export). The tm2pcp PCP export works here.</p>
        <p>Top/bottom are space-tokenized; empty cells are allowed. Dominoes are renumbered 1..k on import.</p>
      `,
      "help.dominoes.title": "Dominoes and index symbols a_i",
      "help.dominoes.body_html": `
        <p>Edit each <code>(t_i, b_i)</code> as token chips. Drag to reorder; double-click to send to the workspace; delete individually.</p>
        <p>The reduction introduces fresh terminals <code>a1…ak</code> as index markers; avoid using patterns like <code>a1</code> inside your own strings. The tool auto-picks a safe prefix.</p>
      `,
      "help.workspace.title": "Workspace (sequence of dominoes)",
      "help.workspace.body_html": `
        <p>Build an ordered sequence by dragging/double-clicking. Tokens contributed by each domino are shown below; hover a workspace domino to highlight its tokens in Top/Bottom.</p>
        <p>Use “Workspace → Sequence” to copy indices, or “Sequence → Workspace” to load from the index field. If Top and Bottom match, you found a PCP solution.</p>
      `,
      "help.grammar.title": "Generated grammar G_D",
      "help.grammar.body_html": `
        <p>Live grammar from your dominoes using the reduction above. Hover a rule to see its domino; click a rule alternative to expand the matching nonterminal in the tree.</p>
        <p>The reversed suffix <code>a_{in}…a_{i1}</code> forces both branches to align exactly when the PCP instance has a solution.</p>
      `,
      "help.derivations.title": "Derivation explorer",
      "help.derivations.body_html": `
        <p>Enter indices (e.g., <code>1,3,2</code>) to build <code>S⇒T⇒*</code> and <code>S⇒B⇒*</code>. Hover nodes to highlight their word tokens and the grammar rule; expand nonterminals manually or by clicking grammar rules.</p>
        <p>If the words match, you have a witness of ambiguity for <code>G_D</code>.</p>
      `,
      "help.sequence.title": "How sequences map to derivations",
      "help.sequence.body_html": `
        <p>For indices <code>i1…in</code>:</p>
<pre class="mono">T-branch: t_{i1} … t_{in} a_{in} … a_{i1}
B-branch: b_{i1} … b_{in} a_{in} … a_{i1}</pre>
        <p>The suffix <code>a_{in}…a_{i1}</code> forces alignment. Equality ⇔ the sequence solves the PCP instance.</p>
      `,
    },

    "pt-BR": {
      "title.main": "PCP → Ambiguidade de GLC",
      "about.line1": "Uma ferramenta interativa para a redução PCP ⇒ Ambiguidade de GLC.",
      "about.line2": "Construa ou importe uma instância de PCP (dominós), gere a gramática G_D e explore derivações via T e via B.",
      "about.note_ai": "(Webtool construído com apoio de IA Generativa — ChatGPT)",
      "about.dev_block": `
        <strong>Desenvolvido pelo Prof. Bruno Iochins Grisci</strong><br />
        <em>(Webtool construído com IA Generativa)</em><br />
        Departamento de Informática Teórica —
        <a href="https://www.inf.ufrgs.br/site/" target="_blank" rel="noreferrer">Instituto de Informática</a><br />
        <a href="https://www.ufrgs.br/site/" target="_blank" rel="noreferrer">Universidade Federal do Rio Grande do Sul (UFRGS)</a><br />
        Website:
        <a href="https://brunogrisci.github.io/" target="_blank" rel="noreferrer">https://brunogrisci.github.io/</a><br /><br />
        <strong>Baseado e inspirado nas aulas do Prof. Rodrigo Machado:</strong><br />
        <a href="https://link.inf.ufrgs.br/212-AALr" target="_blank" rel="noreferrer">https://link.inf.ufrgs.br/212-AALr</a><br /><br />
        <em>Dica:</em> Experimente antes o gerador TM → PCP Domino (<a href="https://brunogrisci.github.io/tm2pcp" target="_blank" rel="noreferrer">tm2pcp</a>). O .csv exportado funciona como entrada aqui.
      `,

      "label.csv_file": "Importar dominós (.csv):",
      "button.add_domino": "Adicionar dominó",
      "button.clear_dominoes": "Limpar dominós",
      "button.export_csv": "Exportar CSV",
      "button.delete": "Excluir",
      "button.build_derivation": "Construir derivações",
      "button.clear_derivations": "Limpar derivações",
      "button.zoom_in": "Aproximar",
      "button.zoom_out": "Afastar",
      "button.clear_tree": "Limpar árvore",
      "button.load_example": "Carregar exemplo",
      "tree.select_rule": "Selecione um número de regra:",
      "tree.select_rule_title": "Escolha uma regra",

      "title.dominoes": "Instância de PCP (dominós)",
      "note.dominoes": "Cada dominó i é um par (t_i, b_i). A ferramenta cria um terminal novo a_i usado como “marcador de índice” na gramática.",
      "domino.header.id": "ID",
      "domino.header.top": "Topo (t_i)",
      "domino.header.bottom": "Base (b_i)",
      "domino.header.actions": "Ações",

      "summary.k": "k",
      "summary.ai": "Símbolos de índice",
      "note.ai_symbols": "Os símbolos a1, a2, … são terminais novos e não devem aparecer em nenhum t_i ou b_i.",

      "title.grammar": "GLC gerada G_D",
      "note.grammar": "A gramática é construída a partir dos dominós usando a redução clássica PCP ⇒ AMB_GLC.",

      "title.derivations": "Explorador de derivações",
      "label.sequence": "Sequência de índices (ex.: 1,3,2):",
      "note.sequence": "Isto constrói duas derivações: S⇒T⇒* e S⇒B⇒*. Se as saídas coincidirem, você encontrou uma testemunha de ambiguidade.",

      "result.top_concat": "Concat. topo",
      "result.bottom_concat": "Concat. base",
      "result.word_T": "Palavra via T",
      "result.word_B": "Palavra via B",
      "result.match_yes": "COINCIDE",
      "result.match_no": "NÃO COINCIDE",
      "result.match_explain_yes": "Esta sequência testemunha ambiguidade: a mesma palavra terminal é gerada via T e via B.",
      "result.match_explain_no": "Esta sequência não testemunha ambiguidade. Tente outra sequência ou aumente o comprimento.",
      "result.match_weak": "COINCIDÊNCIA PARCIAL",
      "result.match_explain_weak": "Os caracteres concatenados coincidem, mas a estrutura de tokens difere. Isto não é uma solução formal do PCP.",

      "tree.label": "Árvore",
      "note.undecidable": "Lembrete: esta ferramenta não decide PCP nem ambiguidade de GLC. Ela ajuda a explorar a redução e encontrar testemunhas quando uma solução aparece.",

    "footer.note": "Ferramenta educacional; não há procedimento de decisão para problemas indecidíveis.",
    "footer.code_label": "Código no GitHub:",
    "footer.licensed_label": "Licenciado sob",

      "status.ready_empty": "Pronto. Adicione dominós ou importe um CSV.",
      "status.ready_k": "Pronto. A instância atual tem k={K} dominós.",
      "status.need_dominoes": "Adicione/importe ao menos um dominó antes.",
      "status.csv_bad_header": "O cabeçalho do CSV deve conter: top_string e bottom_string (como no export do tm2pcp).",
      "status.import_ok": "CSV importado com sucesso (k={K}).",
      "status.import_fail": "Falha ao importar CSV: {ERR}",
      "status.export_none": "Nada para exportar: não há dominós.",
      "status.export_ok": "CSV exportado (k={K}).",
      "status.example_loaded": "Um pequeno exemplo foi carregado.",
      "status.bad_sequence": "Sequência inválida. Use inteiros positivos separados por vírgulas/espaços (ex.: 1,3,2).",
      "status.empty_sequence": "A sequência está vazia. Soluções de PCP precisam ser não vazias.",
      "status.sequence_out_of_range": "A sequência contém um índice fora do intervalo 1..{K}.",
      "status.forbidden_ai": "Seus dominós contêm padrões como a1, a2, ... Esses símbolos são reservados como “terminais novos” na redução. Renomeie esses terminais na instância de PCP.",
      "status.witness_ambiguity": "Coincidência encontrada: esta sequência testemunha a ambiguidade de G_D.",
      "status.no_witness": "Não houve coincidência para esta sequência.",

      "grammar.empty": "Adicione ao menos um dominó para gerar G_D.",
      "grammar.forbidden_ai": "Não foi possível gerar G_D porque sua instância contém padrões reservados a1, a2, ...\nRenomeie esses terminais na instância de PCP.",

      "summary.prefix": "Prefixo de índice",

      "result.aligned_legend": "Verde = igual, vermelho = diferente, · = token faltando.",
      "help.solver_bounded.title": "Solver (M)PCP Limitado",
      "help.solver_bounded.body_html": `
        <p>Este solver tenta achar solução para a instância do <strong>(Modificado) Problema da Correspondência de Post</strong> exibida na ferramenta.</p>
        <p><strong>Importante:</strong> PCP é <em>indecidível</em>. Isso significa que <strong>nenhum algoritmo</strong> consegue decidir sempre se existe solução.</p>
        <p>Logo, o solver <em>não</em> contradiz a indecidibilidade: ele faz uma <strong>busca limitada</strong> pelos parâmetros de <em>profundidade</em>, <em>tempo</em> e <em>número de estados explorados</em>.</p>

        <h4 style="margin-top:0.8em;">Como o solver funciona</h4>
        <p>Segue uma <strong>busca incremental por prefixos compatíveis</strong>, inspirada em Ling Zhao (tese, Cap. 2.2) e no solver/blog de Arne Vogel.</p>
        <p>A busca mantém apenas sequências de índices que permanecem prefixo consistentes:</p>
<pre style="background:var(--panel-bg); padding:0.6em; border-radius:0.5rem;">// Pseudocódigo (simplificado)
solucoes := todas as sequências de 1 peça que são prefixo consistentes

para profundidade = 1 .. profundidadeMax:
  novas := {}
  para seq em solucoes:
    para cada dominó j:
      se concat(top(seq)+top(j)) e concat(base(seq)+base(j))
         forem prefixo compatíveis:
         adicionar (seq + j) em novas

  se alguma seq em novas tem topo = base:
     return seq  // solução encontrada

  solucoes := novas

parar quando os limites forem atingidos
</pre>
        <p>Sequências incompatíveis por prefixo são descartadas cedo para podar a busca, mas o espaço segue infinito em geral.</p>

        <h4 style="margin-top:0.8em;">Por que busca limitada é compatível com indecidibilidade</h4>
        <p>Se encontrar uma solução, ela é <strong>correta</strong>. Se parar sem solução, isso <strong>não</strong> prova que não exista — pode exigir mais profundidade/tempo/nós.</p>
        <p>Essa assimetria reflete a indecidibilidade: instâncias positivas podem ser achadas; instâncias negativas não podem ser certificadas em geral.</p>

        <h4 style="margin-top:0.8em;">Controles do solver</h4>
        <ul>
          <li><strong>Tentar resolver:</strong> inicia a busca limitada com os parâmetros atuais.</li>
          <li><strong>Cancelar:</strong> interrompe a busca em execução imediatamente.</li>
          <li><strong>Carregar solução na área de trabalho:</strong> insere a sequência encontrada para inspeção.</li>
        </ul>
        <p>Ao parar, a interface mostra se encontrou solução ou qual limite (profundidade, tempo, nós) encerrou a busca.</p>

        <h4 style="margin-top:0.8em;">Equívocos comuns</h4>
        <ul>
          <li><strong>“Não achou solução, então não existe.”</strong><br>Isso <em>não</em> é garantido; a busca limitada pode parar antes de chegar a uma solução válida.</li>
          <li><strong>“Aumentar limites torna o solver um decisor.”</strong><br>Nenhum limite finito decide todas as instâncias de PCP; algumas exigem buscas arbitrariamente longas.</li>
          <li><strong>“Falha do solver contradiz a indecidibilidade.”</strong><br>Pelo contrário: soluções podem aparecer; não-soluções não podem ser certificadas de modo confiável.</li>
        </ul>
        <p style="margin-top:0.8em; font-size:0.9em;"><em>Créditos:</em> Algoritmo inspirado em Ling Zhao (Cap. 2.2) e Arne Vogel; adaptação em JavaScript para esta ferramenta educacional.</p>
      `,
      "help.solver_max_depth.title": "Profundidade máx.",
      "help.solver_max_depth.body_html": `
        <p>Define o comprimento máximo da sequência de dominós que o solver irá explorar.</p>
        <p>Profundidade <em>d</em> significa considerar apenas sequências com até <em>d</em> dominós.</p>
        <p>Profundidades maiores aumentam a chance de encontrar soluções que precisem de sequências longas, mas o espaço de busca cresce exponencialmente.</p>
        <p>Se o solver parar por esse limite, uma solução pode existir em uma profundidade maior.</p>
      `,
      "help.solver_time_limit.title": "Limite de tempo (ms)",
      "help.solver_time_limit.body_html": `
        <p>Define o <strong>tempo máximo de relógio</strong> (em milissegundos) que o solver pode rodar.</p>
        <p>Se o limite for atingido, o solver para imediatamente, mesmo havendo estados ainda não explorados.</p>
        <p>O limite ajuda a manter a interface responsiva, pois a busca de PCP cresce muito rápido.</p>
        <p>Parar por tempo <strong>não</strong> significa que não exista solução.</p>
      `,
      "help.solver_node_limit.title": "Limite de nós",
      "help.solver_node_limit.body_html": `
        <p>Define o <strong>número máximo de estados de busca (nós)</strong> que o solver pode expandir.</p>
        <p>Cada nó corresponde a uma sequência parcial de dominós que segue sendo prefixo consistente.</p>
        <p>Limitar nós controla diretamente o uso de memória e evita esgotar os recursos do sistema.</p>
        <p>Atingir esse limite <strong>não</strong> implica que a instância não tenha solução.</p>
      `,
      "help.solver_toggle_mpcp.title": "PCP vs. MPCP",
      "help.solver_toggle_mpcp.body_html": `
        <h4 style="margin-top:0.8em;">PCP vs. MPCP</h4>
        <p>No <strong>Problema da Correspondência de Post (PCP)</strong>, uma solução é qualquer sequência não vazia de dominós cujas strings de topo e base coincidam após a concatenação. Não há restrição sobre qual dominó deve aparecer primeiro.</p>
        <p>O <strong>PCP Modificado (MPCP)</strong> adiciona uma única restrição: a sequência de solução deve <strong>começar com um dominó designado como primeiro</strong>. Fora isso, a condição de coincidência é a mesma do PCP.</p>
        <p>Essa restrição extra é muito útil em reduções a partir de máquinas de Turing, pois permite forçar uma <strong>configuração inicial</strong> bem definida da computação simulada.</p>
      `,
      "help.main_tool.title": "O que esta ferramenta faz?",
      "help.main_tool.body_html": `
        <p><strong>pcp2cfg</strong> visualiza a redução <code>PCP ⇒ ambiguidade de GLC</code>.</p>
        <ul>
          <li><strong>PCP</strong>: Dado <code>(t_i,b_i)</code>, encontrar sequência não vazia cujas concatenações topo/base coincidam.</li>
          <li><strong>Ambiguidade de GLC</strong>: há duas árvores de derivação distintas para alguma palavra.</li>
          <li><strong>Redução (das transparências)</strong>: para os dominós 1..k, construa <code>G_D</code>:
<pre class="mono">S → T | B
T → t1 T a1 | … | tk T ak | t1 a1 | … | tk ak
B → b1 B a1 | … | bk B ak | b1 a1 | … | bk ak</pre>
          Uma solução <code>i1…in</code> gera a mesma palavra via <code>T</code> e <code>B</code>, provando ambiguidade.</li>
        </ul>
        <p>Use os painéis para inserir/importar dominós, ver <code>G_D</code>, rodar o solver limitado e construir/expandir árvores.</p>
      `,
      "help.csv_import.title": "Importação de CSV",
      "help.csv_import.body_html": `
        <p>Importe um CSV com cabeçalho <code>domino_id,top_string,bottom_string</code> (mesmo formato do export do tm2pcp). O CSV PCP exportado do tm2pcp funciona aqui.</p>
        <p>Topo/base são tokenizados por espaços; células vazias são permitidas. Dominós são renumerados 1..k.</p>
      `,
      "help.dominoes.title": "Dominós e símbolos a_i",
      "help.dominoes.body_html": `
        <p>Edite cada <code>(t_i, b_i)</code> como chips. Arraste para reordenar; dê duplo clique para enviar à área de trabalho; exclua individualmente.</p>
        <p>A redução cria terminais novos <code>a1…ak</code> como marcadores; evite padrões <code>a1</code> nos seus strings. O sistema escolhe um prefixo seguro.</p>
      `,
      "help.workspace.title": "Área de trabalho (sequência)",
      "help.workspace.body_html": `
        <p>Monte a sequência arrastando/dando duplo clique. Os tokens de cada dominó aparecem abaixo; ao passar o mouse sobre um dominó, seus tokens em Topo/Base são destacados.</p>
        <p>Use “Área de trabalho → Sequência” para copiar índices ou “Sequência → Área de trabalho” para carregar do campo de índices. Se Topo e Base coincidem, você achou uma solução de PCP.</p>
      `,
      "help.grammar.title": "Gramática gerada G_D",
      "help.grammar.body_html": `
        <p>Gramática ao vivo pelos dominós via redução. Passe o mouse para ver o dominó correspondente; clique numa alternativa para expandir o não terminal na árvore.</p>
        <p>O sufixo invertido <code>a_{in}…a_{i1}</code> força alinhamento entre os dois ramos quando há solução de PCP.</p>
      `,
      "help.derivations.title": "Explorador de derivações",
      "help.derivations.body_html": `
        <p>Digite índices (ex.: <code>1,3,2</code>) para construir <code>S⇒T⇒*</code> e <code>S⇒B⇒*</code>. Passe o mouse sobre nós para destacar tokens e a regra; expanda não terminais manualmente ou clicando em regras.</p>
        <p>Se as palavras coincidirem, você tem uma testemunha de ambiguidade de <code>G_D</code>.</p>
      `,
      "help.sequence.title": "Como sequências viram derivações",
      "help.sequence.body_html": `
        <p>Para índices <code>i1…in</code>:</p>
<pre class="mono">Via T: t_{i1} … t_{in} a_{in} … a_{i1}
Via B: b_{i1} … b_{in} a_{in} … a_{i1}</pre>
        <p>O sufixo <code>a_{in}…a_{i1}</code> força alinhamento. Igualdade ⇔ a sequência resolve o PCP.</p>
      `,
    }
  };

  // Extra UI strings (workspace + bounded solver)
  Object.assign(I18N.en, {
    "title.workspace": "Workspace (sequence of dominoes)",
    "note.workspace": "Drop tiles here in order. You can reorder or delete individual tiles.",
    "note.workspace_sync": "Sync with the index sequence input below.",
    "button.clear_workspace": "Clear workspace",
    "label.wrap_strings": "Wrap strings",
    "workspace.top": "Top",
    "workspace.bottom": "Bottom",

    "button.seq_to_workspace": "Sequence → Workspace",
    "button.workspace_to_seq": "Workspace → Sequence",

    "solver.title_mpcp": "MPCP Solver (bounded)",
    "solver.title_pcp": "PCP Solver (bounded)",
    "solver.note": "PCP is undecidable. This solver performs a bounded search and may fail even if a solution exists.",
    "solver.inspiration": `Inspired by Arne Vogel's blogpost and algorithm (<a href="https://www.arnevogel.com/post-correspondence-problem/" target="_blank" rel="noreferrer">arnevogel.com</a>) and Ling Zhao's Thesis (Chapter 2.2) (<a href="https://webdocs.cs.ualberta.ca/~games/PCP/thesis/pcp.pdf" target="_blank" rel="noreferrer">pcp.pdf</a>).`,
    "solver.toggle_mpcp": "Use MPCP (force start with 1)",
    "solver.depth_label": "Max depth:",
    "solver.time_label": "Time limit (ms):",
    "solver.nodes_label": "Node limit:",
    "solver.solve_btn": "Try solve",
    "solver.cancel_btn": "Cancel",
    "solver.load_btn": "Load solution into workspace",
    "solver.progress_depth": "Searching depth D={D}… (nodes explored: {N})",
    "solver.solution_found": "Solution found: {SEQ}",
    "solver.solution_found_verbose": "Found solution (length {LEN}) in {MS} ms after expanding {NODES} nodes. Sequence (1-based indices): {SEQ}",
    "solver.no_solution_found": "No solution found within the current bounds.",
    "solver.done": "Done. Nodes explored: {N}",
    "solver.cancelled": "Cancelled.",
    "solver.node_limit_hit": "Stopped: node limit reached.",
    "solver.time_limit_hit": "Stopped: time limit reached.",

    "status.seq_to_workspace": "Loaded the index sequence into the workspace.",
    "status.workspace_to_seq": "Copied the workspace sequence into the index sequence input.",
    "status.workspace_cleared": "Workspace cleared.",
    "status.solver_found": "A bounded solution was found (this witnesses ambiguity in G_D).",
    "status.solver_loaded": "Loaded the solver solution into the workspace.",
    "status.solver_none": "No solution found within the selected bounds.",
    "status.solver_cancelled": "Solver cancelled.",
    "status.solver_limits": "Solver stopped due to limits (time/nodes/depth).",

    "result.match_yes_pcp": "MATCH",
    "result.match_no_pcp": "NO MATCH",
    "result.match_explain_yes_pcp": "Top and Bottom strings match perfectly (tokens are identical).",
    "result.match_explain_no_pcp": "Top and Bottom strings do not match.",
    "result.match_explain_weak_pcp": "Concatenated characters match, but tokens differ (e.g. 'ab' vs 'a' 'b'). Not a solution."
  });

  Object.assign(I18N["pt-BR"], {
    "title.workspace": "Área de trabalho (sequência de dominós)",
    "note.workspace": "Solte as peças aqui em ordem. Você pode reordenar ou remover peças individuais.",
    "note.workspace_sync": "Sincronize com o campo de sequência de índices abaixo.",
    "button.clear_workspace": "Limpar área de trabalho",
    "label.wrap_strings": "Quebrar linhas das strings",
    "result.match_yes_pcp": "COINCIDE",
    "result.match_no_pcp": "NÃO COINCIDE",
    "result.match_explain_yes_pcp": "As strings do Topo e Base coincidem perfeitamente (tokens idênticos).",
    "result.match_explain_no_pcp": "As strings do Topo e Base não coincidem.",
    "result.match_explain_weak_pcp": "Caracteres concatenados coincidem, mas os tokens diferem (ex.: 'ab' vs 'a' 'b'). Não é uma solução.",
    "workspace.top": "Topo",
    "workspace.bottom": "Base",

    "button.seq_to_workspace": "Sequência → Área de trabalho",
    "button.workspace_to_seq": "Área de trabalho → Sequência",

    "solver.title_mpcp": "Solver de MPCP (limitado)",
    "solver.title_pcp": "Solver de PCP (limitado)",
    "solver.note": "PCP é indecidível. Este solver faz uma busca limitada e pode falhar mesmo que exista solução.",
    "solver.inspiration": `Inspirado no blogpost e algoritmo de Arne Vogel (<a href="https://www.arnevogel.com/post-correspondence-problem/" target="_blank" rel="noreferrer">arnevogel.com</a>) e na Tese de Ling Zhao (Capítulo 2.2) (<a href="https://webdocs.cs.ualberta.ca/~games/PCP/thesis/pcp.pdf" target="_blank" rel="noreferrer">pcp.pdf</a>).`,
    "solver.toggle_mpcp": "Usar MPCP (forçar começar com 1)",
    "solver.depth_label": "Profundidade máx.:",
    "solver.time_label": "Limite de tempo (ms):",
    "solver.nodes_label": "Limite de nós:",
    "solver.solve_btn": "Tentar resolver",
    "solver.cancel_btn": "Cancelar",
    "solver.load_btn": "Carregar solução na área de trabalho",
    "solver.progress_depth": "Buscando profundidade D={D}… (nós explorados: {N})",
    "solver.solution_found": "Solução encontrada: {SEQ}",
    "solver.solution_found_verbose": "Solução encontrada (tamanho {LEN}) em {MS} ms após expandir {NODES} nós. Sequência (índices começando em 1): {SEQ}",
    "solver.no_solution_found": "Nenhuma solução encontrada dentro dos limites atuais.",
    "solver.done": "Concluído. Nós explorados: {N}",
    "solver.cancelled": "Cancelado.",
    "solver.node_limit_hit": "Interrompido: limite de nós atingido.",
    "solver.time_limit_hit": "Interrompido: limite de tempo atingido.",

    "status.seq_to_workspace": "Sequência de índices carregada na área de trabalho.",
    "status.workspace_to_seq": "Sequência da área de trabalho copiada para o campo de sequência de índices.",
    "status.workspace_cleared": "Área de trabalho limpa.",
    "status.solver_found": "Uma solução limitada foi encontrada (isso evidencia ambiguidade em G_D).",
    "status.solver_loaded": "Solução do solver carregada na área de trabalho.",
    "status.solver_none": "Nenhuma solução encontrada dentro dos limites selecionados.",
    "status.solver_cancelled": "Solver cancelado.",
    "status.solver_limits": "Solver interrompido por limites (tempo/nós/profundidade)."
  });


  // -----------------------------
  // i18n runtime (tm2pcp-like)
  // -----------------------------
  function interpolate(str, params) {
    return String(str).replace(/\{(\w+)\}/g, (_, k) =>
      params && params[k] != null ? String(params[k]) : `{${k}}`
    );
  }

  function getLang(storageKey = "pcp2cfg-lang") {
    const saved = localStorage.getItem(storageKey);
    if (saved && I18N[saved]) return saved;
    return "en";
  }

  function setLang(lang, storageKey = "pcp2cfg-lang") {
    if (!I18N[lang]) lang = "en";
    localStorage.setItem(storageKey, lang);
    document.documentElement.lang = lang;
  }

  function t(key, params = {}) {
    const lang = getLang(window.__pcp2cfg_lang_storage_key || "pcp2cfg-lang");
    const table = I18N[lang] || I18N.en;
    const fallback = I18N.en || {};
    const raw = (table[key] != null) ? table[key] : (fallback[key] != null ? fallback[key] : key);
    return interpolate(raw, params);
  }

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-html]").forEach(el => {
      const key = el.getAttribute("data-i18n-html");
      el.innerHTML = t(key);
    });

    // If help modal is open, allow HTML refresh through main page hook.
    if (typeof window.refreshHelpModal === "function") window.refreshHelpModal();
  }

  function setLanguage(lang) {
    setLang(lang, window.__pcp2cfg_lang_storage_key || "pcp2cfg-lang");
    applyI18n();
  }

  function initLanguageFromStorage(storageKey = "pcp2cfg-lang") {
    window.__pcp2cfg_lang_storage_key = storageKey;
    const lang = getLang(storageKey);
    setLang(lang, storageKey);
    applyI18n();
  }

  // Expose
  window.t = t;
  window.applyI18n = applyI18n;
  window.setLanguage = setLanguage;
  window.initLanguageFromStorage = initLanguageFromStorage;
})();
