import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'
import UserLayout from './layouts/UserLayout'

// Loading Component
const PageLoader = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
    <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Páginas de Autenticação Admin
const LandingPage = lazy(() => import('./pages/PagesAdmin/LandingPage'));
const Login = lazy(() => import('./pages/PagesAdmin/Auth/Login'));

// Páginas do Dashboard (Admin)
const Dashboard = lazy(() => import('./pages/PagesAdmin/Dashboard'));
const CadastrarFuncionario = lazy(() => import('./pages/PagesAdmin/CadastrarFuncionario'));
const Funcionarios = lazy(() => import('./pages/PagesAdmin/Funcionarios'));
const Departamentos = lazy(() => import('./pages/PagesAdmin/Departamentos'));
const Avaliar = lazy(() => import('./pages/PagesAdmin/Avaliar'));
const Historicos = lazy(() => import('./pages/PagesAdmin/Historicos'));
const Promocoes = lazy(() => import('./pages/PagesAdmin/Promocoes'));
const Permissoes = lazy(() => import('./pages/PagesAdmin/Permissoes'));
const Configuracoes = lazy(() => import('./pages/PagesAdmin/Configuracoes'));
const MinhaConta = lazy(() => import('./pages/PagesAdmin/MinhaConta'));
const Relatorios = lazy(() => import('./pages/PagesAdmin/Relatorios'));
const Ajuda = lazy(() => import('./pages/PagesAdmin/Ajuda'));
const ChatGeral = lazy(() => import('./pages/ChatGeral'));

// Páginas do Usuário
const UserHome = lazy(() => import('./pages/PagesUser/Home'));
const MinhasAvaliacoes = lazy(() => import('./pages/PagesUser/MinhasAvaliacoes'));
const Status = lazy(() => import('./pages/PagesUser/Status'));
const Profile = lazy(() => import('./pages/PagesUser/Profile'));
const Settings = lazy(() => import('./pages/PagesUser/Settings'));
const HistoricoUser = lazy(() => import('./pages/PagesUser/Historico'));

// Context
import { EmployeeProvider } from './context/EmployeeContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <EmployeeProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Rotas de Autenticação Admin */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />

                {/* Rotas do Dashboard (Admin) - URLs na raiz */}
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/cadastrar-funcionario" element={<CadastrarFuncionario />} />
                  <Route path="/funcionarios" element={<Funcionarios />} />
                  <Route path="/departamentos" element={<Departamentos />} />
                  <Route path="/avaliar" element={<Avaliar />} />
                  <Route path="/historicos" element={<Historicos />} />
                  <Route path="/promocoes" element={<Promocoes />} />
                  <Route path="/permissoes" element={<Permissoes />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/minha-conta" element={<MinhaConta />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/ajuda" element={<Ajuda />} />
                  <Route path="/chat-geral" element={<ChatGeral />} />
                </Route>

                {/* Rotas do Usuário - URLs na raiz e prefixadas */}
                <Route element={<UserLayout />}>
                  <Route path="/user/home" element={<UserHome />} />
                  <Route path="/minhas-avaliacoes" element={<MinhasAvaliacoes />} />
                  <Route path="/status" element={<Status />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/historico" element={<HistoricoUser />} />
                  <Route path="/user/chat-geral" element={<ChatGeral />} />
                </Route>
              </Routes>
            </Suspense>
          </EmployeeProvider>
        </ChatProvider>
      </AuthProvider>
    </Router>
  )
}
