import React, { useState } from 'react';
import { Project, ProjectStatus, ProjectMode, AuditorType, User } from '../types';
import { Plus, Search, ChevronRight, AlertCircle, Briefcase, Clock, CheckCircle2, FolderOpen, Scale, DraftingCompass, Trash2, Gavel, Lock } from 'lucide-react';

interface DashboardProps {
  user: User; // Passed to check Admin status
  projects: Project[];
  onSelectProject: (id: string) => void;
  onCreateProject: (clientName: string, projectName: string, mode: ProjectMode, auditorType?: AuditorType) => void;
  onDeleteProject: (id: string) => void;
  onNavigateToAdmin?: () => void; // New prop for navigation
}

export const Dashboard: React.FC<DashboardProps> = ({ user, projects, onSelectProject, onCreateProject, onDeleteProject, onNavigateToAdmin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState('');
  const [newProject, setNewProject] = useState('');
  
  // Creation Context State
  const [creationContext, setCreationContext] = useState<{
      mode: ProjectMode, 
      auditorType?: AuditorType, 
      title: string, 
      desc: string,
      color: string
  } | null>(null);

  const openCreationModal = (mode: ProjectMode, auditorType?: AuditorType) => {
      let title = "";
      let desc = "";
      let color = "";

      if (mode === ProjectMode.ENGINEER) {
          title = "Novo Projeto de Engenharia";
          desc = "Modo Projetista: Estruturação de Ideias (Gênesis) ou Reengenharia (Fênix).";
          color = "text-blue-400";
      } else if (auditorType === 'GOVERNANCE') {
          title = "Nova Auditoria Pública";
          desc = "Modo Governança: Análise de Admissibilidade e Parecer Técnico Oficial (Gestor).";
          color = "text-slate-300";
      } else {
          title = "Nova Auditoria de Projetos";
          desc = "Modo Consultoria: Análise de Viabilidade e Blindagem Estratégica (Proponente).";
          color = "text-gold-400";
      }

      setCreationContext({ mode, auditorType, title, desc, color });
      setIsModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClient && newProject && creationContext) {
      onCreateProject(newClient, newProject, creationContext.mode, creationContext.auditorType);
      setNewClient('');
      setNewProject('');
      setCreationContext(null);
      setIsModalOpen(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering onSelectProject
    onDeleteProject(id);
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.INTAKE:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">TRIAGEM</span>;
      case ProjectStatus.ANALYZING_CONTEXT:
      case ProjectStatus.ANALYZING_PRE:
      case ProjectStatus.ANALYZING_QUESTIONS:
      case ProjectStatus.ANALYZING_FINAL:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800 animate-pulse">PROCESSANDO</span>;
      case ProjectStatus.AWAITING_PAYMENT:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-300 border border-red-800">PENDENTE</span>;
      case ProjectStatus.PAID_APPROVED:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-800">APROVADO</span>;
      case ProjectStatus.AWAITING_ANSWERS:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-300 border border-yellow-800">DILIGÊNCIA</span>;
      case ProjectStatus.COMPLETED:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold-600/20 text-gold-400 border border-gold-600">FINALIZADO</span>;
      default:
        return null;
    }
  };

  const hasDocuments = (project: Project) => {
    return !!project.preReportContent || !!project.questionnaireContent || !!project.finalReportContent || !!project.governanceParecerContent;
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-display text-white tracking-tight">Painel de Controle</h2>
          <p className="text-slate-400 font-serif mt-1 italic">Gestão de Auditorias e Governança Pública</p>
        </div>
        
        <div className="flex gap-4">
            {/* Button A: Proponente */}
            <button
                onClick={() => openCreationModal(ProjectMode.AUDITOR, 'CONSULTANCY')}
                className="bg-gold-600 hover:bg-gold-500 text-slate-950 font-bold py-3 px-6 rounded flex items-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all hover:-translate-y-0.5"
            >
                <Briefcase className="w-5 h-5" />
                <div className="text-left leading-tight">
                    <span className="block text-xs font-normal opacity-80 uppercase tracking-wide">Modo Consultoria</span>
                    <span className="block">Auditor de Projetos</span>
                </div>
            </button>

            {/* Button B: Gestor Público */}
            <button
                onClick={() => openCreationModal(ProjectMode.AUDITOR, 'GOVERNANCE')}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded flex items-center gap-3 shadow-lg border border-slate-600 transition-all hover:-translate-y-0.5"
            >
                <Gavel className="w-5 h-5" />
                <div className="text-left leading-tight">
                    <span className="block text-xs font-normal opacity-80 uppercase tracking-wide">Modo Governança</span>
                    <span className="block">Auditor Público</span>
                </div>
            </button>
            
            {/* Secondary: Engineer */}
            <button
                onClick={() => openCreationModal(ProjectMode.ENGINEER)}
                className="p-3 text-slate-500 hover:text-blue-400 border border-slate-800 hover:border-blue-900 rounded transition-all"
                title="Modo Projetista (Engenharia)"
            >
                <DraftingCompass className="w-6 h-6" />
            </button>

            {/* ADMIN BUTTON - VISIBLE ONLY TO ADMIN */}
            {user.isAdmin && (
                <button
                    onClick={onNavigateToAdmin}
                    className="p-3 bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50 hover:border-red-500 rounded transition-all shadow-lg animate-pulse"
                    title="Acesso Administrativo (Liberar Cadastros)"
                >
                    <Lock className="w-6 h-6" />
                </button>
            )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900/50 p-6 rounded border border-slate-800 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Briefcase className="w-16 h-16 text-slate-400" />
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total de Processos</h3>
          <p className="text-4xl font-display text-white">{projects.length}</p>
        </div>
        <div className="bg-slate-900/50 p-6 rounded border border-slate-800 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-16 h-16 text-gold-400" />
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Em Análise / Pendente</h3>
          <p className="text-4xl font-display text-gold-400">
            {projects.filter(p => p.status === ProjectStatus.AWAITING_PAYMENT || p.status === ProjectStatus.AWAITING_ANSWERS).length}
          </p>
        </div>
        <div className="bg-slate-900/50 p-6 rounded border border-slate-800 backdrop-blur-sm relative overflow-hidden group">
           <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Concluídos / Deferidos</h3>
          <p className="text-4xl font-display text-green-500">
            {projects.filter(p => p.status === ProjectStatus.COMPLETED).length}
          </p>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <h3 className="font-display text-slate-300 tracking-wide">Processos Recentes</h3>
          <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
             <input type="text" placeholder="Buscar ID ou Cliente..." className="bg-slate-900 border border-slate-700 rounded-full py-1.5 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-gold-500 w-64 transition-all focus:w-80" />
          </div>
        </div>
        
        {projects.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
                <AlertCircle className="w-8 h-8 opacity-40" />
            </div>
            <p className="font-serif">Nenhum processo cadastrado no sistema.</p>
            <p className="text-xs uppercase tracking-widest mt-2 opacity-50">Selecione um modo acima para iniciar.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800 bg-slate-950/50">
                <th className="px-6 py-4 font-bold">Proponente / Objeto</th>
                <th className="px-6 py-4 font-bold">Título do Projeto</th>
                <th className="px-6 py-4 font-bold">Modo de Atuação</th>
                <th className="px-6 py-4 font-bold">Classificação</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-800/40 transition-colors cursor-pointer group" onClick={() => onSelectProject(project.id)}>
                  <td className="px-6 py-4 font-medium text-white group-hover:text-gold-200 transition-colors flex items-center gap-3">
                     {project.clientName}
                     {hasDocuments(project) && (
                         <span title="Documentos Arquivados" className="flex items-center">
                            <FolderOpen className="w-3 h-3 text-gold-500/70" />
                         </span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{project.projectName}</td>
                  <td className="px-6 py-4">
                      {project.mode === ProjectMode.ENGINEER ? (
                          <span className="flex items-center gap-2 text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/50 w-fit">
                              <DraftingCompass className="w-3 h-3" /> PROJETISTA
                          </span>
                      ) : (
                          <div className="flex flex-col">
                              <span className={`flex items-center gap-2 text-xs px-2 py-1 rounded border w-fit ${project.auditorType === 'GOVERNANCE' ? 'text-slate-300 bg-slate-800 border-slate-600' : 'text-gold-400 bg-gold-900/20 border-gold-900/50'}`}>
                                  {project.auditorType === 'GOVERNANCE' ? <Gavel className="w-3 h-3" /> : <Scale className="w-3 h-3" />} 
                                  {project.auditorType === 'GOVERNANCE' ? 'GESTOR PÚBLICO' : 'AUDITOR PRIVADO'}
                              </span>
                          </div>
                      )}
                  </td>
                  <td className="px-6 py-4">
                     {project.tier ? (
                         <span className="text-xs font-mono text-slate-400 border border-slate-700 px-2 py-1 rounded bg-slate-900">{project.tier}</span>
                     ) : (
                         <span className="text-slate-600 text-xs">-</span>
                     )}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(project.status)}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    <button 
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-900/10 rounded transition-all"
                        title="Excluir Registro Permanentemente"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-slate-600 inline group-hover:text-gold-400 transition-colors transform group-hover:translate-x-1" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Context Aware Modal */}
      {isModalOpen && creationContext && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 w-full max-w-2xl shadow-2xl relative">
             <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${creationContext.color.replace('text-', '')} to-transparent opacity-50`}></div>
            
            <h3 className={`text-2xl font-display mb-2 flex items-center gap-3 ${creationContext.color}`}>
                <Plus className="w-6 h-6" />
                {creationContext.title}
            </h3>
            <p className="text-slate-400 font-serif text-sm mb-6">{creationContext.desc}</p>
            
            <form onSubmit={handleCreate} className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Proponente / Razão Social</label>
                <input
                  type="text"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-4 text-white focus:border-slate-500 focus:outline-none transition-all placeholder:text-slate-700 font-serif"
                  placeholder="Ex: Secretaria de Cultura ou Empresa Ltda"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Título do Processo / Projeto</label>
                <input
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-4 text-white focus:border-slate-500 focus:outline-none transition-all placeholder:text-slate-700 font-serif"
                  placeholder="Ex: Edital 001/2025 ou Captação Série A"
                  required
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-4 rounded border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors font-medium text-sm uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-4 px-4 rounded font-bold text-slate-950 transition-all shadow-lg text-sm uppercase tracking-wider ${
                      creationContext.mode === ProjectMode.ENGINEER ? 'bg-blue-600 hover:bg-blue-500' : 
                      (creationContext.auditorType === 'GOVERNANCE' ? 'bg-slate-300 hover:bg-white' : 'bg-gold-600 hover:bg-gold-500')
                  }`}
                >
                  Confirmar Abertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};