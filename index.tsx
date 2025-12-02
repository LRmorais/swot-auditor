
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProjectWorkflow } from './components/ProjectWorkflow';
import { Chatbot } from './components/Chatbot';
import { LandingPage } from './components/LandingPage';
import { AdminPanel } from './components/AdminPanel'; 
import { Project, ProjectStatus, ProjectMode, AuditorType, User } from './types';
import { initializeGemini } from './services/geminiService';
import { authService } from './services/authService';
import { LogOut, AlertTriangle, RefreshCw } from 'lucide-react';

// === ERROR BOUNDARY COMPONENT ===
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("CRITICAL SYSTEM FAILURE:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-8 font-sans">
          <div className="bg-red-900/20 border border-red-800 p-8 rounded-lg max-w-lg text-center shadow-2xl">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-400 mb-2">Falha Crítica no Sistema</h1>
            <p className="text-slate-400 mb-6">Ocorreu um erro inesperado durante a execução. O sistema de proteção (V34 Safety) bloqueou a operação.</p>
            <div className="bg-black/50 p-4 rounded text-xs font-mono text-left mb-6 text-red-300 overflow-auto max-h-32">
              {this.state.error?.toString()}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-white text-black font-bold py-3 px-6 rounded hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 w-full"
            >
              <RefreshCw className="w-4 h-4" /> Reiniciar Sistema
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('swot_projects');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to load projects", e);
      return [];
    }
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // System Boot Logic - V34.0 Deep Legal Core
  useEffect(() => {
    try {
        console.clear();
        console.log("%c SYSTEM BOOT: SWOT AUDITOR PRO V34.0 - DEEP LEGAL CORE (ACTIVE)", "color: #D4AF37; font-weight: bold; font-size: 16px; background: #1e293b; padding: 10px; border-radius: 5px;");
        
        // Check for active session safely
        const session = authService.getCurrentUser();
        if (session) {
            const users = authService.getUsers();
            const freshUser = users.find(u => u.id === session.id);
            if (freshUser && freshUser.isApproved) {
                setUser(freshUser);
            } else {
                authService.logout();
                setUser(null);
            }
        }
        
        if (process.env.API_KEY) {
          initializeGemini(process.env.API_KEY);
        }
    } catch (e) {
        console.error("Boot sequence failed:", e);
    }
  }, []);

  useEffect(() => {
    if (projects) {
        localStorage.setItem('swot_projects', JSON.stringify(projects));
    }
  }, [projects]);

  const handleCreateProject = (clientName: string, projectName: string, mode: ProjectMode, auditorType?: AuditorType) => {
    if (!user) return;

    const newProject: Project = {
      id: Math.random().toString(36).substring(2, 11).toUpperCase(),
      userId: user.id, 
      clientName,
      projectName,
      description: '',
      createdAt: Date.now(),
      status: ProjectStatus.INTAKE,
      mode: mode,
      auditorType: auditorType, 
      version: '1.0'
    };
    setProjects([newProject, ...projects]);
    setSelectedProjectId(newProject.id);
    setCurrentView('project_view');
  };

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentView('project_view');
  };

  const handleUpdateProject = (updatedProject: Project) => {
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    setProjects(updatedProjects);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm("ATENÇÃO: Deseja excluir este registro permanentemente?")) {
        const updatedProjects = projects.filter(p => p.id !== id);
        setProjects(updatedProjects);
        if (selectedProjectId === id) {
            setSelectedProjectId(null);
            setCurrentView('dashboard');
        }
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
      setUser(loggedInUser);
      setCurrentView('dashboard');
  };

  const handleLogout = () => {
      authService.logout();
      setUser(null);
      setSelectedProjectId(null);
      setCurrentView('dashboard');
  };

  // Filter projects for the current user
  const userProjects = projects.filter(p => p.userId === user?.id);
  const selectedProject = userProjects.find(p => p.id === selectedProjectId);

  // AUTH GUARD: Show Landing Page if not logged in
  if (!user) {
      return (
        <ErrorBoundary>
            <LandingPage onLoginSuccess={handleLoginSuccess} />
        </ErrorBoundary>
      );
  }

  return (
    <ErrorBoundary>
        <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-gold-500/30">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} isAdmin={user.isAdmin} />
        
        <main className="flex-1 overflow-auto relative flex flex-col">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none"></div>
            
            {/* Top Bar for User Info */}
            <div className="relative z-10 bg-slate-950/80 backdrop-blur border-b border-slate-800 px-8 py-3 flex justify-between items-center print:hidden">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${user.isApproved ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    Logado como: <span className="text-gold-400 font-bold">{user.name}</span> 
                    <span className="bg-slate-800 px-1.5 rounded text-[10px]">{user.type}</span> 
                    {user.isAdmin && <span className="bg-red-900/30 text-red-400 px-1.5 rounded text-[10px] border border-red-900/50">ADMIN</span>}
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-400 transition-colors uppercase tracking-wider"
                >
                    <LogOut className="w-3 h-3" /> Sair
                </button>
            </div>

            <div className="relative z-0 flex-1">
            {currentView === 'dashboard' && (
                <Dashboard 
                user={user}
                projects={userProjects} 
                onSelectProject={handleSelectProject} 
                onCreateProject={handleCreateProject}
                onDeleteProject={handleDeleteProject}
                onNavigateToAdmin={() => setCurrentView('admin')}
                />
            )}
            
            {currentView === 'projects' && (
                <Dashboard 
                user={user}
                projects={userProjects} 
                onSelectProject={handleSelectProject} 
                onCreateProject={handleCreateProject}
                onDeleteProject={handleDeleteProject}
                onNavigateToAdmin={() => setCurrentView('admin')}
                />
            )}

            {currentView === 'project_view' && selectedProject && (
                <ProjectWorkflow 
                project={selectedProject} 
                onUpdate={handleUpdateProject} 
                />
            )}

            {currentView === 'admin' && (
                <AdminPanel />
            )}
            </div>
        </main>

        {/* Global Chatbot Overlay */}
        <Chatbot />
        </div>
    </ErrorBoundary>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
