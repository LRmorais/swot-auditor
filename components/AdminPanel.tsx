
import React, { useState, useEffect } from 'react';
import { promptService } from '../services/promptService';
import { authService } from '../services/authService';
import { User } from '../types';
import { Save, RefreshCw, AlertTriangle, CheckCircle, Lock, Users, CheckSquare, Clock } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [prompts, setPrompts] = useState({ auditor: '', engineer: '', chatbot: '' });
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'prompts' | 'users'>('prompts');
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    // Load Prompts
    const data = await promptService.getAllPrompts();
    setPrompts({
      auditor: data.auditor,
      engineer: data.engineer,
      chatbot: data.chatbot
    });
    
    // Load Pending Users (In real app, fetch from DB where isApproved == false)
    const allUsers = authService.getUsers();
    setPendingUsers(allUsers.filter(u => !u.isApproved));

    setIsLoading(false);
  };

  const handleSavePrompts = async () => {
    setIsLoading(true);
    setStatus('');
    try {
      await promptService.updatePrompts(prompts);
      setStatus('Prompt Intelligence Updated Successfully on Cloud.');
    } catch (error) {
      setStatus('Error updating prompts. Check permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUser = (userId: string) => {
      authService.approveUser(userId);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      setStatus('Usuário aprovado e acesso liberado.');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-3xl font-display text-white flex items-center gap-3">
             <Lock className="w-8 h-8 text-gold-500" />
             Painel de Inteligência (CMS)
           </h1>
           <p className="text-slate-400 mt-1">Gestão Dinâmica e Controle de Acesso (V28.0)</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-700 pb-1">
          <button 
            onClick={() => setActiveTab('prompts')}
            className={`px-4 py-2 text-sm font-bold uppercase ${activeTab === 'prompts' ? 'text-gold-400 border-b-2 border-gold-400' : 'text-slate-500'}`}
          >
              Configuração de IA
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-bold uppercase flex items-center gap-2 ${activeTab === 'users' ? 'text-gold-400 border-b-2 border-gold-400' : 'text-slate-500'}`}
          >
              Aprovações Pendentes
              {pendingUsers.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pendingUsers.length}</span>}
          </button>
      </div>

      {status && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded text-green-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> {status}
          </div>
      )}

      {activeTab === 'prompts' ? (
          <>
            <div className="flex justify-end mb-4">
                <button onClick={handleSavePrompts} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded font-bold flex items-center gap-2">
                    <Save className="w-5 h-5" /> Salvar Definições
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Auditor Editor */}
                <div className="bg-slate-900 border border-slate-700 rounded p-6">
                    <h2 className="text-gold-400 font-bold mb-4 flex items-center justify-between">
                        PROMPT: AUDITOR (V28)
                        <span className="text-xs text-slate-500 uppercase">Principal</span>
                    </h2>
                    <textarea 
                        value={prompts.auditor}
                        onChange={(e) => setPrompts({...prompts, auditor: e.target.value})}
                        className="w-full h-96 bg-slate-950 border border-slate-800 rounded p-4 text-xs font-mono text-slate-300 focus:border-gold-500 focus:outline-none"
                    />
                </div>

                {/* Engineer Editor */}
                <div className="bg-slate-900 border border-slate-700 rounded p-6">
                    <h2 className="text-blue-400 font-bold mb-4 flex items-center justify-between">
                        PROMPT: PROJETISTA (V1.0)
                        <span className="text-xs text-slate-500 uppercase">Engenharia</span>
                    </h2>
                    <textarea 
                        value={prompts.engineer}
                        onChange={(e) => setPrompts({...prompts, engineer: e.target.value})}
                        className="w-full h-96 bg-slate-950 border border-slate-800 rounded p-4 text-xs font-mono text-slate-300 focus:border-blue-500 focus:outline-none"
                    />
                </div>
            </div>
          </>
      ) : (
          /* USER APPROVAL TAB */
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                  <h3 className="text-white font-bold flex items-center gap-2">
                      <Users className="w-5 h-5" /> Solicitações de Cadastro
                  </h3>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Aguardando Validação</span>
              </div>
              
              {pendingUsers.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Nenhuma solicitação pendente.</p>
                  </div>
              ) : (
                  <div className="divide-y divide-slate-800">
                      {pendingUsers.map(user => (
                          <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                              <div className="flex gap-4 items-center">
                                  <div className="p-3 bg-slate-800 rounded-full">
                                      <Clock className="w-5 h-5 text-yellow-500" />
                                  </div>
                                  <div>
                                      <p className="text-white font-bold">{user.name} <span className="text-slate-500 font-normal text-xs">({user.type})</span></p>
                                      <p className="text-xs text-slate-400">Doc: {user.document} | {user.city}/{user.uf}</p>
                                      <p className="text-xs text-slate-500">{user.email}</p>
                                  </div>
                              </div>
                              <div className="flex gap-3">
                                  <button 
                                      onClick={() => handleApproveUser(user.id)}
                                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded flex items-center gap-2"
                                  >
                                      <CheckSquare className="w-4 h-4" /> Aprovar Acesso
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}
    </div>
  );
};
