
import { User } from '../types';

const USERS_KEY = 'swot_users_db';
const SESSION_KEY = 'swot_current_session';
const ADMIN_EMAIL = 'netmorais1972@gmail.com'; // Master Admin Email
const MASTER_PASS = 'tq3v2p6m'; // Master Admin Password

// Brazilian States
export const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Offline Fallback Database (Expanded for robustness when API fails)
export const CITIES_BY_UF: Record<string, string[]> = {
  'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Brasileia', 'Senador Guiomard', 'Plácido de Castro', 'Xapuri', 'Mâncio Lima'],
  'AL': ['Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'União dos Palmares', 'Penedo', 'São Miguel dos Campos', 'Campo Alegre', 'Coruripe', 'Delmiro Gouveia'],
  'AP': ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão', 'Porto Grande', 'Tartarugalzinho', 'Pedra Branca do Amapari'],
  'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tabatinga', 'Maués', 'Tefé', 'Manicoré', 'Humaitá'],
  'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Itabuna', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas', 'Barreiras', 'Alagoinhas'],
  'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá', 'Pacatuba'],
  'DF': ['Brasília'],
  'ES': ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus', 'Guarapari', 'Colatina', 'Aracruz'],
  'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Águas Lindas de Goiás', 'Luziânia', 'Valparaíso de Goiás', 'Trindade', 'Formosa', 'Novo Gama'],
  'MA': ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Paço do Lumiar', 'Codó', 'Açailândia', 'Bacabal', 'Balsas'],
  'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Cáceres', 'Sorriso', 'Lucas do Rio Verde', 'Primavera do Leste', 'Barra do Garças'],
  'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Sidrolândia', 'Naviraí', 'Nova Andradina', 'Aquidauana', 'Maracaju'],
  'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Sete Lagoas', 'Divinópolis'],
  'PA': ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal', 'Abaetetuba', 'Cametá', 'Marituba', 'Bragança'],
  'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cabedelo', 'Cajazeiras', 'Guarabira', 'Sapé'],
  'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá'],
  'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão'],
  'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Barras', 'Campo Maior', 'União', 'Altos', 'Esperantina'],
  'RJ': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'Campos dos Goytacazes', 'São João de Meriti', 'Petrópolis', 'Volta Redonda'],
  'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim', 'Caicó', 'Assu', 'Currais Novos', 'São José de Mipibu'],
  'RS': ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande'],
  'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Rolim de Moura', 'Jaru', 'Guajará-Mirim', 'Machadinho d\'Oeste'],
  'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Pacaraima', 'Cantá', 'Mucajaí'],
  'SC': ['Joinville', 'Florianópolis', 'Blumenau', 'São José', 'Chapecó', 'Itajaí', 'Criciúma', 'Jaraguá do Sul', 'Palhoça', 'Lages'],
  'SP': ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Ribeirão Preto', 'São José dos Campos', 'Sorocaba', 'Mauá', 'Santos', 'Diadema'],
  'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão', 'Estância', 'Tobias Barreto', 'Simão Dias'],
  'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Colinas do Tocantins', 'Araguatins']
};

// Async function to fetch ALL cities from IBGE API
export const fetchCitiesForState = async (uf: string): Promise<string[]> => {
    if (!uf) return [];
    
    // Special case for DF
    if (uf === 'DF') return ['Brasília'];

    try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
        if (!response.ok) throw new Error('Falha na comunicação com IBGE');
        
        const data = await response.json();
        return data.map((city: any) => city.nome).sort((a: string, b: string) => a.localeCompare(b));
    } catch (error) {
        console.warn(`[Offline Mode] Usando banco de dados local para ${uf}. Motivo:`, error);
        return CITIES_BY_UF[uf]?.sort() || ['Capital e Região (Offline)'];
    }
};

// Internal Helper: Simulate Sending Email
const sendAdminNotification = (newUser: User) => {
    const emailBody = `
    NOVO USUÁRIO AGUARDANDO APROVAÇÃO
    -----------------------------------
    Nome: ${newUser.name}
    Tipo: ${newUser.type}
    Doc: ${newUser.document}
    Email: ${newUser.email}
    WhatsApp: ${newUser.whatsapp}
    Local: ${newUser.city}/${newUser.uf}
    Data: ${new Date().toLocaleString()}
    
    Ação: Acesse o Painel Admin para liberar o acesso.
    `;
    
    console.group("📧 SIMULAÇÃO DE ENVIO DE E-MAIL (TRIGGER)");
    console.log(`Para: ${ADMIN_EMAIL}`);
    console.log("Assunto: [SWOT Admin] Novo Cadastro Pendente");
    console.log(emailBody);
    console.groupEnd();
};

export const formatDocument = (value: string) => {
  return value.replace(/\D/g, '');
};

export const validateCPF = (cpf: string) => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  return true;
};

export const validateCNPJ = (cnpj: string) => {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14) return false;
  return true;
};

export const authService = {
  getUsers: (): User[] => {
    try {
      const users = localStorage.getItem(USERS_KEY);
      // SAFETY: Handle invalid JSON or null
      if (!users) return [];
      const parsed = JSON.parse(users);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Auth DB Corrupted, resetting.", e);
      localStorage.removeItem(USERS_KEY);
      return [];
    }
  },

  saveUser: (user: User) => {
    const users = authService.getUsers();
    
    if (users.find(u => u.email === user.email)) {
      throw new Error('E-mail já cadastrado.');
    }
    
    if (users.find(u => u.document === user.document)) {
      throw new Error('Documento (CPF/CNPJ) já cadastrado.');
    }
    
    const isAdmin = user.email === ADMIN_EMAIL;
    
    const protectedUser = {
        ...user,
        isApproved: isAdmin, 
        isAdmin: isAdmin,
        createdAt: Date.now()
    };
    
    users.push(protectedUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    if (!protectedUser.isApproved) {
        sendAdminNotification(protectedUser);
    }
    
    return protectedUser;
  },

  approveUser: (userId: string) => {
      const users = authService.getUsers();
      const updatedUsers = users.map(u => 
          u.id === userId ? { ...u, isApproved: true } : u
      );
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  },

  login: (identifier: string, password: string): User => {
    const users = authService.getUsers();
    
    // === MASTER OVERRIDE LOGIC ===
    if (identifier === ADMIN_EMAIL && password === MASTER_PASS) {
        let masterUser = users.find(u => u.email === ADMIN_EMAIL);
        
        if (!masterUser) {
            masterUser = {
                id: 'MASTER-ADMIN-ID',
                name: 'Administrador Master',
                email: ADMIN_EMAIL,
                password: MASTER_PASS,
                type: 'PF',
                document: '00000000000',
                whatsapp: '00000000000',
                uf: 'DF',
                city: 'Brasília',
                isAdmin: true,
                isApproved: true,
                createdAt: Date.now()
            };
            users.push(masterUser);
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        } else {
            if (!masterUser.isAdmin || !masterUser.isApproved) {
                masterUser.isAdmin = true;
                masterUser.isApproved = true;
                const updatedUsers = users.map(u => u.id === masterUser?.id ? masterUser! : u);
                localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
            }
        }
        
        localStorage.setItem(SESSION_KEY, JSON.stringify(masterUser));
        return masterUser;
    }
    // === END MASTER OVERRIDE ===

    const cleanDoc = identifier.replace(/\D/g, '');
    
    let user = users.find(u => 
        (u.email === identifier || u.document === cleanDoc) && 
        u.password === password
    );
    
    if (!user) {
      throw new Error('Credenciais inválidas.');
    }

    if (!user.isApproved) {
        throw new Error('Cadastro em análise. Aguarde a liberação pelo administrador (Notificação enviada).');
    }
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  }
};
