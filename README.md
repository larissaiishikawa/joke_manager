# 🎭 O Piadista - Sistema Completo de Gerenciamento de Piadas

Sistema fullstack completo para gerenciamento de piadas com backend Node.js/Express e frontend React.js, seguindo arquitetura SPA com autenticação JWT.

## 📋 Visão Geral do Projeto

**O Piadista** é uma aplicação web completa que permite aos usuários:
- Fazer login com autenticação segura
- Buscar piadas com filtros avançados 
- Adicionar novas piadas ao sistema
- Visualizar piadas organizadas por categorias

## 🏗️ Arquitetura do Sistema

### Backend (Node.js + Express)
- **API RESTful** com autenticação JWT
- **MongoDB** para persistência de dados
- **Redis** para cache (opcional)
- **Segurança** com helmet, cors, rate limiting
- **Logging** profissional com Winston

### Frontend (React.js + TypeScript)
- **SPA** (Single Page Application)
- **Autenticação** baseada em sessão (em memória)
- **Comunicação HTTP** exclusiva via Axios
- **Interface responsiva** com tema amarelo
- **Validação** client-side em todos os formulários

## 🎯 Funcionalidades Implementadas

### 🔐 Sistema de Autenticação
- ✅ **Login seguro** com JWT
- ✅ **Logout** com limpeza de sessão
- ✅ **Verificação de token** automática
- ✅ **Proteção de rotas** no frontend
- ✅ **Redirecionamento** automático em 401

### 🔍 Sistema de Busca Avançada
- ✅ **Filtro por categoria**: comedy, puns, dad-jokes, programming, dark-humor, one-liner
- ✅ **Busca por palavra-chave** no título e conteúdo
- ✅ **Filtro por autor** com busca parcial
- ✅ **Paginação** inteligente dos resultados
- ✅ **Cache** dos resultados para performance

### ➕ Sistema de Inserção
- ✅ **Formulário completo** com validação
- ✅ **Campos obrigatórios**: título, conteúdo, categoria, autor
- ✅ **Validação em tempo real** de caracteres
- ✅ **Prevenção de duplicatas** no backend
- ✅ **Feedback visual** de sucesso/erro

### 🎨 Interface de Usuário
- ✅ **Design responsivo** para mobile e desktop
- ✅ **Tema amarelo** personalizado conforme especificação
- ✅ **Cards modernos** para exibição de piadas
- ✅ **Loading states** em todas as operações
- ✅ **Mensagens de erro** claras e úteis

## 🛡️ Segurança Implementada

### Backend
- ✅ **JWT** com secret seguro
- ✅ **Bcrypt** para hash de senhas (12 rounds)
- ✅ **Rate limiting** em rotas sensíveis
- ✅ **Sanitização** de entrada com XSS protection
- ✅ **Helmet** para headers de segurança
- ✅ **CORS** configurado adequadamente
- ✅ **Proteção contra NoSQL injection**

### Frontend
- ✅ **Token em memória** (não em localStorage)
- ✅ **Interceptors HTTP** para tratamento automático
- ✅ **Validação client-side** em todos os formulários
- ✅ **Sanitização** de dados antes do envio

## 📁 Estrutura do Projeto

```
joke_manager/
├── backend/                    # API Node.js
│   ├── src/
│   │   ├── config/            # Configurações (DB, Cache, Security)
│   │   ├── models/            # Modelos Mongoose (User, Joke)
│   │   └── routes/            # Rotas da API (auth, jokes)
│   ├── server.js              # Servidor principal
│   ├── package.json           # Dependências backend
│   ├── Dockerfile             # Container Docker
│   └── docker-compose.yml     # Orquestração
│
├── frontend/                   # SPA React.js
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── Login/         # Tela de login
│   │   │   ├── Dashboard/     # Dashboard principal
│   │   │   ├── Search/        # Busca e resultados
│   │   │   ├── JokeForm/      # Formulário de adição
│   │   │   ├── JokeCard/      # Card individual
│   │   │   └── Layout/        # Header e rotas protegidas
│   │   ├── services/          # API calls
│   │   ├── utils/             # Utilitários (auth)
│   │   └── App.tsx            # Configuração de rotas
│   └── package.json           # Dependências frontend
│
└── README.md                   # Este arquivo
```

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+
- MongoDB (local ou Atlas)
- Redis (opcional, para cache)

### 1. Configuração do Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variáveis no .env
npm start
```

### 2. Configuração do Frontend
```bash
cd frontend
npm install
npm start
```

### 3. Usando Docker (Recomendado)
```bash
cd backend
docker-compose up -d
```

## 🔧 Configuração de Ambiente

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/joke_manager
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRES_IN=1h
REDIS_HOST=localhost
REDIS_PORT=6379
BCRYPT_SALT_ROUNDS=12
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3000/api
```

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/logout` - Logout de usuário
- `GET /api/auth/verify` - Verificação de token
- `POST /api/auth/register` - Registro de usuário

### Piadas
- `GET /api/jokes/search` - Busca com filtros
- `POST /api/jokes` - Criar nova piada (autenticado)
- `GET /api/jokes/:id` - Obter piada específica
- `GET /api/jokes` - Listar todas as piadas

### Sistema
- `GET /api/health` - Status da API

## 🎮 Como Usar

### 1. Fazer Login
Use uma das contas de teste pré-criadas:
- **admin@test.com** / admin123
- **user@test.com** / user123
- **jokemaster@test.com** / jokes123

### 2. Buscar Piadas
- Acesse a aba "🔍 Buscar Piadas"
- Use os filtros disponíveis:
  - **Palavra-chave**: busca no título e conteúdo
  - **Categoria**: filtra por tipo de piada
  - **Autor**: busca por nome do autor
- Navegue pelos resultados com paginação

### 3. Adicionar Piadas
- Acesse a aba "➕ Adicionar Piada"
- Preencha todos os campos obrigatórios:
  - **Título** (máx. 200 caracteres)
  - **Conteúdo** (máx. 1000 caracteres)
  - **Categoria** (selecione uma opção)
  - **Autor** (máx. 100 caracteres)
- Clique em "Adicionar Piada"

## 📊 Dados de Teste

O sistema é pré-populado com:
- **3 usuários de teste** com diferentes níveis
- **6 piadas de exemplo** em várias categorias
- **Índices otimizados** para performance

## 🔄 Status do Projeto

### ✅ Funcionalidades Completadas
- [x] Sistema de autenticação JWT completo
- [x] CRUD completo de piadas
- [x] Busca avançada com múltiplos filtros
- [x] Interface responsiva com tema personalizado
- [x] Validação completa (client e server-side)
- [x] Tratamento de erros robusto
- [x] Cache Redis para performance
- [x] Logging profissional
- [x] Segurança multicamadas
- [x] Containerização Docker
- [x] Documentação completa

### 🚀 Pronto para Deploy
- [x] Variáveis de ambiente configuradas
- [x] Docker containers preparados
- [x] Banco de dados configurado
- [x] Frontend otimizado para produção

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** 18+ (Runtime JavaScript)
- **Express.js** (Framework web)
- **MongoDB** + **Mongoose** (Banco de dados)
- **Redis** (Cache)
- **JWT** (Autenticação)
- **Bcrypt** (Hash de senhas)
- **Winston** (Logging)
- **Helmet** (Segurança)

### Frontend
- **React** 18 + **TypeScript** (Framework)
- **React Router DOM** (Roteamento)
- **Axios** (Cliente HTTP)
- **CSS3** (Estilização)

### DevOps
- **Docker** + **Docker Compose** (Containerização)
- **Git** (Versionamento)
- **ESLint** (Qualidade de código)

## 📈 Performance e Otimizações

- ✅ **Cache Redis** para consultas frequentes
- ✅ **Paginação** para grandes volumes de dados
- ✅ **Índices MongoDB** otimizados
- ✅ **Rate limiting** para proteção
- ✅ **Compressão** de respostas HTTP
- ✅ **Lazy loading** de componentes
- ✅ **Bundle otimizado** para produção

## 🎯 Requisitos Atendidos

### Técnicos
✅ **Framework**: React.js com TypeScript  
✅ **Arquitetura**: SPA (Single Page Application)  
✅ **Comunicação**: HTTP requests apenas  
✅ **Autenticação**: Sessão baseada em JWT em memória  
✅ **Estrutura**: Conforme especificação exata  

### Funcionais
✅ **Login System**: Validação, sessão, logout, proteção  
✅ **Search Functionality**: Filtros múltiplos, paginação, cache  
✅ **Insertion Functionality**: Formulário completo, validação  

### Não-Funcionais
✅ **Segurança**: Múltiplas camadas de proteção  
✅ **Performance**: Cache, otimizações, índices  
✅ **UX/UI**: Design responsivo, loading states  
✅ **Manutenibilidade**: Código limpo, documentado  

## 📝 Próximos Passos para Deploy

1. **Configurar ambiente de produção**
   - Configurar MongoDB Atlas
   - Configurar Redis Cloud
   - Definir JWT_SECRET seguro

2. **Deploy Backend**
   - Heroku, Railway, ou Render
   - Configurar variáveis de ambiente
   - SSL/HTTPS obrigatório

3. **Deploy Frontend**
   - Vercel, Netlify, ou similar
   - Build otimizado para produção
   - Configurar CORS adequadamente

4. **Monitoramento**
   - Logs centralizados
   - Métricas de performance
   - Alertas de erro

---

**Desenvolvido com ❤️ seguindo as melhores práticas de desenvolvimento fullstack**

**Status**: ✅ **PRONTO PARA PRODUÇÃO**
