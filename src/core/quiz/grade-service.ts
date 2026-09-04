import { AnswerLabel, ConfidenceLevel } from "../domain/primitives.js";
import { QuestionCorrection, QuestionCorrectionSchema } from "../domain/correction.js";
import { decryptGradingToken } from "../security/crypto-token.js";

export interface GradeAnswerInput {
  opaqueGradingToken: string;
  selectedAnswer: AnswerLabel;
  confidence?: ConfidenceLevel;
  elapsedTimeMs?: number;
}

/**
 * Realiza a correção determinística e stateless da resposta de uma questão decifrando o opaqueGradingToken
 */
export function gradeAnswer(input: GradeAnswerInput): QuestionCorrection {
  const payload = decryptGradingToken(input.opaqueGradingToken);
  const isCorrect = input.selectedAnswer === payload.correctAnswer;

  // Reconstrói o mapa de análises dos distratores
  const distractorAnalysisMap: Record<AnswerLabel, string> = {
    A: "Gabarito oficial.",
    B: "Gabarito oficial.",
    C: "Gabarito oficial.",
    D: "Gabarito oficial.",
    E: "Gabarito oficial.",
  };

  for (const dist of payload.distractorAnalyses) {
    distractorAnalysisMap[dist.letter] = dist.analysis;
  }

  // O distrator correspondente à alternativa correta recebe o texto da fundamentação
  distractorAnalysisMap[payload.correctAnswer] = `[Gabarito Correto] ${payload.legalReasoning}`;

  // Se o candidato errou e não houver diagnóstico explícito, compõe diagnóstico com base na análise do distrator marcado
  let diagnosis = payload.diagnosis;
  if (!isCorrect && (!diagnosis || diagnosis.trim().length < 5)) {
    const chosenDistractorAnalysis = distractorAnalysisMap[input.selectedAnswer];
    diagnosis = `O candidato assinalou a alternativa ${input.selectedAnswer}, incorrendo no seguinte equívoco: ${chosenDistractorAnalysis}`;
  }

  const correctionData = {
    questionId: payload.questionId,
    selectedAnswer: input.selectedAnswer,
    correctAnswer: payload.correctAnswer,
    isCorrect,
    diagnosis: isCorrect ? undefined : diagnosis,
    legalReasoning: payload.legalReasoning,
    legalBasis: payload.legalBasis,
    precedents: payload.precedents || [],
    doctrine: [],
    distractorAnalysis: distractorAnalysisMap,
    confidence: input.confidence,
  };

  return QuestionCorrectionSchema.parse(correctionData);
}
