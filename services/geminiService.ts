
import { GoogleGenAI } from "@google/genai";
import { UploadedFile, ProjectMode, AuditorType, ProjectLens, ChatMessage } from "../types";
import { promptService } from "./promptService"; // V28: Import Prompt Service

let aiClient: GoogleGenAI | null = null;

export const initializeGemini = (apiKey: string) => {
  aiClient = new GoogleGenAI({ apiKey });
};

const getClient = (): GoogleGenAI => {
  if (!aiClient) {
    if (process.env.API_KEY) {
      aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
      return aiClient;
    }
    throw new Error("API Key not initialized");
  }
  return aiClient;
};

// Helper to remove raw HTML anchors that the AI might generate
const cleanHtmlArtifacts = (text: string) => {
  if (!text) return "";
  return text
    .replace(/<a\s+name="[^"]*">\s*<\/a>/gi, '') 
    .replace(/<a\s+id="[^"]*">\s*<\/a>/gi, '')   
    .replace(/<a\s+name="[^"]*"\s*\/>/gi, '');   
};

// Helper to construct parts with Multi-Source support
const constructParts = (text: string, files?: UploadedFile[] | null) => {
  const parts: any[] = [];
  if (files && files.length > 0) {
    files.forEach(file => {
      if (file.data) {
        parts.push({
            inlineData: {
            mimeType: file.mimeType,
            data: file.data
            }
        });
      }
    });
  }
  if (text) {
    parts.push({ text: text });
  }
  return parts;
};

// V28: Async Prompt Fetcher
const getSystemInstruction = async (mode: ProjectMode): Promise<string> => {
    if (mode === ProjectMode.ENGINEER) {
        return await promptService.getEngineerPrompt();
    }
    return await promptService.getAuditorPrompt();
};

const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// V27: Helper to extract content between tags
const extractTaggedContent = (fullText: string, startTag: string, endTag: string): string => {
    const escapedStart = startTag.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    const escapedEnd = endTag.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    const regex = new RegExp(`${escapedStart}([\\s\\S]*?)${escapedEnd}`, 'i');
    const match = fullText.match(regex);
    return match ? match[1].trim() : "";
};

// Append Signature Block
const appendSignature = (text: string) => {
    if (!text) return "";
    const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
    const date = getCurrentDate();
    
    return `${text}

---
**RESPONSÁVEL TÉCNICO:**
R. Morais - Sócio Sênior
*Auditor Líder de Compliance & Estratégia*

**REGISTRO DE AUTENTICIDADE:**
Hash: #${hash} | Emissão: ${date}
`;
};

// 0. Detect Context (Step 0)
export const detectProjectContext = async (projectText: string, files: UploadedFile[] | undefined, mode: ProjectMode): Promise<string> => {
    const client = getClient();
    const model = client.models;
    const today = getCurrentDate();
    let userPrompt = "";

    const systemInstruction = await getSystemInstruction(mode); 

    if (mode === ProjectMode.ENGINEER) {
        userPrompt = `
        DATA DO SISTEMA: ${today}
        SISTEMA PROJETISTA V1.0 (ENGINEER) INICIALIZADO.
        Execute o PASSO 0: DETECÇÃO DE ESCOPO.
        Analise a ideia/documentos e identifique:
        1. Objeto.
        2. Modo Identificado (GENESIS ou FENIX).
        3. Lente Sugerida (A, B ou C).
        CONTEXTO EXTRA: "${projectText}"
        `;
    } else {
        return "Manual Selector Active"; 
    }

    const parts = constructParts(userPrompt, files);
    const response = await model.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: { systemInstruction: systemInstruction, temperature: 0.2 },
    });

    return response.text || "Erro ao detectar contexto.";
};

// 1. Generate Pre-Report (Step 1)
export const generatePreReport = async (
    projectText: string, 
    contextDetection: string, 
    files: UploadedFile[] | undefined, 
    mode: ProjectMode, 
    auditorType?: AuditorType,
    lens?: ProjectLens
): Promise<string> => {
  const client = getClient();
  const model = client.models;
  const today = getCurrentDate();
  
  const systemInstruction = await getSystemInstruction(mode); 

  let userPrompt = "";
  
  if (mode === ProjectMode.ENGINEER) {
      userPrompt = `DATA DO SISTEMA: ${today}. Execute o PASSO 1: TRIAGEM DE VIABILIDADE DE ESCRITA (ENGINEER). CONTEXTO: "${projectText}"`;
  } else {
      const auditorMode = auditorType || 'CONSULTORIA';
      const lensType = lens || 'A';
      
      userPrompt = `
      [VARIAVEIS]
      {LENTE}: ${lensType}
      {MODO}: ${auditorMode}
      {DATA}: ${today}

      [CMD_GERAR_PRE_RELATORIO]
      CONTEXTO DO PROJETO: "${projectText}"
      `;
  }

  const parts = constructParts(userPrompt, files);
  const response = await model.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts },
    config: { systemInstruction: systemInstruction, temperature: 0.4 },
  });

  const fullText = cleanHtmlArtifacts(response.text || "");
  let finalContent = fullText;
  
  if (mode === ProjectMode.AUDITOR) {
      // V34 FIX: Use the PDF specific tag defined in constants
      const parsed = extractTaggedContent(fullText, '[INICIO_PDF_PRERELATORIO]', '[FIM_PDF_PRERELATORIO]');
      // FALLBACK: If AI missed tags but generated text, use full text
      finalContent = parsed || (fullText.length > 20 ? fullText : "Erro na geração do relatório."); 
  }

  return appendSignature(finalContent);
};

// 2. Generate Questionnaire (Step 2.1)
export const generateQuestionnaire = async (projectText: string, preReport: string, files: UploadedFile[] | undefined, mode: ProjectMode): Promise<string> => {
  const client = getClient();
  const model = client.models;
  const today = getCurrentDate();
  
  const systemInstruction = await getSystemInstruction(mode); 

  let userPrompt = "";
  if (mode === ProjectMode.ENGINEER) {
      userPrompt = `DATA DO SISTEMA: ${today}. Execute o PASSO 2: A ARQUITETURA. Gere o questionário profundo.`;
  } else {
      userPrompt = `
      {DATA}: ${today}
      STATUS: APROVADO.
      [CMD_GERAR_QUESTIONARIO]
      `;
  }

  const parts = constructParts(userPrompt, files);
  const response = await model.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts },
    config: { systemInstruction: systemInstruction, temperature: 0.5 },
  });

  const fullText = cleanHtmlArtifacts(response.text || "");
  let finalContent = fullText;
  
  if (mode === ProjectMode.AUDITOR) {
      // V34 FIX: Use PDF specific tags
      const parsed = extractTaggedContent(fullText, '[INICIO_PDF_QUESTIONARIO]', '[FIM_PDF_QUESTIONARIO]');
      // FALLBACK
      finalContent = parsed || (fullText.length > 20 ? fullText : "Erro ao gerar questionário.");
  }
  return appendSignature(finalContent);
};

// 3. Generate Final Report (Step 2.2)
export const generateFinalReport = async (
    projectText: string, 
    questionnaire: string, 
    answers: string, 
    files: UploadedFile[] | undefined,
    mode: ProjectMode,
    auditorType?: AuditorType,
    lens?: ProjectLens
): Promise<{ technicalDossier: string, investmentOnePager: string, engineerCompliance: string, auditorMetadata: string, governanceParecer: string, rankingMetadata: string }> => {
  
  const client = getClient();
  const model = client.models;
  const today = getCurrentDate();
  
  const systemInstruction = await getSystemInstruction(mode); 

  let userPrompt = "";
  
  if (mode === ProjectMode.ENGINEER) {
      userPrompt = `
      DATA DO SISTEMA: ${today}
      CONTEXTO: "${projectText}"
      RESPOSTAS: "${answers}"
      Execute o PASSO 3: A CONSTRUÇÃO (ENGINEER).
      Gere os 4 ARTEFATOS OBRIGATÓRIOS: DOSSIÊ, PITCH, CONFORMIDADE, GLOSSÁRIO.
      Use tags [INICIO ARTEFATO X].
      `;
  } else {
      const auditorMode = auditorType || 'CONSULTORIA';
      const lensType = lens || 'A';
      
      userPrompt = `
      [VARIAVEIS]
      {LENTE}: ${lensType}
      {MODO}: ${auditorMode}
      {DATA}: ${today}

      [CMD_GERAR_DOSSIE_FINAL]
      RESPOSTAS DO CLIENTE: "${answers}"
      CONTEXTO ORIGINAL: "${projectText}"
      `;
  }

  const parts = constructParts(userPrompt, files);
  const response = await model.generateContent({
    model: 'gemini-2.5-flash', 
    contents: { parts },
    config: { systemInstruction: systemInstruction, temperature: 0.4 },
  });
  
  const fullText = cleanHtmlArtifacts(response.text || "");

  if (mode === ProjectMode.ENGINEER) {
      const art1 = extractTaggedContent(fullText, '[INICIO ARTEFATO 1: DOSSIÊ DE PROJETO ESTRUTURADO]', '[FIM ARTEFATO 1]');
      const art2 = extractTaggedContent(fullText, '[INICIO ARTEFATO 2: SUMÁRIO EXECUTIVO (PITCH)]', '[FIM ARTEFATO 2]');
      const art3 = extractTaggedContent(fullText, '[INICIO ARTEFATO 3: RELATÓRIO DE CONFORMIDADE INTERNA]', '[FIM ARTEFATO 3]');
      const art4 = extractTaggedContent(fullText, '[INICIO ARTEFATO 4: GLOSSÁRIO E REFERÊNCIAS]', '[FIM ARTEFATO 4]');

      let dossier = art1 || fullText;
      if (art4) dossier += "\n\n# GLOSSÁRIO E REFERÊNCIAS\n" + art4;

      return {
          technicalDossier: appendSignature(dossier),
          investmentOnePager: art2, // Usually one-pagers don't need formal signature, but can add if needed
          engineerCompliance: appendSignature(art3),
          auditorMetadata: "",
          governanceParecer: "",
          rankingMetadata: ""
      };
  } else {
      // V34 FIX: Update tags to match PDF structure defined in V34 Constants
      let art1 = extractTaggedContent(fullText, '[INICIO_PDF_DOSSIE_FINAL]', '[FIM_PDF_DOSSIE_FINAL]');
      const art2 = extractTaggedContent(fullText, '[INICIO_PDF_ONEPAGER]', '[FIM_PDF_ONEPAGER]');
      const art3 = extractTaggedContent(fullText, '[INICIO_METADADOS]', '[FIM_METADADOS]');
      
      // FALLBACK: If tags missing but text exists, treat as Artefact 1
      if (!art1 && !art2 && !art3 && fullText.length > 50) art1 = fullText;

      let rankingMeta = "";
      if (art3 && art3.includes('[METADATA_RANKING]')) {
          const match = art3.match(/\[METADATA_RANKING\](.*)/);
          if (match) rankingMeta = match[1].trim();
      }

      // Ensure distinct returns for library population
      if (auditorType === 'GOVERNANCE') {
          return {
            technicalDossier: "", 
            investmentOnePager: "",
            engineerCompliance: "",
            auditorMetadata: art3,
            governanceParecer: appendSignature(art1), // Governance Official Doc
            rankingMetadata: rankingMeta
          };
      } else {
          return {
            technicalDossier: appendSignature(art1), // Consultancy Dossier
            investmentOnePager: art2, // Sales One Pager
            engineerCompliance: "",
            auditorMetadata: art3,
            governanceParecer: "",
            rankingMetadata: ""
          };
      }
  }
};

// 4. Generate Audit Report
export const generateAuditReport = async (finalReport: string): Promise<string> => {
  const client = getClient();
  const model = client.models;
  const prompt = await promptService.getAuditorPrompt(); 
  
  const userPrompt = `[CMD_AUDITAR_CONFORMIDADE]\nDOCUMENTO: "${finalReport.substring(0, 10000)}..."`; 
  
  const response = await model.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: userPrompt }] },
    config: { systemInstruction: prompt, temperature: 0.1 },
  });

  const fullText = cleanHtmlArtifacts(response.text || "");
  const parsed = extractTaggedContent(fullText, '[INICIO_RELATORIO_AUDITORIA]', '[FIM_RELATORIO_AUDITORIA]');
  return appendSignature(parsed || fullText);
};

// 5. Run Readjustment
export const runReadjustment = async (
  oldDossier: string,
  newFiles: UploadedFile[],
  userComments: string,
  mode: ProjectMode,
  auditorType?: AuditorType
): Promise<any> => {
  const client = getClient();
  const model = client.models;
  const today = getCurrentDate();
  
  const systemInstruction = await getSystemInstruction(mode); 

  let userPrompt = "";
  if (mode === ProjectMode.ENGINEER) {
      userPrompt = `DATA: ${today}. READEQUAÇÃO FÊNIX. DOSSIÊ: "${oldDossier}". COMENTÁRIOS: "${userComments}".`;
  } else {
      userPrompt = `
      {DATA}: ${today}
      [CMD_REVISAO_CIRURGICA]
      DOSSIÊ ORIGINAL: "${oldDossier.substring(0, 10000)}..."
      FATO NOVO/COMENTÁRIOS: "${userComments}"
      `;
  }

  const parts = constructParts(userPrompt, newFiles);
  const response = await model.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts },
    config: { systemInstruction: systemInstruction, temperature: 0.3 },
  });
  
  const fullText = cleanHtmlArtifacts(response.text || "");
  
  if (mode === ProjectMode.AUDITOR) {
      // V34 FIX: Correct tag for revision output
      const parsed = extractTaggedContent(fullText, '[INICIO_PDF_DOSSIE_FINAL]', '[FIM_PDF_DOSSIE_FINAL]');
      return { technicalDossier: appendSignature(parsed || fullText) };
  } else {
      return { technicalDossier: appendSignature(fullText) };
  }
};

// 6. CHATBOT: Send Message
export const sendChatMessage = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    const client = getClient();
    const model = client.models;
    const prompt = await promptService.getChatbotPrompt();
    
    // Construct chat history for context
    const parts = history.map(msg => ({ text: `${msg.role === 'user' ? 'USUÁRIO' : 'SWOT AuditorIA'}: ${msg.text}` }));
    parts.push({ text: `USUÁRIO: ${newMessage}` });

    const response = await model.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: { systemInstruction: prompt, temperature: 0.7 },
    });

    return cleanHtmlArtifacts(response.text || "Desculpe, não consegui processar sua solicitação.");
};
