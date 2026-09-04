import { QuizPlan } from "../domain/quiz-plan.js";
import { validateAnswerRotation } from "./answer-rotation.js";
import { validateBlockRules, BlockRuleOptions } from "./block-rules.js";

export interface PlanValidationReport {
  isValid: boolean;
  totalQuestions: number;
  totalBlocks: number;
  errors: string[];
  warnings: string[];
}

/**
 * Validador completo do QuizPlan estruturado segundo o padrão ENAM/FGV
 */
export function validateQuizPlan(
  plan: QuizPlan,
  options: BlockRuleOptions = {}
): PlanValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Verificação de UMTs e Ordem Linear
  const umtIds = new Set(plan.umts.map((u) => u.id));
  if (umtIds.size !== plan.umts.length) {
    errors.push("O plano contém UMTs com IDs duplicados.");
  }

  for (let i = 0; i < plan.umts.length; i++) {
    const expectedOrder = i + 1;
    if (plan.umts[i].order !== expectedOrder) {
      errors.push(
        `Quebra de ordem linear nas UMTs: UMT "${plan.umts[i].id}" possui order=${plan.umts[i].order}, esperado order=${expectedOrder}.`
      );
    }
  }

  // 2. Coleta de todos os slots de todos os blocos
  const allSlots = plan.blocks.flatMap((b) => b.slots);

  if (allSlots.length !== plan.totalQuestions) {
    errors.push(
      `Inconsistência no total de questões: o plano declara ${plan.totalQuestions} questões, mas a soma dos slots dos blocos totaliza ${allSlots.length}.`
    );
  }

  // 3. Verificação de Cobertura de UMTs (1 questão por UMT, sem omissões e sem repetições)
  const slotUmtIds = allSlots.map((s) => s.umtId);
  const seenSlotUmts = new Set<string>();

  for (const umtId of slotUmtIds) {
    if (!umtIds.has(umtId)) {
      errors.push(`Slot referencia UMT inexistente no plano: "${umtId}".`);
    }
    if (seenSlotUmts.has(umtId)) {
      errors.push(`UMT testada mais de uma vez no mesmo ciclo: "${umtId}". Cada UMT deve ser testada exatamente uma vez.`);
    }
    seenSlotUmts.add(umtId);
  }

  for (const umt of plan.umts) {
    if (!seenSlotUmts.has(umt.id)) {
      errors.push(`UMT mapeada não possui slot alocado no plano: "${umt.id}" (${umt.title}).`);
    }
  }

  // 4. Verificação Sequencial Global ($1 -> 2 -> ... -> N$)
  for (let i = 0; i < allSlots.length; i++) {
    const expectedSeq = i + 1;
    if (allSlots[i].sequence !== expectedSeq) {
      errors.push(
        `Quebra de sequência nos slots: slot na posição ${i} possui sequence=${allSlots[i].sequence}, esperado ${expectedSeq}.`
      );
    }
  }

  // 5. Validação Individual de cada Bloco (Formato, Dificuldade e Rotação de Gabarito)
  for (const block of plan.blocks) {
    const blockRuleResult = validateBlockRules(block, options);
    errors.push(...blockRuleResult.errors);
    warnings.push(...blockRuleResult.warnings);

    const rotationResult = validateAnswerRotation(block.slots);
    errors.push(...rotationResult.errors);
    warnings.push(...rotationResult.warnings);
  }

  return {
    isValid: errors.length === 0,
    totalQuestions: allSlots.length,
    totalBlocks: plan.blocks.length,
    errors,
    warnings,
  };
}
