# 🚀 Guia Rápido de Deploy - GitHub Pages

## Configuração Inicial (Uma vez)

### 1. Atualizar o Base Path

Edite o arquivo `vite.config.ts` na linha que contém `base:`:

```typescript
base: mode === 'production' ? '/nome-do-seu-repositorio/' : '/',
```

**Substitua** `nome-do-seu-repositorio` pelo nome real do seu repositório no GitHub.

### 2. Instalar Dependências

```bash
npm install
```

### 3. Criar Repositório no GitHub

1. Vá para https://github.com/new
2. Crie um novo repositório (ex: `swot-auditor-pro`)
3. **NÃO** inicialize com README (já existe)

### 4. Adicionar Secrets no GitHub

Vá para: **Repositório → Settings → Secrets and variables → Actions → New repository secret**

Adicione cada um desses secrets:

| Nome do Secret | Onde Encontrar |
|----------------|----------------|
| `GEMINI_API_KEY` | https://makersuite.google.com/app/apikey |
| `REACT_APP_FIREBASE_API_KEY` | Firebase Console → Project Settings → General |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase Console → Project Settings → General |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase Console → Project Settings → General |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase Console → Project Settings → General |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console → Project Settings → General |
| `REACT_APP_FIREBASE_APP_ID` | Firebase Console → Project Settings → General |

> 💡 **Dica**: Se não tiver Firebase, o app funcionará em modo offline (dados salvos no navegador).

### 5. Habilitar GitHub Pages

Vá para: **Repositório → Settings → Pages**

Em **Source**, selecione: **GitHub Actions**

## Deploy

### Primeira Vez

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Deploy inicial para GitHub Pages"

# Configurar branch principal
git branch -M main

# Conectar com repositório remoto (substitua seu-usuario e seu-repo)
git remote add origin https://github.com/seu-usuario/seu-repo.git

# Fazer push
git push -u origin main
```

### Deploys Seguintes

```bash
# Adicionar mudanças
git add .

# Fazer commit
git commit -m "Descrição das mudanças"

# Fazer push
git push
```

## Verificar Deploy

1. Vá para: **Repositório → Actions**
2. Aguarde o workflow "Deploy to GitHub Pages" completar (círculo verde ✅)
3. Acesse seu site em:
   ```
   https://seu-usuario.github.io/seu-repositorio/
   ```

## Resolução de Problemas

### ❌ Erro: "Failed to load module"

**Causa**: Base path incorreto no `vite.config.ts`

**Solução**: Confirme que o nome no `base:` corresponde ao nome do repositório.

### ❌ Página em branco após deploy

**Causa**: Assets não carregados devido ao base path

**Solução**: 
1. Verifique o console do navegador (F12)
2. Corrija o `base:` no `vite.config.ts`
3. Faça commit e push novamente

### ❌ Secrets não funcionam

**Causa**: Secrets não configurados ou com nome errado

**Solução**:
1. Verifique os nomes dos secrets (são case-sensitive)
2. Confirme que foram adicionados em **Actions**, não em **Codespaces** ou **Dependabot**

### ❌ Workflow não executa

**Causa**: GitHub Pages não habilitado com "GitHub Actions"

**Solução**:
1. Vá em Settings → Pages
2. Em Source, selecione "GitHub Actions"
3. Faça um novo push

## Deploy Manual (Alternativo)

Se preferir deploy manual sem GitHub Actions:

```bash
# Instalar gh-pages se ainda não instalou
npm install

# Fazer deploy
npm run deploy
```

Depois vá em **Settings → Pages** e selecione **Source: gh-pages branch**

## Comandos Úteis

```bash
# Testar localmente antes do deploy
npm run dev

# Testar build localmente
npm run build
npm run preview

# Ver logs do git
git log --oneline

# Ver status do git
git status
```

## 📧 Suporte

Se encontrar problemas, verifique:
1. ✅ Base path está correto no `vite.config.ts`
2. ✅ Todos os secrets foram adicionados
3. ✅ GitHub Pages está habilitado com "GitHub Actions"
4. ✅ Workflow completou sem erros (aba Actions)

---

**Pronto!** 🎉 Seu site estará no ar após o primeiro push.

