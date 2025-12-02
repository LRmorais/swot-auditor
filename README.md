
# SWOT AUDITOR PRO V34.0

Sistema profissional de auditoria SWOT com integração Firebase e Google Gemini AI.

## 🚀 Deploy no GitHub Pages

### Pré-requisitos
- Node.js 18+ e npm instalados
- Conta no GitHub
- Projeto Firebase configurado (opcional para modo offline)
- Chave API do Google Gemini

### Passo 1: Configurar o Repositório no GitHub

1. Crie um novo repositório no GitHub (ex: `swot-auditor-pro-v34.0`)
2. **IMPORTANTE**: No `vite.config.ts`, atualize a linha `base` com o nome do seu repositório:
   ```typescript
   base: mode === 'production' ? '/seu-repositorio-aqui/' : '/',
   ```

### Passo 2: Configurar Variáveis de Ambiente no GitHub

1. Vá para o seu repositório no GitHub
2. Acesse **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Adicione os seguintes secrets:

   - `GEMINI_API_KEY` - Sua chave API do Google Gemini
   - `REACT_APP_FIREBASE_API_KEY` - Firebase API Key
   - `REACT_APP_FIREBASE_AUTH_DOMAIN` - Firebase Auth Domain
   - `REACT_APP_FIREBASE_PROJECT_ID` - Firebase Project ID
   - `REACT_APP_FIREBASE_STORAGE_BUCKET` - Firebase Storage Bucket
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` - Firebase Messaging Sender ID
   - `REACT_APP_FIREBASE_APP_ID` - Firebase App ID

### Passo 3: Habilitar GitHub Pages

1. Vá para **Settings** > **Pages** no seu repositório
2. Em **Source**, selecione **GitHub Actions**
3. Salve as configurações

### Passo 4: Fazer Deploy

#### Opção A: Deploy Automático (Recomendado)

O projeto está configurado com GitHub Actions. Basta fazer push para a branch `main`:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
git push -u origin main
```

O workflow será executado automaticamente e o site estará disponível em:
`https://seu-usuario.github.io/seu-repositorio/`

#### Opção B: Deploy Manual

```bash
# Instalar dependências
npm install

# Build do projeto
npm run build

# Deploy manual (requer gh-pages instalado)
npm run deploy
```

### Passo 5: Verificar o Deploy

1. Vá para a aba **Actions** no seu repositório
2. Verifique se o workflow "Deploy to GitHub Pages" foi executado com sucesso
3. Acesse o site no URL: `https://seu-usuario.github.io/seu-repositorio/`

---

## 🔧 Desenvolvimento Local

### Instalação

```bash
# Instalar dependências
npm install

# Criar arquivo .env na raiz do projeto
cp .env.example .env
```

### Configurar .env

Edite o arquivo `.env` com suas credenciais:

```env
GEMINI_API_KEY=sua_chave_aqui
REACT_APP_FIREBASE_API_KEY=sua_chave_aqui
REACT_APP_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=seu-projeto-id
REACT_APP_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Executar Localmente

```bash
npm run dev
```

Acesse: `http://localhost:3000`

---

## 📦 Configuração do Firebase (Opcional)

O projeto funciona em modo offline se as credenciais Firebase não forem fornecidas. Para habilitar funcionalidades completas:

### 1. Criar Projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um novo projeto
3. Ative **Authentication** (Email/Password)
4. Ative **Firestore Database**
5. Ative **Storage**

### 2. Regras de Segurança

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /system_configs/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
    match /projects/{projectId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth.uid == resource.data.userId;
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /inputs/{userId}/{projectId}/{fileName} {
      allow create: if request.auth.uid == userId;
      allow read: if request.auth.uid == userId;
      allow update, delete: if false;
    }
  }
}
```

### 3. Inicializar CMS de Prompts

No Firestore Console:
1. Crie coleção: `system_configs`
2. Crie documento: `current_prompt`
3. Adicione campos: `auditor`, `engineer`, `chatbot` (Strings)

---

## 🔑 Obter Chave API do Google Gemini

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave e adicione ao `.env` ou GitHub Secrets

---

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build local
- `npm run deploy` - Deploy manual para GitHub Pages (requer gh-pages)

---

## 🛠️ Tecnologias

- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **Firebase** - Backend (Auth, Firestore, Storage)
- **Google Gemini AI** - IA para análise SWOT
- **Lucide React** - Ícones
- **html2pdf.js** - Geração de PDFs

---

## 📄 Licença

Este projeto é privado e proprietário.
