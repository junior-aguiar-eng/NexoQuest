import type { InteractiveLegalQuestion } from "./block1Questions";
import { BLOCK_1_LEGAL_QUESTIONS } from "./block1Questions";

export interface PresetQuiz {
  id: string;
  title: string;
  disciplineBadge: string;
  discipline: "processo-civil" | "constitucional" | "penal" | "misto";
  description: string;
  questionCount: number;
  estimatedMinutes: number;
  difficulty: "FGV / ENAM" | "Magistratura";
  questions: InteractiveLegalQuestion[];
}

export const CONSTITUCIONAL_QUESTIONS: InteractiveLegalQuestion[] = [
  {
    id: "q-const-01",
    sequence: 1,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 1,
    discipline: "DIREITO CONSTITUCIONAL",
    point: "Teoria Geral dos Direitos Fundamentais",
    umtTitle: "Eficácia Horizontal Direta dos Direitos Fundamentais",
    format: "case_narrative",
    difficulty: "hard",
    focus: "jurisprudence",
    stem: `Uma renomada entidade privada desportiva, constituída sob a forma de associação sem fins lucrativos, instaurou procedimento administrativo para expulsar um de seus sócios fundadores por suposto descumprimento estatutário. A diretoria da associação deliberou de forma sumária pela exclusão, sem notificação prévia do associado para apresentar defesa ou produzir provas, fundamentando a decisão no princípio da estrita autonomia da vontade privada e na ausência de expressa disposição contratual em contrário.
    
Inconformado, o associado ajuizou ação ordinária com pedido de nulidade do ato de expulsão. À luz da doutrina e da jurisprudência consolidada do Supremo Tribunal Federal sobre a eficácia dos direitos fundamentais nas relações privadas (Drittwirkung), assinale a afirmativa correta:`,
    alternatives: [
      {
        label: "A",
        text: "O ato de exclusão é nulo, pois os direitos fundamentais ao contraditório e à ampla defesa incidem de forma direta e imediata nas relações entre particulares, mitigando a soberania irrestrita da autonomia privada."
      },
      {
        label: "B",
        text: "O ato de exclusão é válido, visto que a Constituição Federal vincula exclusivamente os poderes públicos, não incidindo nas decisões internas de entes privados sem fins lucrativos."
      },
      {
        label: "C",
        text: "A eficácia horizontal dos direitos fundamentais no Brasil é meramente indireta ou mediata, dependendo de expressa previsão na legislação infraconstitucional civil para invalidar a exclusão."
      },
      {
        label: "D",
        text: "A ampla defesa aplica-se às associações apenas se estas receberem incentivos ou subvenções de recursos públicos estatais."
      },
      {
        label: "E",
        text: "A expulsão sumária só seria juridicamente inválida se configurasse ato de discriminação racial ou de gênero expressamente vedado pelo Código Civil."
      }
    ],
    correctAnswer: "A",
    diagnosis: "O STF fixou a tese da eficácia horizontal direta e imediata dos direitos fundamentais nas relações entre particulares (ex: RE 201.819/RJ - Caso UBC), sendo nula a exclusão sumária de associado sem garantia de contraditório e ampla defesa.",
    legalReasoning: "Os direitos fundamentais vinculam tanto os poderes públicos quanto os entes privados em suas relações jurídicas (eficácia horizontal direta). A autonomia privada não confere salvo-conduto para desrespeito ao devido processo legal substancial.",
    legalBasis: "Art. 5º, LIV e LV, da Constituição Federal de 1988 e RE 201.819/RJ (STF).",
    precedents: ["STF, RE 201.819/RJ, Rel. Min. Maurício Corrêa, Rel. p/ Acórdão Min. Gilmar Mendes", "STF, Tema 643/RG"],
    doctrine: ["Gilmar Mendes / Paulo Branco — Curso de Direito Constitucional", "Robert Alexy — Teoria dos Direitos Fundamentais"],
    distractorAnalysis: {
      A: "Alternativa correta. Traduz perfeitamente a jurisprudência vinculante do STF sobre eficácia horizontal direta.",
      B: "Incorreta. Adota a teoria norte-americana da 'State Action', rejeitada pela ordem constitucional brasileira.",
      C: "Incorreta. A teoria da eficácia mediata/indireta (Guenther Dürig) foi superada pelo STF em favor da eficácia direta.",
      D: "Incorreta. A vinculação independe do recebimento de fomento estatal.",
      E: "Incorreta. A garantia do contraditório e da ampla defesa independe da presença de discriminação odiosa específica."
    }
  },
  {
    id: "q-const-02",
    sequence: 2,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 2,
    discipline: "DIREITO CONSTITUCIONAL",
    point: "Teoria Geral dos Direitos Fundamentais",
    umtTitle: "Máxima da Proporcionalidade e Limites dos Limites",
    format: "case_narrative",
    difficulty: "hard",
    focus: "doctrine",
    stem: `Lei estadual determinou a proibição total e absoluta da comercialização de bebidas energéticas em estabelecimentos comerciais locais, sob a justificativa de preservação da saúde cardiovascular da população jovem. Fabricantes e comerciantes impetraram Mandado de Segurança Coletivo sustentando a inconstitucionalidade material da norma por violação desproporcional à livre iniciativa e ao princípio da proporcionalidade.
    
No exame da constitucionalidade da referida restrição de direito fundamental, sob a ótica da estrutura trifásica da proporcionalidade postulada pela doutrina constitucional contemporânea, é correto afirmar:`,
    alternatives: [
      {
        label: "A",
        text: "A norma atende à adequação e à necessidade, devendo prevalecer o juízo de conveniência discricionária do legislador estadual."
      },
      {
        label: "B",
        text: "A proibição total vulnera o subelemento da necessidade, pois medidas menos restritivas (como exigência de rotulagem com advertência e restrição por faixa etária) alcançariam a finalidade sanitária com menor sacrifício à livre iniciativa."
      },
      {
        label: "C",
        text: "O princípio da proporcionalidade não possui assento constitucional explícito, sendo vedado ao Poder Judiciário utilizá-lo para controlar restrições legislativas a direitos econômicos."
      },
      {
        label: "D",
        text: "A análise de proporcionalidade em sentido estrito dispensa a prévia comprovação de adequação e necessidade dos meios empregados."
      },
      {
        label: "E",
        text: "A vedação absoluta é constitucional sempre que a justificativa for a tutela da saúde pública, direito que possui hierarquia formal superior aos direitos de atividade econômica."
      }
    ],
    correctAnswer: "B",
    diagnosis: "Pelo subprincípio da necessidade (vedação do excesso), o meio estatal restritivo somente é constitucional se não houver alternativa menos gravosa e igualmente idônea.",
    legalReasoning: "A máxima da proporcionalidade (Alexy) exige adequação, necessidade (exame do meio menos gravoso) e proporcionalidade em sentido estrito (sopesamento). Proibições absolutas quando cabem medidas de regulação violam a necessidade.",
    legalBasis: "Art. 5º, LIV (devido processo legal substantivo) e art. 170, caput e parágrafo único, da CF/88.",
    distractorAnalysis: {
      A: "Incorreta. A discricionariedade legislativa é limitada pelo postulado da proporcionalidade.",
      B: "Alternativa correta. Aplicação perfeita do subcritério da necessidade.",
      C: "Incorreta. A jurisprudência do STF extrai a proporcionalidade do devido processo substantivo (art. 5º, LIV).",
      D: "Incorreta. O teste da proporcionalidade é sequencial e cumulativo.",
      E: "Incorreta. Não há hierarquia abstrata formal entre normas constitucionais."
    }
  },
  {
    id: "q-const-03",
    sequence: 3,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 3,
    discipline: "DIREITO CONSTITUCIONAL",
    point: "Direitos Sociais e Jurisdição Constitucional",
    umtTitle: "Reserva do Possível e Mínimo Existencial",
    format: "case_narrative",
    difficulty: "hard",
    focus: "statute",
    stem: `Cidadão portador de doença grave rara e sem recursos financeiros pleiteou em juízo o fornecimento de fármaco registrado na ANVISA, mas não incorporado expressamente nos Protocolos Clínicos e Diretrizes Terapêuticas (PCDT) do SUS. O Ente Público contestou a demanda alegando a cláusula da reserva do possível, sustentando que o acolhimento do pedido importaria em violação ao princípio da separação dos poderes e à isonomia orçamentária.
    
Considerando a jurisprudência fixada pelo STF (Tema 6/RG) e STJ (Tema 106/RR), assinale a opção que reflete os requisitos cumulativos para a concessão judicial do medicamento:`,
    alternatives: [
      {
        label: "A",
        text: "A reserva do possível opera como óbice intransponível, sendo vedada a concessão de medicamento fora da lista oficial do SUS sob qualquer hipótese."
      },
      {
        label: "B",
        text: "Basta a prescrição de médico particular para obrigar o Estado a fornecer o medicamento, independentemente de comprovação de hipossuficiência ou ineficácia do fármaco fornecido pelo SUS."
      },
      {
        label: "C",
        text: "É exigida a comprovação da imprescindibilidade do medicamento e ineficácia dos fármacos fornecidos pelo SUS, incapacidade financeira do requerente e existência de registro do medicamento na ANVISA."
      },
      {
        label: "D",
        text: "O fornecimento independe de registro na ANVISA caso haja estudo científico internacional comprovando eficácia superior."
      },
      {
        label: "E",
        text: "A responsabilidade pelo fornecimento de remédios fora da lista do SUS é exclusivamente do Município de domicílio do paciente."
      }
    ],
    correctAnswer: "C",
    diagnosis: "O STJ no Tema 106 fixou os 3 requisitos cumulativos: 1) Comprovação por laudo fundamentado da imprescindibilidade; 2) Incapacidade financeira; 3) Registro na ANVISA.",
    legalReasoning: "A garantia do mínimo existencial prevalece sobre a alegação genérica de reserva do possível, desde que preenchidos os requisitos objetivos e cumulativos delineados pelos tribunais superiores.",
    legalBasis: "Art. 196 da CF/88; STJ Tema 106 (REsp 1.657.156/RJ); STF Tema 6 (RE 566.471/RN).",
    distractorAnalysis: {
      A: "Incorreta. A reserva do possível não é obstáculo absoluto em face do direito à vida e à saúde.",
      B: "Incorreta. É indispensável laudo demonstrando a ineficácia dos tratamentos já padronizados.",
      C: "Alternativa correta. Resume precisamente a tese firmada no Tema 106/STJ.",
      D: "Incorreta. O registro na ANVISA é requisito essencial, salvo exceções estritas do Tema 500/STF.",
      E: "Incorreta. A responsabilidade é solidária dos entes federados (Tema 793/STF)."
    }
  },
  {
    id: "q-const-04",
    sequence: 4,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 4,
    discipline: "DIREITO CONSTITUCIONAL",
    point: "Controle de Constitucionalidade",
    umtTitle: "Cláusula de Reserva de Plenário (Art. 97 CF)",
    format: "propositions",
    difficulty: "medium",
    focus: "jurisprudence",
    stem: `Analise as seguintes proposições sobre a Cláusula de Reserva de Plenário (art. 97 da CF/88 e Súmula Vinculante nº 10 do STF):
    
I. Viola a cláusula de reserva de plenário a decisão de órgão fracionário de tribunal que, embora não declare expressamente a inconstitucionalidade de lei ou ato normativo do poder público, afasta sua incidência, no todo ou em parte.
II. É dispensada a submissão ao plenário do tribunal quando já houver pronunciamento deste ou do plenário do Supremo Tribunal Federal sobre a questão.
III. As Turmas Recursais dos Juizados Especiais submetem-se rigorosamente à cláusula de reserva de plenário do art. 97 da CF/88 para afastar aplicação de lei federal.
    
Está correto o que se afirma em:`,
    alternatives: [
      { label: "A", text: "I e II, apenas." },
      { label: "B", text: "I, apenas." },
      { label: "C", text: "II e III, apenas." },
      { label: "D", text: "I, II e III." },
      { label: "E", text: "III, apenas." }
    ],
    correctAnswer: "A",
    diagnosis: "As proposições I e II estão corretas (Súmula Vinculante 10 e art. 949, parágrafo único, do CPC). A proposição III está incorreta pois o STF já pacificou que Turmas Recursais não são tribunais para fins do art. 97 da CF.",
    legalReasoning: "A cláusula do art. 97 da CF se aplica apenas a tribunais de 2º grau e superiores. Turmas recursais de juizados especiais não são tribunais e podem afastar leis sem plenário (STF, ARE 807.502).",
    legalBasis: "Art. 97 da CF/88; Súmula Vinculante 10 do STF; Art. 949, parágrafo único, do CPC.",
    distractorAnalysis: {
      A: "Alternativa correta. Identifica perfeitamente a invalidade da proposição III.",
      B: "Incorreta. A proposição II também está expressamente albergada no art. 949, p. único do CPC.",
      C: "Incorreta. A proposição III é errada e a I é correta.",
      D: "Incorreta. A proposição III é falsa.",
      E: "Incorreta. A proposição III é expressamente contrária à jurisprudência do STF."
    }
  },
  {
    id: "q-const-05",
    sequence: 5,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 5,
    discipline: "DIREITO CONSTITUCIONAL",
    point: "Direitos e Garantias Fundamentais",
    umtTitle: "Inviolabilidade de Domicílio e Flagrante Delito (Tema 280 STF)",
    format: "conceptual",
    difficulty: "easy",
    focus: "jurisprudence",
    stem: `De acordo com a tese fixada pelo Supremo Tribunal Federal no julgamento do Recurso Extraordinário nº 603.616/RO (Tema 280 da Repercussão Geral), a entrada forçada em domicílio sem mandado judicial, mesmo em período noturno, é legítima apenas quando:`,
    alternatives: [
      {
        label: "A",
        text: "Amparada em fundadas razões, devidamente justificadas a posteriori, que indiquem que dentro da casa ocorre situação de flagrante delito."
      },
      {
        label: "B",
        text: "Houver denúncia anônima preliminar, independentemente de prévia investigação policial ou campana no local."
      },
      {
        label: "C",
        text: "O morador possuir condenação criminal transitada em julgado anterior por crime hediondo ou equiparado."
      },
      {
        label: "D",
        text: "Autorizada verbalmente pelo proprietário do imóvel locado, mesmo com a recusa do locatário morador."
      },
      {
        label: "E",
        text: "A operação policial for acompanhada por ao menos uma autoridade do Ministério Público estadual."
      }
    ],
    correctAnswer: "A",
    diagnosis: "Tema 280/STF: A entrada forçada em domicílio sem mandado judicial só é lícita quando amparada em fundadas razões (justa causa), justificadas a posteriori.",
    legalReasoning: "A inviolabilidade do domicílio (art. 5º, XI, CF) exige justa causa prévia e auditável, sob pena de nulidade absoluta das provas obtidas e responsabilidade dos agentes públicos.",
    legalBasis: "Art. 5º, XI, CF/88 e STF Tema 280 (RE 603.616/RO).",
    distractorAnalysis: {
      A: "Alternativa correta. Tese exata fixada pelo Plenário do STF.",
      B: "Incorreta. Denúncia anônima isolada não autoriza a invasão domiciliar.",
      C: "Incorreta. Maus antecedentes não dispensam o mandado judicial.",
      D: "Incorreta. A tutela constitucional protege o possuidor/morador direto (locatário).",
      E: "Incorreta. Presença do MP não supre a ausência de fundadas razões."
    }
  }
];

export const PENAL_QUESTIONS: InteractiveLegalQuestion[] = [
  {
    id: "q-penal-01",
    sequence: 1,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 1,
    discipline: "DIREITO PENAL",
    point: "Teoria do Delito e Tipicidade",
    umtTitle: "Princípio da Insignificância e Tipicidade Material",
    format: "case_narrative",
    difficulty: "hard",
    focus: "jurisprudence",
    stem: `Tício, primário e sem antecedentes criminais, foi surpreendido ao subtrair de um grande supermercado três latas de leite em pó avaliadas no total de R$ 45,00 (quarenta e cinco reais), que escondia sob a jaqueta. As mercadorias foram prontamente recuperadas e restituídas integralmente ao estabelecimento comercial, sem nenhum dano ou prejuízo patrimonial. Denunciado pelo Ministério Público pela prática de furto simples (art. 155, caput, do Código Penal), a defesa pleiteou a absolvição sumária do réu.
    
Diante dos vetores delineados pela jurisprudência consolidada do Supremo Tribunal Federal e do Superior Tribunal de Justiça, assinale a afirmativa correta:`,
    alternatives: [
      {
        label: "A",
        text: "O magistrado deve absolver sumariamente o réu em razão da atipicidade material da conduta, por estarem cumulativamente preenchidos os vetores da insignificância (mínima ofensividade, nenhuma periculosidade social, reduzidíssimo grau de reprovabilidade e inexpressividade da lesão)."
      },
      {
        label: "B",
        text: "O princípio da insignificância é inaplicável ao furto praticado em grandes redes de supermercados dotadas de sistema eletrônico de vigilância."
      },
      {
        label: "C",
        text: "A ausência de prejuízo material descaracteriza a ilicitude da conduta, ensejando a absolvição pela ocorrência de estado de necessidade presumido."
      },
      {
        label: "D",
        text: "O princípio da insignificância afasta a culpabilidade do agente, devendo o juiz aplicar a medida de segurança de advertência."
      },
      {
        label: "E",
        text: "Por se tratar de crime consumado, a insignificância permite unicamente a redução da pena de um a dois terços, mas não a absolvição."
      }
    ],
    correctAnswer: "A",
    diagnosis: "A insignificância exclui a tipicidade material do fato punível. Preenchidos os 4 requisitos do HC 84.412/STF, impõe-se a absolvição por atipicidade com base no art. 386, III, do CPP.",
    legalReasoning: "A tipicidade penal desdobra-se em formal e material. A inexpressividade da lesão patrimonial afasta o desvalor do resultado e descaracteriza o próprio tipo de injusto penal.",
    legalBasis: "Art. 155, caput, do CP; Art. 386, III, do CPP; STF HC 84.412/SP.",
    distractorAnalysis: {
      A: "Alternativa correta. Enquadramento preciso dos requisitos cumulativos do STF.",
      B: "Incorreta. O sistema de monitoramento não impede a insignificância (Súmula 567/STJ trata de crime impossível).",
      C: "Incorreta. A insignificância exclui a tipicidade material, e não a ilicitude.",
      D: "Incorreta. A insignificância afasta o fato típico, não a culpabilidade.",
      E: "Incorreta. A insignificância opera como causa de atipicidade absoluta, ensejando absolvição plena."
    }
  },
  {
    id: "q-penal-02",
    sequence: 2,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 2,
    discipline: "DIREITO PENAL",
    point: "Teoria da Imputação Objetiva",
    umtTitle: "Criação de Risco Proibido e Âmbito de Autoproteção",
    format: "case_narrative",
    difficulty: "hard",
    focus: "doctrine",
    stem: `Mévio, condutor habilitado e prudente, dirigia seu automóvel estritamente dentro do limite de velocidade regulamentar (40 km/h) e com todas as cautelas exigidas pela legislação de trânsito em via urbana de grande movimento. Repentinamente, Caio, pedestre em estado de embriaguez profunda, desvencilhou-se de seus amigos e atirou-se subitamente na frente do veículo em local proibido para travessia, resultando em seu óbito instantâneo, não obstante a imediata frenagem do condutor.
    
À luz da teoria da imputação objetiva de Claus Roxin e dos preceitos da responsabilidade penal subjetiva, é correto afirmar que a conduta de Mévio:`,
    alternatives: [
      {
        label: "A",
        text: "Configura homicídio culposo na direção de veículo automotor, visto que o resultado morte decorreu causalmente do impacto com seu veículo (conditio sine qua non)."
      },
      {
        label: "B",
        text: "É atípica sob a ótica da imputação objetiva, pois o condutor agiu dentro do risco permitido e o resultado decorreu exclusivamente da conduta de autorresponsabilidade / autocolocação em risco da própria vítima."
      },
      {
        label: "C",
        text: "Configura fato típico e ilícito, restando excluída apenas a culpabilidade por inexigibilidade de conduta diversa."
      },
      {
        label: "D",
        text: "Encontra-se amparada pela excludente de ilicitude do estrito cumprimento do dever legal."
      },
      {
        label: "E",
        text: "Enseja responsabilização penal objetiva do condutor, cabendo ao juízo criminal aplicar a atenuante inominada."
      }
    ],
    correctAnswer: "B",
    diagnosis: "Pela Teoria da Imputação Objetiva, a realização de conduta dentro do risco permitido afasta a tipicidade da ação. Ademais, o resultado se deu por autocolocação da vítima em risco.",
    legalReasoning: "A causalidade natural (nexo físico) não basta para a tipicidade. O tipo penal pressupõe a criação ou incremento de risco não tolerado pela ordem jurídica.",
    legalBasis: "Art. 13 e 18, II, do Código Penal e Teoria da Imputação Objetiva (Roxin).",
    distractorAnalysis: {
      A: "Incorreta. O direito penal brasileiro repele a responsabilidade penal estritamente objetiva.",
      B: "Alternativa correta. Fundamentação doutrinária exata da imputação objetiva.",
      C: "Incorreta. A exclusão se opera no plano do fato típico (tipicidade conglobante/objetiva).",
      D: "Incorreta. Dirigir em trânsito não é cumprimento de dever legal imposto por lei.",
      E: "Incorreta. Não existe responsabilidade objetiva no Direito Penal."
    }
  },
  {
    id: "q-penal-03",
    sequence: 3,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 3,
    discipline: "DIREITO PENAL",
    point: "Iter Criminis e Desistência Voluntária",
    umtTitle: "Tentativa Abandonada e Ponte de Ouro (Art. 15 do CP)",
    format: "case_narrative",
    difficulty: "medium",
    focus: "statute",
    stem: `Semprônio, com inequívoco dolo de matar seu desafeto, desferiu dois disparos de arma de fogo que atingiram a perna da vítima, provocando ferimentos de natureza leve. Embora ainda dispusesse de mais quatro projéteis intactos no tambor do revólver e a vítima estivesse caída e completamente indefesa à sua mercê, Semprônio, por ato voluntário de compaixão e sem qualquer interferência externa, guardou a arma e retirou-se do local.
    
Considerando as regras do Código Penal sobre a tentativa e a disciplina da desistência voluntária (art. 15 do CP), Semprônio deverá responder por:`,
    alternatives: [
      {
        label: "A",
        text: "Tentativa de homicídio qualificado com causa de diminuição de pena de um a dois terços."
      },
      {
        label: "B",
        text: "Apenas pelos atos já praticados (crime de lesão corporal leve), ocorrendo a exclusão da tentativa de homicídio por força da desistência voluntária (ponte de ouro)."
      },
      {
        label: "C",
        text: "Arrependimento eficaz, sendo isento de qualquer pena em virtude do perdão tácito legal."
      },
      {
        label: "D",
        text: "Homicídio consumado na modalidade tentada com aplicação obrigatória do arrependimento posterior."
      },
      {
        label: "E",
        text: "Tentativa inidônea por crime impossível de homicídio."
      }
    ],
    correctAnswer: "B",
    diagnosis: "Art. 15 do CP (Fórmula de Frank: 'Posso prosseguir, mas não quero'). O agente responde apenas pelos atos já consumados (lesão corporal), afastando-se o homicídio tentado.",
    legalReasoning: "A desistência voluntária afasta a tipicidade da tentativa do crime almejado inicialmente, transformando a imputação estritamente nos crimes já aperfeiçoados.",
    legalBasis: "Art. 15 do Código Penal (Ponte de Ouro de von Liszt).",
    distractorAnalysis: {
      A: "Incorreta. A desistência voluntária impede a tipificação da tentativa de homicídio.",
      B: "Alternativa correta. Aplicação perfeita do art. 15 do CP.",
      C: "Incorreta. No arrependimento eficaz todos os atos executórios foram esgotados, e o agente impede o resultado.",
      D: "Incorreta. Arrependimento posterior (art. 16) não se aplica a crimes cometidos com violência.",
      E: "Incorreta. Os meios empregados eram absolutamente eficazes."
    }
  },
  {
    id: "q-penal-04",
    sequence: 4,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 4,
    discipline: "DIREITO PENAL",
    point: "Concurso de Pessoas",
    umtTitle: "Teoria Monista Mitigada e Cooperação Dolosamente Distinta",
    format: "propositions",
    difficulty: "hard",
    focus: "statute",
    stem: `Analise as assertivas sobre o concurso de pessoas no Código Penal brasileiro:
    
I. O Código Penal adotou como regra a teoria monista ou unitária (art. 29, caput), segundo a qual todos os que concorrem para o crime incidem nas penas a este cominadas, na medida de sua culpabilidade.
II. Se a participação for de menor importância, a pena pode ser diminuída de um sexto a um terço (art. 29, § 1º).
III. Se algum dos concorrentes quis participar de crime menos grave, ser-lhe-á aplicada a pena deste; essa pena será aumentada até metade, na hipótese de ter sido previsível o resultado mais grave (art. 29, § 2º - cooperação dolosamente distinta).
    
Está correto o que se afirma em:`,
    alternatives: [
      { label: "A", text: "I, II e III." },
      { label: "B", text: "I e II, apenas." },
      { label: "C", text: "II e III, apenas." },
      { label: "D", text: "I e III, apenas." },
      { label: "E", text: "Nenhuma das assertivas." }
    ],
    correctAnswer: "A",
    diagnosis: "Todas as assertivas são transcrições e conceitos exatos do art. 29 e parágrafos do Código Penal.",
    legalReasoning: "A teoria monista mitigada brasileira pune a pluralidade de agentes sob a mesma imputação típica, individualizando as penas conforme a cooperação e previsibilidade de cada envolvido.",
    legalBasis: "Art. 29, §§ 1º e 2º, do Código Penal.",
    distractorAnalysis: {
      A: "Alternativa correta. Todas as proposições I, II e III estão plenamente corretas.",
      B: "Incorreta. A assertiva III também é verdadeira.",
      C: "Incorreta. A assertiva I é verdadeira.",
      D: "Incorreta. A assertiva II é verdadeira.",
      E: "Incorreta. Todas são corretas."
    }
  },
  {
    id: "q-penal-05",
    sequence: 5,
    totalQuestions: 5,
    blockNumber: 1,
    slotInBlock: 5,
    discipline: "DIREITO PENAL",
    point: "Excludentes de Ilicitude",
    umtTitle: "Legítima Defesa e Requisitos Cumulativos",
    format: "conceptual",
    difficulty: "easy",
    focus: "statute",
    stem: `Nos termos do art. 25 do Código Penal, entende-se em legítima defesa quem, usando moderadamente dos meios necessários, repele injusta agressão:`,
    alternatives: [
      {
        label: "A",
        text: "Atual ou iminente, a direito seu ou de outrem."
      },
      {
        label: "B",
        text: "Passada ou futura, exclusivamente a direito próprio."
      },
      {
        label: "C",
        text: "Provocada dolosamente pelo próprio agente para simular defesa legítima."
      },
      {
        label: "D",
        text: "Proveniente de perigo comum ou força irresistível da natureza."
      },
      {
        label: "E",
        text: "Dirigida estritamente contra o patrimônio do agressor."
      }
    ],
    correctAnswer: "A",
    diagnosis: "Art. 25 do CP: 'Entende-se em legítima defesa quem, usando moderadamente dos meios necessários, repele injusta agressão, atual ou iminente, a direito seu ou de outrem.'",
    legalReasoning: "A agressão deve ser humana, injusta, atual ou iminente. Perigo natural configura estado de necessidade, não legítima defesa.",
    legalBasis: "Art. 25 do Código Penal.",
    distractorAnalysis: {
      A: "Alternativa correta. Definição legal expressa do art. 25 do CP.",
      B: "Incorreta. Agressão passada enseja vingança; futura não é iminente.",
      C: "Incorreta. Legítima defesa pré-ordenada afasta a excludente.",
      D: "Incorreta. Força da natureza enseja estado de necessidade (art. 24).",
      E: "Incorreta. A tutela abrange qualquer bem jurídico próprio ou alheio."
    }
  }
];

export const MISTO_QUESTIONS: InteractiveLegalQuestion[] = [
  BLOCK_1_LEGAL_QUESTIONS[0], // Processo Civil (Art. 190)
  CONSTITUCIONAL_QUESTIONS[0], // Constitucional (Eficácia Horizontal)
  PENAL_QUESTIONS[0],         // Penal (Insignificância)
  BLOCK_1_LEGAL_QUESTIONS[1], // Processo Civil (Calendário)
  CONSTITUCIONAL_QUESTIONS[1]  // Constitucional (Proporcionalidade)
].map((q, idx) => ({
  ...q,
  sequence: idx + 1,
  totalQuestions: 5,
  slotInBlock: idx + 1
}));

export const PRESET_QUIZZES: PresetQuiz[] = [
  {
    id: "preset-proc-civil",
    title: "Processo Civil — Negócios Jurídicos Processuais",
    disciplineBadge: "Processo Civil",
    discipline: "processo-civil",
    description: "5 questões padrão FGV/ENAM sobre cláusula atípica do art. 190, limites, calendário processual e precedentes vinculantes.",
    questionCount: 5,
    estimatedMinutes: 15,
    difficulty: "FGV / ENAM",
    questions: BLOCK_1_LEGAL_QUESTIONS
  },
  {
    id: "preset-constitucional",
    title: "Direito Constitucional — Direitos Fundamentais & STF",
    disciplineBadge: "Constitucional",
    discipline: "constitucional",
    description: "5 questões aprofundadas sobre eficácia horizontal (Drittwirkung), proporcionalidade, limites dos limites e temas de repercussão geral.",
    questionCount: 5,
    estimatedMinutes: 15,
    difficulty: "Magistratura",
    questions: CONSTITUCIONAL_QUESTIONS
  },
  {
    id: "preset-penal",
    title: "Direito Penal — Teoria do Delito & Tipicidade",
    disciplineBadge: "Direito Penal",
    discipline: "penal",
    description: "5 questões analíticas sobre tipicidade conglobante, insignificância (vetores STF), imputação objetiva e ponte de ouro.",
    questionCount: 5,
    estimatedMinutes: 15,
    difficulty: "FGV / ENAM",
    questions: PENAL_QUESTIONS
  },
  {
    id: "preset-misto-enam",
    title: "Simulado Geral Integrado — ENAM / Magistratura",
    disciplineBadge: "Simulado Misto",
    discipline: "misto",
    description: "Bateria multidisciplinar de alta complexidade abrangendo Processo Civil, Constitucional e Penal nos moldes da prova preambular.",
    questionCount: 5,
    estimatedMinutes: 18,
    difficulty: "Magistratura",
    questions: MISTO_QUESTIONS
  }
];
