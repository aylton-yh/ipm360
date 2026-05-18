git # IPM360° - Sistema Integrado de Gestão de Desempenho

![IPM360 Logo](frontend/src/assets/images/LogoSistema.jpeg)

**IPM360** é um ecossistema abrangente para monitorização, avaliação e otimização do capital humano, desenhado especificamente para o Instituto Politécnico Maiombe-3050. O sistema foca-se em **Alta Performance**, oferecendo uma interface de cockpit administrativo de alta densidade e ferramentas avançadas de análise de indicadores (KPIs).

## 🚀 Funcionalidades Principais

### 📊 Cockpit Administrativo (Dashboard)
- **Visualização de Alta Densidade**: Dashboard compactado com indicadores de performance, metas institucionais e agenda integrada.
- **Gráficos Dinâmicos**: Análise em tempo real de tendências, distribuição de género e status de tarefas.

### 🎯 Gestão de Desempenho (360°)
- **Avaliações Multi-critério**: Interface miniaturizada para avaliações técnicas e comportamentais com suporte a 3 colunas de indicadores.
- **Histórico Completo**: Registo detalhado de todos os eventos com resolução automática de departamentos e cargos.
- **Auto-avaliação**: Portal dedicado para funcionários acompanharem o seu progresso e fornecerem feedback.

### 🏢 Gestão Organizacional
- **Controle de Presença**: Grelha moderna (4 colunas) para monitorização rápida de assiduidade.
- **Promoções e Transferências**: Fluxo simplificado para progressão de carreira e mudanças de departamento.
- **Gestão de Departamentos**: Visão estruturada de toda a hierarquia institucional.

### 💬 Comunicação e Relatórios
- **Chat Colaborativo**: Interface estilo "WhatsApp" para comunicação interna rápida entre a equipa.
- **Relatórios Gerenciais**: Exportação de dados para PDF, Excel e Word com resolução dinâmica de dados históricos.
- **Sistema de Notificações**: Alertas em tempo real para feedback de funcionários e eventos críticos.

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: React.js 18 + Vite (Performance ultra-rápida)
- **Estilização**: Vanilla CSS (Arquitetura Professional Compact & Glassmorphism)
- **Animações**: Framer Motion & CSS Keyframes
- **Gestão de Documentos**: jsPDF, ExcelJS e Docx (Relatórios multifuncionais)
- **Ícones**: Font Awesome (React Icons) & Lucide

### Backend
- **Ambiente**: Node.js
- **Framework**: Express.js (Arquitetura RESTful unificada)
- **Base de Dados**: MySQL (Integrado com `mysql2`)
- **Comunicação em Tempo Real**: WebSockets (`ws`) para o Chat Colaborativo
- **Segurança**: JWT (JSON Web Tokens) & BCryptJS (Hashing de senhas)
- **Logs & Middleware**: Morgan, CORS e Dotenv

## 🎨 Filosofia de Design: "Professional Compact"

O IPM360 utiliza o conceito de **Interface de Cockpit**, priorizando a densidade de informação sobre o espaço em branco. Isso permite que gestores visualizem KPIs críticos sem a necessidade de scrolling excessivo, utilizando uma estética premium ("luxury gadget") com micro-animations e paletas de cores harmoniosas (HSL tailor-made).

## 📥 Instalação e Execução

### 1. Banco de Dados (MySQL)
1. Certifique-se de ter o **MySQL Server** instalado e rodando.
2. Crie o banco de dados:
   ```sql
   CREATE DATABASE IPM360;
   ```
3. Importe o esquema inicial:
   - O arquivo está em `database/ipm360.sql`.
   - Você pode usar o comando: `mysql -u root -p IPM360 < database/ipm360.sql`.

### 2. Backend (Node.js)
1. Navegue até a pasta do servidor:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env` (verifique se os dados do MySQL em `backend/.env` estão corretos).
4. Inicie o servidor:
   ```bash
   npm start
   ```
   *O servidor rodará em `http://localhost:8000`.*

### 3. Frontend (React)
1. Navegue até a pasta da interface:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```
   *Acesse o sistema em `http://localhost:5173`.*

## 🔑 Como Acessar o Sistema

1. **Acesso Local**: Abra o navegador em `http://localhost:5173`.
2. **Cadastro**: Se for o primeiro acesso, utilize a tela de **Registo** para criar uma conta de Administrador ou Funcionário.
3. **Credenciais**: O sistema utiliza autenticação JWT. Certifique-se de que o backend está rodando para que o login e as funcionalidades dinâmicas funcionem corretamente.

---
*Projecto de fim do curso 2025/2026 - Desenvolvido para excelência na gestão educacional.*
