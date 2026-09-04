import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { AnswerLabel, ConfidenceLevel, Difficulty, Focus, QuestionFormat, QuizMode } from "../domain/primitives.js";

export interface SessionAnswerRecord {
  questionId: string;
  sequence: number;
  format: QuestionFormat;
  difficulty: Difficulty;
  focus: Focus;
  selectedAnswer: AnswerLabel;
  correctAnswer: AnswerLabel;
  isCorrect: boolean;
  confidence?: ConfidenceLevel;
  elapsedTimeMs: number;
}

export interface CompletedSessionData {
  sessionId: string;
  quizId?: string;
  discipline: string;
  point: string;
  mode: QuizMode;
  totalQuestions: number;
  correctCount: number;
  errorCount: number;
  accuracyPercentage: number;
  totalTimeMs: number;
  answers: SessionAnswerRecord[];
  completedAt?: string;
  createdAt?: string;
}

export interface DisciplinePerformanceMetrics {
  discipline: string;
  totalAttempts: number;
  totalCorrect: number;
  accuracyPercentage: number;
  totalTimeMinutes: number;
  lastActivity: string;
}

export class SessionRepository {
  private db: DatabaseSync;

  constructor(dbOrPath: DatabaseSync | string = ":memory:") {
    if (typeof dbOrPath === "string") {
      if (dbOrPath !== ":memory:") {
        const dir = path.dirname(dbOrPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }
      this.db = new DatabaseSync(dbOrPath);
    } else {
      this.db = dbOrPath;
    }
    this.initSchema();
  }

  public getDatabase(): DatabaseSync {
    return this.db;
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS quiz_sessions (
        id TEXT PRIMARY KEY,
        quiz_id TEXT,
        discipline TEXT NOT NULL,
        point TEXT NOT NULL,
        mode TEXT NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_count INTEGER NOT NULL,
        error_count INTEGER NOT NULL,
        accuracy_percentage REAL NOT NULL,
        total_time_ms INTEGER NOT NULL,
        completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS session_answers (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        sequence INTEGER NOT NULL,
        format TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        focus TEXT NOT NULL,
        selected_answer TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        is_correct INTEGER NOT NULL,
        confidence TEXT,
        elapsed_time_ms INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_discipline ON quiz_sessions(discipline);
      CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON quiz_sessions(created_at);
      CREATE INDEX IF NOT EXISTS idx_answers_session ON session_answers(session_id);
    `);
  }

  /**
   * Salva os dados consolidados de uma sessão concluída
   */
  public saveSession(session: CompletedSessionData): void {
    const insertSessionStmt = this.db.prepare(`
      INSERT OR REPLACE INTO quiz_sessions (
        id, quiz_id, discipline, point, mode, total_questions, correct_count, error_count, accuracy_percentage, total_time_ms, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertSessionStmt.run(
      session.sessionId,
      session.quizId || null,
      session.discipline,
      session.point,
      session.mode,
      session.totalQuestions,
      session.correctCount,
      session.errorCount,
      session.accuracyPercentage,
      session.totalTimeMs,
      session.completedAt || new Date().toISOString()
    );

    // Remove respostas antigas da sessão se houver
    this.db.prepare("DELETE FROM session_answers WHERE session_id = ?").run(session.sessionId);

    const insertAnswerStmt = this.db.prepare(`
      INSERT INTO session_answers (
        id, session_id, question_id, sequence, format, difficulty, focus, selected_answer, correct_answer, is_correct, confidence, elapsed_time_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ans of session.answers) {
      const answerId = `${session.sessionId}:${ans.questionId}:${ans.sequence}`;
      insertAnswerStmt.run(
        answerId,
        session.sessionId,
        ans.questionId,
        ans.sequence,
        ans.format,
        ans.difficulty,
        ans.focus,
        ans.selectedAnswer,
        ans.correctAnswer,
        ans.isCorrect ? 1 : 0,
        ans.confidence || null,
        ans.elapsedTimeMs
      );
    }
  }

  /**
   * Recupera uma sessão completa com suas respostas
   */
  public getSession(sessionId: string): CompletedSessionData | null {
    const sessionRow = this.db
      .prepare("SELECT * FROM quiz_sessions WHERE id = ?")
      .get(sessionId) as Record<string, unknown> | undefined;

    if (!sessionRow) return null;

    const answerRows = this.db
      .prepare("SELECT * FROM session_answers WHERE session_id = ? ORDER BY sequence ASC")
      .all(sessionId) as Record<string, unknown>[];

    const answers: SessionAnswerRecord[] = answerRows.map((r) => ({
      questionId: String(r.question_id),
      sequence: Number(r.sequence),
      format: r.format as QuestionFormat,
      difficulty: r.difficulty as Difficulty,
      focus: r.focus as Focus,
      selectedAnswer: r.selected_answer as AnswerLabel,
      correctAnswer: r.correct_answer as AnswerLabel,
      isCorrect: Boolean(r.is_correct),
      confidence: (r.confidence as ConfidenceLevel) || undefined,
      elapsedTimeMs: Number(r.elapsed_time_ms),
    }));

    return {
      sessionId: String(sessionRow.id),
      quizId: sessionRow.quiz_id ? String(sessionRow.quiz_id) : undefined,
      discipline: String(sessionRow.discipline),
      point: String(sessionRow.point),
      mode: sessionRow.mode as QuizMode,
      totalQuestions: Number(sessionRow.total_questions),
      correctCount: Number(sessionRow.correct_count),
      errorCount: Number(sessionRow.error_count),
      accuracyPercentage: Number(sessionRow.accuracy_percentage),
      totalTimeMs: Number(sessionRow.total_time_ms),
      completedAt: String(sessionRow.completed_at),
      createdAt: String(sessionRow.created_at),
      answers,
    };
  }

  /**
   * Lista resumos de sessões realizadas
   */
  public listSessions(filters: { discipline?: string; mode?: string; limit?: number } = {}): Array<Omit<CompletedSessionData, "answers">> {
    let sql = "SELECT * FROM quiz_sessions WHERE 1=1";
    const params: (string | number)[] = [];

    if (filters.discipline) {
      sql += " AND discipline = ?";
      params.push(filters.discipline);
    }
    if (filters.mode) {
      sql += " AND mode = ?";
      params.push(filters.mode);
    }

    sql += " ORDER BY completed_at DESC LIMIT ?";
    params.push(filters.limit ?? 20);

    const rows = this.db.prepare(sql).all(...params) as Record<string, unknown>[];

    return rows.map((r) => ({
      sessionId: String(r.id),
      quizId: r.quiz_id ? String(r.quiz_id) : undefined,
      discipline: String(r.discipline),
      point: String(r.point),
      mode: r.mode as QuizMode,
      totalQuestions: Number(r.total_questions),
      correctCount: Number(r.correct_count),
      errorCount: Number(r.error_count),
      accuracyPercentage: Number(r.accuracy_percentage),
      totalTimeMs: Number(r.total_time_ms),
      completedAt: String(r.completed_at),
      createdAt: String(r.created_at),
    }));
  }

  /**
   * Agrega métricas consolidadas por disciplina para diagnóstico de desempenho
   */
  public getDisciplineMetrics(): DisciplinePerformanceMetrics[] {
    const sql = `
      SELECT 
        discipline,
        SUM(total_questions) as total_attempts,
        SUM(correct_count) as total_correct,
        SUM(total_time_ms) as total_time_ms,
        MAX(completed_at) as last_activity
      FROM quiz_sessions
      GROUP BY discipline
      ORDER BY total_attempts DESC
    `;

    const rows = this.db.prepare(sql).all() as Record<string, unknown>[];

    return rows.map((r) => {
      const totalAttempts = Number(r.total_attempts || 0);
      const totalCorrect = Number(r.total_correct || 0);
      const totalTimeMs = Number(r.total_time_ms || 0);
      const accuracyPercentage = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

      return {
        discipline: String(r.discipline),
        totalAttempts,
        totalCorrect,
        accuracyPercentage: Math.round(accuracyPercentage * 10) / 10,
        totalTimeMinutes: Math.round((totalTimeMs / 60000) * 10) / 10,
        lastActivity: String(r.last_activity),
      };
    });
  }

  /**
   * Limpa todo o histórico de sessões
   */
  public clearHistory(): void {
    this.db.exec("DELETE FROM session_answers; DELETE FROM quiz_sessions;");
  }
}
