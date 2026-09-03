import { QuestionSlot, QuizBlockPlan } from "../domain/quiz-plan";

export interface BlockValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BlockRuleOptions {
  strict?: boolean;
}

/**
 * Validador das regras pedagógicas e estruturais de blocos (padrão FGV/ENAM)
 */
export function validateBlockRules(
  block: QuizBlockPlan,
  options: BlockRuleOptions = {}
): BlockValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { slots, blockNumber } = block;

  if (slots.length === 0) {
    errors.push(`Bloco ${blockNumber} está vazio.`);
    return { isValid: false, errors, warnings };
  }

  // 1. Verificação de Anti-Repetição Consecutiva de Formato (Máximo 2 consecutivos do mesmo formato)
  let consecutiveFormatCount = 1;
  for (let i = 1; i < slots.length; i++) {
    if (slots[i].format === slots[i - 1].format) {
      consecutiveFormatCount++;
      if (consecutiveFormatCount >= 3) {
        errors.push(
          `Violação de sequência no Bloco ${blockNumber}: 3 ou mais questões consecutivas com o mesmo formato ("${slots[i].format}"). Alterne os formatos.`
        );
        break;
      }
    } else {
      consecutiveFormatCount = 1;
    }
  }

  // 2. Verificação de Anti-Repetição Consecutiva de Dificuldade (Máximo 3 consecutivos da mesma dificuldade)
  let consecutiveDifficultyCount = 1;
  for (let i = 1; i < slots.length; i++) {
    if (slots[i].difficulty === slots[i - 1].difficulty) {
      consecutiveDifficultyCount++;
      if (consecutiveDifficultyCount >= 4) {
        errors.push(
          `Violação de sequência no Bloco ${blockNumber}: 4 ou mais questões consecutivas com a mesma dificuldade ("${slots[i].difficulty}"). Alterne a gradação de dificuldade.`
        );
        break;
      }
    } else {
      consecutiveDifficultyCount = 1;
    }
  }

  // 3. Regras para Bloco Completo de 5 Questões
  if (slots.length === 5) {
    // Contagem de Formatos
    const formatCounts = {
      case_narrative: slots.filter((s) => s.format === "case_narrative").length,
      propositions: slots.filter((s) => s.format === "propositions").length,
      conceptual: slots.filter((s) => s.format === "conceptual").length,
    };

    // Padrão FGV exato: 3 Casos Narrativos, 1 Proposição, 1 Conceitual (60/20/20)
    if (formatCounts.case_narrative !== 3 || formatCounts.propositions !== 1 || formatCounts.conceptual !== 1) {
      const msg = `Distribuição inválida de formatos no Bloco ${blockNumber} (esperado: 3 Casos Narrativos, 1 Proposições, 1 Conceitual; obtido: ${formatCounts.case_narrative} narrativa, ${formatCounts.propositions} proposições, ${formatCounts.conceptual} conceitual).`;
      if (options.strict) {
        errors.push(msg);
      } else {
        warnings.push(msg);
      }
    }

    // Contagem de Dificuldades
    const difficultyCounts = {
      hard: slots.filter((s) => s.difficulty === "hard").length,
      medium: slots.filter((s) => s.difficulty === "medium").length,
      easy: slots.filter((s) => s.difficulty === "easy").length,
    };

    // Padrão FGV exato: 3 Difíceis, 1 Média, 1 Fácil (~60/25/15)
    if (difficultyCounts.hard !== 3 || difficultyCounts.medium !== 1 || difficultyCounts.easy !== 1) {
      const msg = `Distribuição inválida de dificuldade no Bloco ${blockNumber} (esperado: 3 Difíceis, 1 Média, 1 Fácil; obtido: ${difficultyCounts.hard} difíceis, ${difficultyCounts.medium} médias, ${difficultyCounts.easy} fáceis).`;
      if (options.strict) {
        errors.push(msg);
      } else {
        warnings.push(msg);
      }
    }

    // Contagem de Enfoques (ao menos 1 Lei Seca/Prazos e ao menos 1 Doutrina)
    const focusCounts = {
      statute: slots.filter((s) => s.focus === "statute").length,
      doctrine: slots.filter((s) => s.focus === "doctrine").length,
      jurisprudence: slots.filter((s) => s.focus === "jurisprudence" || s.focus === "mixed").length,
    };

    if (focusCounts.statute < 1) {
      const msg = `Bloco ${blockNumber} não contém nenhuma questão com foco em Lei Seca/Prazos (statute). Mínimo exigido: 1.`;
      if (options.strict) errors.push(msg);
      else warnings.push(msg);
    }

    if (focusCounts.doctrine < 1) {
      const msg = `Bloco ${blockNumber} não contém nenhuma questão com foco em Doutrina (doctrine). Mínimo exigido: 1.`;
      if (options.strict) errors.push(msg);
      else warnings.push(msg);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
