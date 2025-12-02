
import React, { useState, useEffect } from 'react';
import { Scale, ArrowRight, ShieldCheck, UserPlus, LogIn, CheckCircle, Loader2, Lock } from 'lucide-react';
import { authService, UF_LIST, fetchCitiesForState } from '../services/authService';
import { User } from '../types';

interface LandingPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);
  
  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Doc
  const [loginPass, setLoginPass] = useState('');

  // Register State
  const [regType, setRegType] = useState<'PF' | 'PJ'>('PF');
  const [regName, setRegName] = useState('');
  const [regDoc, setRegDoc] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regUF, setRegUF] = useState('');
  const [regCity, setRegCity] = useState('');
  
  // Cities logic
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Fetch cities when UF changes
  useEffect(() => {
    const loadCities = async () => {
        if (!regUF) {
            setCitiesList([]);
            setRegCity('');
            return;
        }

        setIsLoadingCities(true);
        setRegCity(''); // Reset selected city
        try {
            const cities = await fetchCitiesForState(regUF);
            setCitiesList(cities);
        } catch (e) {
            console.error("Erro ao carregar cidades", e);
            setCitiesList([]);
        } finally {
            setIsLoadingCities(false);
        }
    };

    loadCities();
  }, [regUF]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = authService.login(loginIdentifier, loginPass);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Erro ao efetuar login.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPendingApproval(false);

    // Basic Validation
    if (!regUF) {
      setError('Selecione a Unidade da Federação (UF).');
      return;
    }
    if (!regCity) {
        setError('Selecione o Município.');
        return;
    }

    try {
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 10),
        name: regName,
        email: regEmail,
        password: regPass,
        type: regType,
        document: regDoc.replace(/\D/g, ''),
        whatsapp: regWhatsapp,
        uf: regUF,
        city: regCity
      };

      authService.saveUser(newUser);
      
      // V28: Notify user about manual validation
      setPendingApproval(true);
      setSuccess('Cadastro recebido! Enviamos uma notificação para o administrador (robertomorais.adv@gmail.com). Aguarde a liberação do acesso.');
      
      setTimeout(() => {
        setView('login');
      }, 6000);
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50"></div>

        <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row gap-12 p-6 items-center">
            
            {/* Branding Section */}
            <div className="flex-1 text-center lg:text-left space-y-6">
                <div className="inline-flex items-center gap-3 p-3 bg-gold-500/10 rounded-lg border border-gold-500/30 backdrop-blur-sm">
                    <Scale className="w-8 h-8 text-gold-400" />
                    <span className="text-gold-200 font-display font-bold tracking-widest text-lg">SWOT AUDITOR PRO</span>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-display text-white font-bold leading-tight">
                    Auditoria Estratégica
                </h1>
                
                <p className="text-slate-400 text-lg max-w-xl leading-relaxed font-serif">
                    A plataforma definitiva para consultoria jurídica, análise de editais e estruturação de projetos culturais e legislativos.
                    Utilize o poder da Inteligência Artificial Sênior para blindar seus projetos.
                </p>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-slate-500 font-bold tracking-widest uppercase mt-8">
                    <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gold-500" /> Compliance</div>
                    <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gold-500" /> Leis de Incentivo</div>
                    <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gold-500" /> Governança</div>
                </div>
            </div>

            {/* Auth Card */}
            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-hidden relative">
                {/* Decorative border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600"></div>

                <div className="p-8">
                    <div className="flex justify-between mb-8 border-b border-slate-700 pb-4">
                        <button 
                            onClick={() => setView('login')}
                            className={`flex-1 pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${view === 'login' ? 'text-gold-400 border-b-2 border-gold-400 -mb-4.5' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Acesso
                        </button>
                        <button 
                            onClick={() => setView('register')}
                            className={`flex-1 pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${view === 'register' ? 'text-gold-400 border-b-2 border-gold-400 -mb-4.5' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Cadastro
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-300 text-xs font-bold text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                         <div className={`mb-4 p-3 border rounded text-xs font-bold text-center flex flex-col items-center gap-2 ${pendingApproval ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300' : 'bg-green-900/20 border-green-900/50 text-green-300'}`}>
                             <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> 
                                {pendingApproval ? "CADASTRO EM ANÁLISE" : "SUCESSO"}
                             </div>
                             <span className="font-normal opacity-90">{success}</span>
                         </div>
                    )}

                    {view === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 uppercase font-bold mb-1">E-mail ou CPF/CNPJ</label>
                                <input 
                                    type="text" 
                                    value={loginIdentifier}
                                    onChange={(e) => setLoginIdentifier(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-gold-500 focus:outline-none transition-colors"
                                    placeholder="seu@email.com ou documento"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Senha</label>
                                <input 
                                    type="password" 
                                    value={loginPass}
                                    onChange={(e) => setLoginPass(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-gold-500 focus:outline-none transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full bg-gold-600 hover:bg-gold-500 text-slate-900 font-bold py-3 rounded shadow-lg flex items-center justify-center gap-2 transition-all mt-2"
                            >
                                <LogIn className="w-4 h-4" /> Entrar no Sistema
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-3">
                            {/* Type Selection */}
                            <div className="flex gap-2 mb-2">
                                <button type="button" onClick={() => setRegType('PF')} className={`flex-1 py-1.5 text-xs font-bold rounded border ${regType === 'PF' ? 'bg-slate-800 text-white border-gold-500' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>Pessoa Física</button>
                                <button type="button" onClick={() => setRegType('PJ')} className={`flex-1 py-1.5 text-xs font-bold rounded border ${regType === 'PJ' ? 'bg-slate-800 text-white border-gold-500' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>Pessoa Jurídica</button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">{regType === 'PF' ? 'Nome Completo' : 'Razão Social'}</label>
                                    <input 
                                        type="text" 
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-gold-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">{regType === 'PF' ? 'CPF' : 'CNPJ'}</label>
                                    <input 
                                        type="text" 
                                        value={regDoc}
                                        onChange={(e) => setRegDoc(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-gold-500 focus:outline-none"
                                        placeholder={regType === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">UF (Estado)</label>
                                    <select 
                                        value={regUF} 
                                        onChange={(e) => setRegUF(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-gold-500 focus:outline-none appearance-none"
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                                        Município 
                                        {isLoadingCities && <Loader2 className="w-3 h-3 inline ml-1 animate-spin text-gold-500" />}
                                    </label>
                                    <select 
                                        value={regCity} 
                                        onChange={(e) => setRegCity(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-gold-500 focus:outline-none appearance-none disabled:opacity-50"
                                        disabled={!regUF || isLoadingCities}
                                        required
                                    >
                                        <option value="">
                                            {isLoadingCities ? "Carregando..." : (regUF ? "Selecione a cidade" : "Selecione UF primeiro")}
                                        </option>
                                        {citiesList.map(city => <option key={city} value={city}>{city}</option>)}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">E-mail</label>
                                    <input 
                                        type="email" 
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-gold-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">WhatsApp</label>
                                    <input 
                                        type="text" 
                                        value={regWhatsapp}
                                        onChange={(e) => setRegWhatsapp(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-gold-500 focus:outline-none"
                                        placeholder="(00) 00000-0000"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Senha</label>
                                    <input 
                                        type="password" 
                                        value={regPass}
                                        onChange={(e) => setRegPass(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-gold-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded shadow-lg flex items-center justify-center gap-2 transition-all mt-4"
                            >
                                <UserPlus className="w-4 h-4" /> Criar Conta Gratuita
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-slate-600">
                &copy; {new Date().getFullYear()} SWOT Auditoria. Todos os direitos reservados. V28.0 (Deep Restoration).
            </div>
        </div>
    </div>
  );
};
