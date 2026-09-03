import { AnswerLabel } from "../domain/primitives";
import { QuestionSlot } from "../domain/quiz-plan";

export interface RotationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida regras de rotação de gabarito (padrão FGV/ENAM):
 * 1. Proibido repetir a mesma letra de gabarito consecutivamente.
 * 2. Em bloco completo de 5 questões, cada uma das 5 letras (A, B, C, D, E) deve aparecer preferencialmente 1 vez.
 */
export function validateAnswerRotation(slots: QuestionSlot[]): RotationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (slots.length === 0) {
    return { isValid: true, errors, warnings };
  }

  // 1. Proibição de letras consecutivas iguais
  for (let i = 1; i < slots.length; i++) {
    const prev = slots[i - 1].plannedCorrectAnswer;
    const curr = slots[i].plannedCorrectAnswer;
    if (prev === curr) {
      errors.push(
        `Gabarito consecutivo duplicado: a questão na sequência ${slots[i].sequence} repete a alternativa correta "${curr}" da questão anterior.`
      );
    }
  }

  // 2. Distribuição balanceada em blocos de 5
  if (slots.length === 5) {
    const answers = slots.map((s) => s.plannedCorrectAnswer);
    const uniqueAnswers = new Set(answers);
    if (uniqueAnswers.size < 4) {
      warnings.push(
        `Baixa diversidade de gabarito no bloco de 5: contém apenas ${uniqueAnswers.size} letras distintas (${Array.from(uniqueAnswers).join(", ")}). Idealmente A, B, C, D e E devem aparecer 1 vez cada.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Verifica se uma lista de respostas possui letras consecutivas idênticas
 */
export function hasConsecutiveDuplicateAnswers(answers: AnswerLabel[]): boolean {
  for (let i = 1; i < answers.length; i++) {
    if (answers[i] === answers[i - 1]) {
      return true;
    }
  }
  return false;
}
