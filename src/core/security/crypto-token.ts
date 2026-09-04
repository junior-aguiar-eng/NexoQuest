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
  process.env.NEXOQUIZ_SECRET_KEY || "nexoquiz-stateless-aes-256-gcm-secret-key-v1";

/**
 * Deriva uma chave de 256 bits (32 bytes) segura a partir de qualquer string/segredo
 */
function deriveAesKey(secret: string): Buffer {
  return crypto.createHash("sha256").update(secret, "utf8").digest();
}

/**
 * Criptografa o gabarito e as justificativas em um opaqueGradingToken seguro (AES-256-GCM)
 */
export function createGradingToken(
  payload: GradingPayload,
  secretKey: string = DEFAULT_SECRET_KEY
): string {
  const key = deriveAesKey(secretKey);
  const iv = crypto.randomBytes(12); // 96-bit IV recomendado para GCM

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const jsonPayload = JSON.stringify(payload);

  const encrypted = Buffer.concat([
    cipher.update(jsonPayload, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Formato: iv.authTag.encrypted (todos codificados em base64url)
  const token = [
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");

  return token;
}

/**
 * Descriptografa e autentica o opaqueGradingToken (retorna erro se violado ou alterado)
 */
export function decryptGradingToken(
  token: string,
  secretKey: string = DEFAULT_SECRET_KEY
): GradingPayload {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Token de gabarito malformado (formato de envelope inválido).");
  }

  const [ivB64, authTagB64, encryptedB64] = parts;
  const key = deriveAesKey(secretKey);
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
    const decryptedBuf = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    decrypted = decryptedBuf.toString("utf8");
  } catch {
    throw new Error("Token de gabarito inválido ou violado (falha de autenticação criptográfica).");
  }

  const payload = JSON.parse(decrypted) as GradingPayload;

  if (payload.expiresAt && Date.now() > payload.expiresAt) {
    throw new Error("Token de gabarito expirado.");
  }

  return payload;
}

