
import React, { useState, useRef } from 'react';
import { Project, ProjectStatus, UploadedFile, ProjectMode, AuditorType, ProjectLens } from '../types';
import { generatePreReport, generateQuestionnaire, generateFinalReport, generateAuditReport, runReadjustment } from '../services/geminiService';
import { ReportRenderer } from './ReportRenderer';
import { Loader2, CheckCircle, FileInput, CreditCard, Scale, ShieldCheck, Lock, Upload, FileText, Trash2, ArrowRight, Printer, Eraser, AlertTriangle, FileSearch, Download, RefreshCw, Layers, ScanEye, Check, FolderOpen, ChevronLeft, Eye, Search, GitBranch, Banknote, DraftingCompass, LayoutTemplate, Hammer, PieChart, Tag, Gavel, Briefcase, BarChart3, Banknote as BanknoteIcon, Sliders, BriefcaseBusiness, Landmark, GraduationCap, AlertCircle, FileCheck, TrendingUp, Clock, X } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface ProjectWorkflowProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
}

const PURGE_MESSAGE = "[REGISTRO: DADOS ORIGINAIS E ARQUIVOS FONTE DESTRUÍDOS CONFORME PROTOCOLO DE SEGURANÇA]";

export const ProjectWorkflow: React.FC<ProjectWorkflowProps> = ({ project, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'documents'>('workflow');
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState(project.clientAnswers || '');
  const [inputText, setInputText] = useState(project.description || '');
  
  const [reportViewMode, setReportViewMode] = useState<'full' | 'summary'>('full');
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(project.files || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isReadjusting, setIsReadjusting] = useState(false);
  const [readjustComment, setReadjustComment] = useState("");
  const [readjustFiles, setReadjustFiles] = useState<UploadedFile[]>([]);
  const readjustFileInputRef = useRef<HTMLInputElement>(null);

  // PDF Generation State
  const [pdfGenerating, setPdfGenerating] = useState<string | null>(null);
  
  // V25 Selector State
  const [selectedLens, setSelectedLens] = useState<ProjectLens | null>(project.selectedLens || null);

  const isEngineer = project.mode === ProjectMode.ENGINEER;
  const isGovernance = project.auditorType === 'GOVERNANCE';
  
  let accentColor = "text-gold-400";
  let accentBg = "bg-gold-600";
  let accentBorder = "border-gold-600";
  
  if (isEngineer) {
      accentColor = "text-blue-400";
      accentBg = "bg-blue-600";
      accentBorder = "border-blue-600";
  } else if (isGovernance) {
      accentColor = "text-slate-200";
      accentBg = "bg-slate-600";
      accentBorder = "border-slate-500";
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, isReadjustment: boolean = false) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'application/pdf') {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1]);
                };
                reader.readAsDataURL(file);
            });

            newFiles.push({
                name: file.name,
                mimeType: file.type,
                data: base64
            });
        }
    }

    if (isReadjustment) {
        setReadjustFiles(prev => [...prev, ...newFiles]);
    } else {
        if (newFiles.length > 0) {
            setUploadedFiles(prev => [...prev, ...newFiles]);
        } else {
            alert("Por favor, selecione arquivos PDF válidos.");
        }
    }
  };

  const removeFile = (index: number, isReadjustment: boolean = false) => {
    if (isReadjustment) {
        setReadjustFiles(prev => prev.filter((_, i) => i !== index));
        if (readjustFileInputRef.current) readjustFileInputRef.current.value = '';
    } else {
        const updated = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(updated);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStartAnalysis = async () => {
    if (!inputText && uploadedFiles.length === 0) {
      alert("Por favor, insira um texto ou carregue o PDF do projeto.");
      return;
    }
    
    if (!selectedLens && !isEngineer) {
        alert("Por favor, selecione a Lente de Filtragem (A, B ou C).");
        return;
    }

    setIsLoading(true);
    try {
        const report = await generatePreReport(
            inputText, 
            '', 
            uploadedFiles, 
            project.mode, 
            project.auditorType, 
            selectedLens || undefined
        );

        let tier: Project['tier'] = 'NÍVEL 1';
        if (report.includes('NÍVEL 3')) tier = 'NÍVEL 3';
        else if (report.includes('NÍVEL 2')) tier = 'NÍVEL 2';

        onUpdate({
            ...project,
            description: inputText,
            files: uploadedFiles,
            selectedLens: selectedLens || undefined,
            preReportContent: report,
            tier,
            status: ProjectStatus.AWAITING_PAYMENT
        });
    } catch (error) {
        console.error(error);
        alert("Falha ao iniciar análise.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleApprovePayment = () => {
    onUpdate({
      ...project,
      status: ProjectStatus.PAID_APPROVED
    });
  };

  const handleStartQuestions = async () => {
    setIsLoading(true);
    try {
      const questions = await generateQuestionnaire(project.description, project.preReportContent || '', uploadedFiles, project.mode);
      onUpdate({
        ...project,
        questionnaireContent: questions,
        status: ProjectStatus.AWAITING_ANSWERS
      });
    } catch (error) {
      alert("Erro ao gerar interrogatório.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswers = async () => {
    setIsLoading(true);
    try {
      const result = await generateFinalReport(
        project.description, 
        project.questionnaireContent || '', 
        answers,
        uploadedFiles,
        project.mode,
        project.auditorType, 
        project.selectedLens
      );
      onUpdate({
        ...project,
        clientAnswers: answers,
        finalReportContent: result.technicalDossier,
        investmentOnePagerContent: result.investmentOnePager,
        engineerComplianceContent: result.engineerCompliance,
        auditorMetadataContent: result.auditorMetadata,
        governanceParecerContent: result.governanceParecer,
        rankingMetadata: result.rankingMetadata,
        version: "1.0",
        status: ProjectStatus.COMPLETED
      });
    } catch (error) {
      alert("Erro ao gerar relatório final.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAudit = async () => {
      setIsLoading(true);
      try {
          const contentToAudit = isGovernance ? project.governanceParecerContent : project.finalReportContent;
          const auditResult = await generateAuditReport(contentToAudit || '');
          onUpdate({
              ...project,
              auditReportContent: auditResult,
              status: ProjectStatus.AUDITED
          });
      } catch (error) {
          alert("Erro na auditoria.");
      } finally {
          setIsLoading(false);
      }
  };

  const handlePurgeData = () => {
       if (window.confirm("ATENÇÃO: Confirma a destruição dos dados originais? Esta ação é irreversível.")) {
           onUpdate({
               ...project,
               description: PURGE_MESSAGE,
               clientAnswers: PURGE_MESSAGE,
               files: [],
           });
       }
  };

  const handleExecuteReadjustment = async () => {
      if (!readjustComment && readjustFiles.length === 0) {
          alert("Por favor, descreva as alterações ou anexe novos arquivos para readequação.");
          return;
      }

      setIsLoading(true);
      try {
          const currentContent = isGovernance ? (project.governanceParecerContent || '') : (project.finalReportContent || '');
          
          const result = await runReadjustment(
              currentContent, 
              readjustFiles, 
              readjustComment, 
              project.mode, 
              project.auditorType
          );

          const newContent = result.technicalDossier;

          const updatedProject = { ...project };
          if (isGovernance) {
              updatedProject.governanceParecerContent = newContent;
          } else {
              updatedProject.finalReportContent = newContent;
          }
          updatedProject.version = "1.1 (Revisado)";

          onUpdate(updatedProject);

          setIsReadjusting(false);
          setReadjustComment("");
          setReadjustFiles([]);
          alert("Readequação concluída com sucesso.");

      } catch (error) {
          console.error(error);
          alert("Erro ao executar readequação.");
      } finally {
          setIsLoading(false);
      }
  };

  // =========================================================================
  // UNIFIED DOCUMENT GENERATOR (Used for both Print and PDF Download)
  // =========================================================================
  const generateDocumentHtml = (content: string) => {
      const parseMarkdownToHtml = (md: string) => {
          return md
            .replace(/\n/g, '<br/>')
            .replace(/^### (.*$)/gm, '<h3 style="font-size: 14pt; font-weight: bold; margin-top: 20px; color: #000;">$1</h3>')
            .replace(/^## (.*$)/gm, '<h2 style="font-size: 16pt; font-weight: bold; margin-top: 25px; border-bottom: 2px solid #000; padding-bottom: 5px; color: #000;">$1</h2>')
            .replace(/^# (.*$)/gm, '<h1 style="font-size: 20pt; font-weight: bold; text-align: center; margin-top: 30px; margin-bottom: 30px; text-transform: uppercase; color: #000;">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^- (.*$)/gm, '<li style="margin-left: 20px;">$1</li>')
            .replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #000; padding-left: 15px; font-style: italic; background: #f5f5f5; margin: 15px 0;">$1</blockquote>')
            .replace(/\[INICIO_.*?\]/g, '')
            .replace(/\[FIM_.*?\]/g, '');
      };

      const htmlContent = parseMarkdownToHtml(content);

      return `
        <html>
        <head>
            <title>${project.projectName} - Auditoria</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap');
                body { font-family: 'Merriweather', serif; color: black; background: white; margin: 0; padding: 20px; }
                a { color: black; text-decoration: none; }
                @media print {
                    @page { margin: 2cm; size: A4; }
                    body { -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div style="max-width: 210mm; margin: 0 auto;">
                <!-- HEADER -->
                <div style="border-bottom: 3px solid #D4AF37; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <div style="font-size: 32px; color: #D4AF37;">⚖️</div>
                        <div style="font-size: 22px; font-weight: bold; text-transform: uppercase; line-height: 1.2;">SWOT AUDITOR</div>
                        <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #555;">Auditoria de Compliance & Estratégia</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 14px; font-weight: bold;">${project.clientName}</div>
                        <div style="font-size: 11px; color: #555;">ID: ${project.id}</div>
                        <div style="font-size: 11px; color: #555;">Data: ${new Date().toLocaleDateString()}</div>
                    </div>
                </div>

                <!-- BODY -->
                <div style="font-size: 12pt; line-height: 1.6; text-align: justify;">
                    ${htmlContent}
                </div>

                <!-- FOOTER -->
                <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center;">
                     <p style="font-size: 11pt; font-weight: bold; margin: 0;">R. Morais - Sócio Sênior</p>
                     <p style="font-size: 10pt; margin: 5px 0 0 0; color: #444;">Auditor Líder de Compliance & Estratégia</p>
                     <p style="font-size: 9pt; margin-top: 10px; color: #888;">Hash de Autenticação: #${Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                </div>
            </div>
        </body>
        </html>
      `;
  };

  // NATIVE PRINT (POPUP WINDOW)
  const handleNativePrint = () => {
    // Get current content based on view or default to Final
    let content = reportViewMode === 'summary' 
        ? project.investmentOnePagerContent 
        : (isGovernance ? project.governanceParecerContent : project.finalReportContent);
        
    // Fallback if not completed
    if (!content) {
        if (project.preReportContent) content = project.preReportContent;
    }

    if (!content) {
        alert("Nenhum conteúdo disponível para impressão.");
        return;
    }

    const html = generateDocumentHtml(content);
    
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    } else {
        alert("Pop-up bloqueado. Permita pop-ups para imprimir.");
    }
  };

  // PDF DOWNLOAD (HTML2PDF)
  const handleDownloadPDF = (content: string, filename: string) => {
      if (!content) {
          alert("Conteúdo vazio. Não é possível gerar PDF.");
          return;
      }
      setPdfGenerating(filename);

      const htmlContent = generateDocumentHtml(content);
      
      // Temporary container
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      // Force it to be visible but off flow
      element.style.position = 'fixed';
      element.style.top = '0';
      element.style.left = '0';
      element.style.width = '210mm'; 
      element.style.zIndex = '9999';
      element.style.background = 'white';
      
      document.body.appendChild(element);

      const opt = {
          margin: 0,
          filename: `${filename}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      setTimeout(() => {
        html2pdf().from(element).set(opt).save().then(() => {
            document.body.removeChild(element);
            setPdfGenerating(null);
        }).catch((err: any) => {
            console.error("PDF Fail:", err);
            if (document.body.contains(element)) document.body.removeChild(element);
            setPdfGenerating(null);
            alert("Erro ao gerar PDF.");
        });
      }, 500);
  };

  // Define Library Items based on Project State
  const getLibraryItems = () => {
      const items = [];

      if (project.preReportContent && project.preReportContent.length > 20) {
          items.push({
              title: "Pré-Relatório de Viabilidade",
              type: "Triagem Inicial",
              icon: FileText,
              content: project.preReportContent,
              date: project.createdAt
          });
      }
      if (project.questionnaireContent && project.questionnaireContent.length > 20) {
          items.push({
              title: "Interrogatório Técnico",
              type: "Investigação",
              icon: Search,
              content: project.questionnaireContent,
              date: project.createdAt // Approx
          });
      }
      if (project.finalReportContent && project.finalReportContent.length > 20) {
          items.push({
              title: "Dossiê Técnico (Completo)",
              type: "Relatório Final",
              icon: BriefcaseBusiness,
              content: project.finalReportContent,
              date: Date.now()
          });
      }
      if (project.governanceParecerContent && project.governanceParecerContent.length > 20) {
          items.push({
              title: "Parecer Técnico Oficial",
              type: "Governança / Diário Oficial",
              icon: Gavel,
              content: project.governanceParecerContent,
              date: Date.now()
          });
      }
      if (project.investmentOnePagerContent && project.investmentOnePagerContent.length > 20) {
          items.push({
              title: "Sumário de Investimento",
              type: "One-Pager (Vendas)",
              icon: TrendingUp,
              content: project.investmentOnePagerContent,
              date: Date.now()
          });
      }
      if (project.engineerComplianceContent && project.engineerComplianceContent.length > 20) {
          items.push({
              title: "Relatório de Conformidade Interna",
              type: "Engenharia",
              icon: DraftingCompass,
              content: project.engineerComplianceContent,
              date: Date.now()
          });
      }
      if (project.auditReportContent && project.auditReportContent.length > 20) {
          items.push({
              title: "Certificado de Conformidade",
              type: "Auditoria Interna",
              icon: ShieldCheck,
              content: project.auditReportContent,
              date: Date.now()
          });
      }

      return items;
  };

  const libraryItems = getLibraryItems();

  const renderTabs = () => (
      <div className="flex gap-1 mb-6 border-b border-slate-800 print:hidden">
          <button onClick={() => setActiveTab('workflow')} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'workflow' ? `${accentColor} ${accentBorder} bg-slate-900/50` : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
              <Layers className="w-4 h-4" /> Fluxo Ativo
          </button>
          <button onClick={() => setActiveTab('documents')} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'documents' ? `${accentColor} ${accentBorder} bg-slate-900/50` : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
              <FolderOpen className="w-4 h-4" /> Biblioteca de Documentos 
              <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">{libraryItems.length}</span>
          </button>
      </div>
  );

  return (
    <div>
      {renderTabs()}
      
      {activeTab === 'workflow' && (
      <>
      {/* STEP 0: UNIFIED SELECTOR & UPLOAD */}
      {(project.status === ProjectStatus.INTAKE || project.status === ProjectStatus.ANALYZING_CONTEXT || project.status === ProjectStatus.CONTEXT_CONFIRMED) && (
         <div className="max-w-6xl mx-auto">
             <div className="bg-slate-900 border border-slate-700 p-8 rounded shadow-2xl">
                 <div className="flex items-center gap-4 mb-8">
                     <div className={`p-3 rounded-full ${accentBg}`}>
                        <Sliders className="w-6 h-6 text-white" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-display text-white">Setup de Auditoria</h2>
                        <p className="text-slate-400">
                            {isEngineer ? "Setup de Engenharia e Estruturação de Projeto" : 
                             (isGovernance ? "Protocolo de Admissibilidade Governamental (Modo Gestor)" : "Calibragem de Lentes e Upload de Documentos (Modo Consultoria)")}
                        </p>
                     </div>
                 </div>
                 
                 {/* LENS SELECTOR (Only for Auditor modes) */}
                 {!isEngineer && (
                     <div className="mb-10">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            1. Selecione a Lente de Filtragem
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <button 
                                onClick={() => setSelectedLens('A')}
                                className={`p-5 rounded border text-left transition-all relative group ${selectedLens === 'A' ? 'bg-blue-900/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                              >
                                  {selectedLens === 'A' && <div className="absolute top-3 right-3 text-blue-500"><CheckCircle className="w-5 h-5" /></div>}
                                  <BriefcaseBusiness className={`w-8 h-8 mb-3 ${selectedLens === 'A' ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                                  <div className="font-bold text-base mb-1">Lente A: Mercado</div>
                                  <p className="text-xs opacity-70 leading-relaxed">Foco em Viabilidade Econômica, Risco x Retorno e Regulação Privada (ANVISA/CVM).</p>
                              </button>
                              
                              <button 
                                onClick={() => setSelectedLens('B')}
                                className={`p-5 rounded border text-left transition-all relative group ${selectedLens === 'B' ? 'bg-purple-900/20 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                              >
                                  {selectedLens === 'B' && <div className="absolute top-3 right-3 text-purple-500"><CheckCircle className="w-5 h-5" /></div>}
                                  <GraduationCap className={`w-8 h-8 mb-3 ${selectedLens === 'B' ? 'text-purple-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                                  <div className="font-bold text-base mb-1">Lente B: Cultura</div>
                                  <p className="text-xs opacity-70 leading-relaxed">Foco em Editais (Rouanet/PG), Baremas de Pontuação e Aderência Técnica.</p>
                              </button>

                              <button 
                                onClick={() => setSelectedLens('C')}
                                className={`p-5 rounded border text-left transition-all relative group ${selectedLens === 'C' ? 'bg-green-900/20 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                              >
                                  {selectedLens === 'C' && <div className="absolute top-3 right-3 text-green-500"><CheckCircle className="w-5 h-5" /></div>}
                                  <Landmark className={`w-8 h-8 mb-3 ${selectedLens === 'C' ? 'text-green-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                                  <div className="font-bold text-base mb-1">Lente C: Legislativo</div>
                                  <p className="text-xs opacity-70 leading-relaxed">Foco em Leis, Constitucionalidade, Competência e Mérito Social.</p>
                              </button>
                          </div>
                          
                          {(selectedLens === 'B' || selectedLens === 'C') && (
                              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded flex items-center gap-3">
                                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                                  <p className="text-sm text-yellow-200">
                                      <strong>Atenção:</strong> A lente selecionada requer o upload do <u>Documento Regente</u> (Edital ou Lei Orgânica) junto com o projeto para cálculo da Aderência (Double Score).
                                  </p>
                              </div>
                          )}
                     </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                            2. Contexto do Projeto
                        </h3>
                        <textarea
                            className="w-full h-40 bg-slate-950 border border-slate-800 rounded p-4 text-slate-300 focus:outline-none focus:border-slate-600 transition-colors resize-none"
                            placeholder="Descreva o projeto, a ideia ou cole o texto base aqui. Se houver Edital ou Lei de referência, mencione o número ou nome..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                     </div>

                     <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                            3. Arquivos Fonte (PDF)
                        </h3>
                        <div 
                            className={`border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-900/50 transition-colors cursor-pointer ${!isEngineer && !isGovernance && (selectedLens === 'B' || selectedLens === 'C') ? 'border-yellow-700 bg-yellow-900/5' : 'border-slate-800'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => handleFileChange(e)}
                                className="hidden"
                                accept="application/pdf"
                                multiple
                            />
                            <Upload className={`w-10 h-10 mx-auto mb-3 ${!isEngineer && !isGovernance && (selectedLens === 'B' || selectedLens === 'C') ? 'text-yellow-500' : 'text-slate-600'}`} />
                            <p className="text-sm text-slate-300 font-bold mb-1">
                                {!isEngineer && !isGovernance ? "Carregar Projeto + Edital/Lei" : "Carregar Arquivos"}
                            </p>
                            <p className="text-xs text-slate-500">
                                {isEngineer ? "Ideias, Rascunhos ou Projetos Anteriores" : 
                                 (!isGovernance && (selectedLens === 'B' || selectedLens === 'C') 
                                    ? "Obrigatório: PDF do Projeto E PDF do Documento Regente (Edital/Lei)" 
                                    : "Minutas, Planos de Negócio ou Documentos Técnicos")}
                            </p>
                        </div>
                        
                        {uploadedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {uploadedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-slate-950 p-3 rounded border border-slate-800">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-red-900/20 p-1.5 rounded">
                                                <FileText className="w-4 h-4 text-red-400" />
                                            </div>
                                            <span className="text-sm text-slate-300 truncate max-w-[200px]">{file.name}</span>
                                            {index === 0 && <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">PRINCIPAL</span>}
                                        </div>
                                        <button onClick={() => removeFile(index)} className="text-slate-600 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>
                 </div>

                 <div className="flex justify-end mt-10 pt-6 border-t border-slate-800">
                     <button 
                        onClick={handleStartAnalysis} 
                        disabled={isLoading} 
                        className={`bg-white text-slate-950 hover:bg-slate-200 font-bold py-3 px-8 rounded shadow-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                     >
                         {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                         {isLoading ? 'Processando IA...' : 'Iniciar Análise'}
                     </button>
                 </div>
             </div>
         </div>
      )}

      {/* STEP 1: PRE-REPORT (INTAKE/PAYMENT) */}
      {(project.status === ProjectStatus.ANALYZING_PRE || project.status === ProjectStatus.AWAITING_PAYMENT || project.status === ProjectStatus.PAID_APPROVED) && (
        <div className="max-w-6xl mx-auto space-y-8">
            {project.preReportContent && (
                <div className="bg-slate-900 border border-slate-700 rounded shadow-2xl overflow-hidden">
                    <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                         <h3 className="text-gold-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Pré-Relatório Gerado
                         </h3>
                         <span className="text-xs text-slate-500">ID: {project.id}</span>
                    </div>
                    <ReportRenderer content={project.preReportContent} />
                </div>
            )}

            {project.status === ProjectStatus.AWAITING_PAYMENT && (
                <div className={`p-8 rounded border text-center ${isEngineer ? 'bg-blue-900/10 border-blue-800' : 'bg-gold-900/10 border-gold-800'}`}>
                    <CreditCard className={`w-12 h-12 mx-auto mb-4 ${isEngineer ? 'text-blue-400' : 'text-gold-400'}`} />
                    <h2 className="text-2xl font-display text-white mb-2">Aprovação de Orçamento</h2>
                    <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                        O pré-relatório indicou a viabilidade e o custo do serviço. Para prosseguir com a Auditoria Profunda (Due Diligence) ou Estruturação, confirme o pagamento.
                    </p>
                    <button 
                        onClick={handleApprovePayment}
                        className={`${isEngineer ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gold-600 hover:bg-gold-500'} text-slate-950 font-bold py-3 px-8 rounded shadow-lg transition-colors`}
                    >
                        Aprovar Pagamento e Iniciar
                    </button>
                </div>
            )}

            {project.status === ProjectStatus.PAID_APPROVED && (
                <div className="text-center py-12">
                     <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                     <h2 className="text-2xl font-display text-white mb-2">Pagamento Confirmado</h2>
                     <p className="text-slate-400 mb-6">Iniciando fase de investigação técnica...</p>
                     <button 
                        onClick={handleStartQuestions}
                        disabled={isLoading}
                        className="bg-white text-slate-950 hover:bg-slate-200 font-bold py-3 px-8 rounded shadow-lg flex items-center gap-2 mx-auto"
                     >
                         {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                         Gerar Questionário Técnico
                     </button>
                </div>
            )}
        </div>
      )}

      {/* STEP 2: QUESTIONNAIRE & ANSWERS */}
      {(project.status === ProjectStatus.ANALYZING_QUESTIONS || project.status === ProjectStatus.AWAITING_ANSWERS) && (
          <div className="max-w-6xl mx-auto space-y-8">
              <div className="bg-slate-900 border border-slate-700 rounded shadow-2xl overflow-hidden">
                  <div className="p-4 bg-slate-950 border-b border-slate-800">
                      <h3 className="text-gold-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                          <Search className="w-4 h-4" /> Interrogatório Técnico (Due Diligence)
                      </h3>
                  </div>
                  <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="prose-report max-h-[600px] overflow-y-auto pr-4 border-r border-slate-800">
                           <ReportRenderer content={project.questionnaireContent || ''} />
                      </div>
                      <div className="flex flex-col h-full">
                          <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Respostas do Cliente</h4>
                          <textarea
                              className="flex-1 bg-slate-950 border border-slate-800 rounded p-4 text-slate-300 focus:outline-none focus:border-gold-500 resize-none min-h-[400px]"
                              placeholder="Insira as respostas detalhadas para cada ponto do questionário aqui..."
                              value={answers}
                              onChange={(e) => setAnswers(e.target.value)}
                          />
                          <div className="mt-4 flex justify-end">
                              <button 
                                  onClick={handleSubmitAnswers}
                                  disabled={isLoading || !answers}
                                  className="bg-gold-600 hover:bg-gold-500 text-slate-950 font-bold py-3 px-8 rounded shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                  {isLoading ? 'Gerando Dossiê Final...' : 'Finalizar e Gerar Dossiê'}
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* STEP 3: FINAL REPORT / DASHBOARD */}
      {(project.status === ProjectStatus.COMPLETED || project.status === ProjectStatus.AUDITING || project.status === ProjectStatus.AUDITED) && (
          <div className="max-w-7xl mx-auto space-y-8">
              
              {/* Header Actions */}
              <div className="flex justify-between items-center bg-slate-900 p-4 rounded border border-slate-800">
                  <div className="flex gap-4">
                      <button 
                        onClick={() => setReportViewMode('full')}
                        className={`px-4 py-2 rounded text-sm font-bold uppercase ${reportViewMode === 'full' ? 'bg-white text-black' : 'text-slate-400 hover:bg-slate-800'}`}
                      >
                          Dossiê Técnico
                      </button>
                      
                      {!isGovernance && !isEngineer && (
                          <button 
                            onClick={() => setReportViewMode('summary')}
                            className={`px-4 py-2 rounded text-sm font-bold uppercase ${reportViewMode === 'summary' ? 'bg-white text-black' : 'text-slate-400 hover:bg-slate-800'}`}
                          >
                              One-Pager (Investidor)
                          </button>
                      )}
                  </div>

                  <div className="flex gap-3">
                      <button onClick={handleNativePrint} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700" title="Imprimir (Nativo)">
                          <Printer className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(
                            reportViewMode === 'summary' ? (project.investmentOnePagerContent || '') : (isGovernance ? (project.governanceParecerContent || '') : (project.finalReportContent || '')),
                            `${project.projectName}_${reportViewMode}`
                        )}
                        className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700" 
                        title="Baixar PDF"
                      >
                          {pdfGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                      </button>
                      {project.status !== ProjectStatus.AUDITED && !isEngineer && (
                          <button 
                            onClick={handleAudit} 
                            disabled={isLoading}
                            className="px-4 py-2 bg-gold-600 text-slate-950 font-bold rounded hover:bg-gold-500 flex items-center gap-2"
                          >
                             <ShieldCheck className="w-4 h-4" /> Auditar Conformidade
                          </button>
                      )}
                      <button onClick={handlePurgeData} className="p-2 bg-red-900/20 text-red-500 border border-red-900/50 rounded hover:bg-red-900/40" title="Destruir Dados (LGPD)">
                          <Eraser className="w-5 h-5" />
                      </button>
                  </div>
              </div>

              {/* Main Content Viewer */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Document Viewer */}
                  <div className="lg:col-span-2 bg-white text-black rounded-sm shadow-2xl min-h-[800px] p-8 lg:p-12 font-serif relative">
                      {/* Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                          <Scale className="w-96 h-96" />
                      </div>

                      {/* Header for Print */}
                      <div className="border-b-4 border-gold-500 pb-6 mb-8 flex justify-between items-end">
                          <div>
                              <div className="text-4xl text-gold-600 mb-2">⚖️</div>
                              <h1 className="text-2xl font-bold uppercase leading-none">SWOT Auditor</h1>
                              <p className="text-xs tracking-[0.2em] text-slate-500 uppercase mt-1">Auditoria de Compliance & Estratégia</p>
                          </div>
                          <div className="text-right">
                              <h2 className="font-bold text-sm">{project.clientName}</h2>
                              <p className="text-xs text-slate-500">ID: {project.id}</p>
                              <p className="text-xs text-slate-500">{new Date().toLocaleDateString()}</p>
                          </div>
                      </div>

                      <div className="prose-report text-justify">
                           {reportViewMode === 'full' ? (
                               <ReportRenderer content={isGovernance ? (project.governanceParecerContent || '') : (project.finalReportContent || '')} mode="paper" />
                           ) : (
                               <ReportRenderer content={project.investmentOnePagerContent || ''} mode="paper" />
                           )}
                      </div>
                      
                      {/* Footer */}
                      <div className="mt-16 pt-8 border-t border-slate-300 text-center">
                          <p className="font-bold text-sm">R. Morais - Sócio Sênior</p>
                          <p className="text-xs text-slate-500">Auditor Líder de Compliance & Estratégia</p>
                          <p className="text-[10px] text-slate-400 mt-2">Hash de Autenticação: #{Math.random().toString(36).substring(2,10).toUpperCase()}</p>
                      </div>
                  </div>

                  {/* Sidebar Tools */}
                  <div className="space-y-6">
                      {/* Re-adjustment Tool (Fênix Logic) */}
                      <div className="bg-slate-900 border border-slate-700 p-6 rounded shadow-lg">
                          <h3 className="text-white font-bold flex items-center gap-2 mb-4">
                              <RefreshCw className="w-4 h-4 text-blue-400" /> Readequação / Recurso
                          </h3>
                          <div className="space-y-3">
                              <textarea 
                                  className="w-full h-24 bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300"
                                  placeholder="Descreva o fato novo, a exigência do edital ou o motivo da revisão..."
                                  value={readjustComment}
                                  onChange={(e) => setReadjustComment(e.target.value)}
                              />
                              <div 
                                onClick={() => readjustFileInputRef.current?.click()}
                                className="border border-dashed border-slate-700 rounded p-3 text-center cursor-pointer hover:bg-slate-800/50"
                              >
                                  <input 
                                      type="file" 
                                      ref={readjustFileInputRef}
                                      onChange={(e) => handleFileChange(e, true)}
                                      className="hidden" 
                                      multiple 
                                      accept="application/pdf"
                                  />
                                  <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                                      <Upload className="w-3 h-3" /> Anexar Novos Documentos
                                  </p>
                              </div>
                              {readjustFiles.length > 0 && (
                                  <div className="space-y-1">
                                      {readjustFiles.map((f, i) => (
                                          <div key={i} className="flex justify-between text-[10px] text-slate-400 bg-slate-950 p-1 rounded">
                                              <span>{f.name}</span>
                                              <button onClick={() => removeFile(i, true)}><X className="w-3 h-3 text-red-500" /></button>
                                          </div>
                                      ))}
                                  </div>
                              )}
                              <button 
                                  onClick={handleExecuteReadjustment}
                                  disabled={isLoading}
                                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2"
                              >
                                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <GitBranch className="w-3 h-3" />}
                                  Executar Revisão Cirúrgica
                              </button>
                          </div>
                      </div>

                      {/* Audit Status (If Audited) */}
                      {project.status === ProjectStatus.AUDITED && (
                          <div className="bg-green-900/20 border border-green-500/30 p-6 rounded">
                               <h3 className="text-green-400 font-bold flex items-center gap-2 mb-2">
                                  <ShieldCheck className="w-5 h-5" /> Auditoria Finalizada
                               </h3>
                               <p className="text-xs text-green-200/70 mb-4">Este documento passou pela validação de integridade final.</p>
                               <div className="prose-report text-xs text-green-100 max-h-40 overflow-y-auto">
                                   <ReportRenderer content={project.auditReportContent || ''} />
                               </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
      </>
      )}

      {activeTab === 'documents' && (
          <div className="max-w-7xl mx-auto">
              <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-display text-white">Biblioteca do Projeto</h2>
                        <p className="text-xs text-slate-500">Repositório central de artefatos gerados para {project.projectName}</p>
                      </div>
                      <div className="text-xs text-slate-600 font-mono">
                          TOTAL: {libraryItems.length} ARQUIVOS
                      </div>
                  </div>
                  
                  {libraryItems.length === 0 ? (
                      <div className="p-12 text-center text-slate-500">
                          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p>Nenhum documento gerado ainda.</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                          {libraryItems.map((item, index) => (
                              <div key={index} className="bg-slate-950 border border-slate-800 rounded-lg p-5 hover:border-gold-500/30 transition-all group relative overflow-hidden">
                                  <div className={`absolute top-0 left-0 w-1 h-full ${
                                      item.type.includes('Final') ? 'bg-green-500' : 
                                      (item.type.includes('Vendas') ? 'bg-gold-500' : 'bg-slate-700')
                                  }`}></div>
                                  
                                  <div className="flex justify-between items-start mb-4 pl-3">
                                      <div className="p-2 bg-slate-900 rounded border border-slate-800 group-hover:bg-slate-800 transition-colors">
                                          <item.icon className="w-6 h-6 text-slate-400 group-hover:text-gold-400" />
                                      </div>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-800 px-2 py-1 rounded bg-slate-900">
                                          {item.type}
                                      </span>
                                  </div>
                                  
                                  <h3 className="text-slate-200 font-bold mb-1 pl-3 truncate" title={item.title}>{item.title}</h3>
                                  <p className="text-xs text-slate-500 pl-3 mb-6">Gerado em: {new Date(item.date).toLocaleDateString()}</p>
                                  
                                  <div className="flex gap-2 pl-3">
                                      <button 
                                          onClick={() => handleNativePrint()} // In a real app, pass specific content
                                          className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded border border-slate-800 hover:border-slate-700 transition-all"
                                      >
                                          Visualizar
                                      </button>
                                      <button 
                                          onClick={() => handleDownloadPDF(item.content, item.title)}
                                          className="flex-1 py-2 bg-slate-900 hover:bg-gold-600 hover:text-white text-gold-500 text-xs font-bold rounded border border-slate-800 hover:border-gold-500 transition-all flex justify-center items-center gap-2"
                                      >
                                          <Download className="w-3 h-3" /> PDF
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};