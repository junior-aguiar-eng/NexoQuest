import crypto from "node:crypto";
import { AnswerLabel } from "../domain/primitives";
import { DistractorAnalysisItem } from "../domain/question";

export interface GradingPayload {
  questionId: string;
  correctAnswer: AnswerLabel;
  legalReasoning: string;
  legalBasis?: string;
  precedents?: string[];
  diagnosis?: string;
  distractorAnalyses: DistractorAnalysisItem[];
  confidenceScore?: number;
  createdAt: number;
  expiresAt?: number;
}

// Chave padrão gerada para o ciclo do servidor caso não haja variável de ambiente
const DEFAULT_SECRET_KEY =
  process.env.NEXOQUIZ_SECRET_KEY ||
  crypto.createHash("sha256").update("nexoquiz-stateless-aes-256-gcm-secret-key-v1").digest("hex");

/**
 * Criptografa o gabarito e as justificativas em um opaqueGradingToken seguro (AES-256-GCM)
 */
export function createGradingToken(
  payload: GradingPayload,
  secretKeyHex: string = DEFAULT_SECRET_KEY
): string {
  const key = Buffer.from(secretKeyHex.padEnd(64, "0").slice(0, 64), "hex");
  const iv = crypto.randomBytes(12); // 96-bit IV recomendado para GCM

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const jsonPayload = JSON.stringify(payload);

  let encrypted = cipher.update(jsonPayload, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Formato: iv.authTag.encrypted (todos codificados em base64url)
  const token = [
    iv.toString("base64url"),
    authTag.toString("base64url"),
    Buffer.from(encrypted, "base64").toString("base64url"),
  ].join(".");

  return token;
}

/**
 * Descriptografa e autentica o opaqueGradingToken (retorna erro se violado ou alterado)
 */
export function decryptGradingToken(
  token: string,
  secretKeyHex: string = DEFAULT_SECRET_KEY
): GradingPayload {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Token de gabarito malformado (formato de envelope inválido).");
  }

  const [ivB64, authTagB64, encryptedB64] = parts;
  const key = Buffer.from(secretKeyHex.padEnd(64, "0").slice(0, 64), "hex");
  const iv = Buffer.from(ivB64, "base64url");
  const authTag = Buffer.from(authTagB64, "base64url");
  const encrypted = Buffer.from(encryptedB64, "base64url");

  if (iv.length !== 12 || authTag.length !== 16) {
    throw new Error("Token de gabarito inválido ou corrompido (tamanho de cabeçalho incorreto).");
  }

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted: string;
  try {
    decrypted = decipher.update(encrypted.toString("base64"), "base64", "utf8");
    decrypted += decipher.final("utf8");
  } catch {
    throw new Error("Token de gabarito inválido ou violado (falha de autenticação criptográfica).");
  }

  const payload = JSON.parse(decrypted) as GradingPayload;

  if (payload.expiresAt && Date.now() > payload.expiresAt) {
    throw new Error("Token de gabarito expirado.");
  }

  return payload;
}
