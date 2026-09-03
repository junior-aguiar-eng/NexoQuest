export interface QuestionAlternativeFixture {
  label: "A" | "B" | "C" | "D" | "E";
  text: string;
}

export interface LegalQuestionFixture {
  id: string;
  discipline: string;
  point: string;
  sequence: number;
  totalQuestions: number;
  stem: string;
  alternatives: QuestionAlternativeFixture[];
  correctAnswer: "A" | "B" | "C" | "D" | "E";
  explanation: string;
}

export const SAMPLE_LEGAL_QUESTION: LegalQuestionFixture = {
  id: "proc-civ-001",
  discipline: "DIREITO PROCESSUAL CIVIL",
  point: "Negócios Jurídicos Processuais (Art. 190 do CPC)",
  sequence: 1,
  totalQuestions: 1,
  stem: `Em ação de cobrança fundada em inadimplemento contratual entre duas sociedades empresárias plenamente capazes, as partes convencionaram, por cláusula expressa no contrato preliminar, a supressão prévia do direito de recorrer em relação às decisões interlocutórias sobre redistribuição do ônus da prova e fixaram prazo peremptório de 10 (dez) dias para resposta do réu.

Considerando o regime dos negócios jurídicos processuais atípicos no Código de Processo Civil vigente, assinale a afirmativa correta:`,
  alternatives: [
    {
      label: "A",
      text: "A convenção é integralmente nula, haja vista que a legislação processual civil veda qualquer estipulação prévia sobre prazos ou renúncia a faculdades recursais antes da citação."
    },
    {
      label: "B",
      text: "A convenção sobre prazos e ônus da prova é válida se celebrada por partes plenamente capazes e sobre direitos que admitam autocomposição, cabendo ao juiz controlar eventual vulnerabilidade ou nulidade."
    },
    {
      label: "C",
      text: "Apenas a fixação de calendário processual homologado judicialmente autoriza a modificação de prazos peremptórios, sendo ineficaz a estipulação privada extrajudicial."
    },
    {
      label: "D",
      text: "A renúncia ao direito de recorrer exige necessária homologação judicial prévia na fase postulatória para produzir efeitos perante o órgão jurisdicional."
    },
    {
      label: "E",
      text: "O negócio processual atípico somente pode ser estipulado após a ocorrência do litígio, sendo expressamente vedada a pactuação de cláusulas processuais em contratos preliminares."
    }
  ],
  correctAnswer: "B",
  explanation: "Nos termos do art. 190 do CPC, versando o processo sobre direitos que admitam autocomposição, é lícito às partes plenamente capazes estipular mudanças no procedimento para ajustá-lo às especificidades da causa e convencionar sobre os seus ônus, poderes, faculdades e deveres processuais, antes ou durante o processo. O controle judicial ocorre em caso de nulidade ou vulnerabilidade."
};
