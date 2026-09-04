import { AnswerLabel } from "../domain/primitives.js";
import { QuestionAlternative, QuestionInternal } from "../domain/question.js";

export interface QuestionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  symmetryMetrics?: {
    wordCounts: Record<AnswerLabel, number>;
    averageWords: number;
    maxDeviationPercentage: number;
  };
}

export interface QuestionValidationOptions {
  strictSymmetry?: boolean;
  maxSymmetryDeviation?: number; // padrão 15% (0.15)
}

/**
 * Padrões proibidos de rastreabilidade editorial ou anotações técnicas no texto visível
 */
const FORBIDDEN_MARKERS_REGEX = /\[(source|fonte|página|pagina|seção|secao|ref|stj tema|stf tema|informativo):\s*[^\]]+\]/gi;

/**
 * Validador detalhado de conformidade pedagógica da questão gerada
 */
export function validateQuestionContent(
  question: QuestionInternal,
  options: QuestionValidationOptions = {}
): QuestionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const maxDeviation = options.maxSymmetryDeviation ?? 0.15;

  // 1. Verificação de Ausência de Marcadores Internos no Conteúdo Público
  const textToCheck = [
    question.content.stem,
    question.content.command || "",
    ...(question.content.propositions || []),
    ...question.content.alternatives.map((a) => a.text),
  ].join(" ");

  const markerMatches = textToCheck.match(FORBIDDEN_MARKERS_REGEX);
  if (markerMatches && markerMatches.length > 0) {
    errors.push(
      `O conteúdo público da questão contém marcadores editoriais/internos proibidos: ${markerMatches.join(", ")}. Remova anotações técnicas.`
    );
  }

  // 2. Verificação de Simetria Estrutural e Extensão das Alternativas (±15% palavras)
  const symmetry = checkAlternativeSymmetry(question.content.alternatives, maxDeviation);
  if (symmetry.maxDeviationPercentage > maxDeviation * 100) {
    const msg = `Assimetria nas alternativas: a alternativa com maior variação desvia ${symmetry.maxDeviationPercentage.toFixed(1)}% da média de palavras (limite recomendado: ±${(maxDeviation * 100).toFixed(0)}%).`;
    if (options.strictSymmetry) {
      errors.push(msg);
    } else {
      warnings.push(msg);
    }
  }

  // 3. Verificação de Análise dos 4 Distratores
  const correct = question.answerKey.correctAnswer;
  const labels: AnswerLabel[] = ["A", "B", "C", "D", "E"];
  const distractors = labels.filter((l) => l !== correct);

  for (const dist of distractors) {
    const analysis = question.answerKey.distractorAnalysis[dist];
    if (!analysis || analysis.trim().length < 5) {
      errors.push(`Distrator "${dist}" não possui análise pedagógica suficiente em distractorAnalysis.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    symmetryMetrics: symmetry,
  };
}

/**
 * Calcula a simetria e contagem de palavras das 5 alternativas
 */
export function checkAlternativeSymmetry(
  alternatives: QuestionAlternative[],
  maxDeviationRatio = 0.15
): {
  wordCounts: Record<AnswerLabel, number>;
  averageWords: number;
  maxDeviationPercentage: number;
  isSymmetric: boolean;
} {
  const wordCounts: Record<AnswerLabel, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
  };

  let totalWords = 0;

  for (const alt of alternatives) {
    const count = alt.text.trim().split(/\s+/).filter(Boolean).length;
    wordCounts[alt.label] = count;
    totalWords += count;
  }

  const countKeys = Object.keys(wordCounts) as AnswerLabel[];
  const averageWords = totalWords / (countKeys.length || 1);

  let maxDiff = 0;
  for (const label of countKeys) {
    const diff = Math.abs(wordCounts[label] - averageWords);
    if (diff > maxDiff) {
      maxDiff = diff;
    }
  }

  const maxDeviationPercentage = averageWords > 0 ? (maxDiff / averageWords) * 100 : 0;
  const isSymmetric = maxDeviationPercentage <= maxDeviationRatio * 100;

  return {
    wordCounts,
    averageWords: Math.round(averageWords * 10) / 10,
    maxDeviationPercentage: Math.round(maxDeviationPercentage * 10) / 10,
    isSymmetric,
  };
}
