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
const Login = lazy(() => import('./pages/Auth/Login'));
const Cadastrar = lazy(() => import('./pages/Auth/Cadastrar'));

// Páginas de Autenticação Usuário (Colaborador)
const LoginUser = lazy(() => import('./pages/PagesUser/LoginUser'));
const CadastroUser = lazy(() => import('./pages/PagesUser/CadastroUser'));

// Páginas do Dashboard (Admin)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CadastrarFuncionario = lazy(() => import('./pages/CadastrarFuncionario'));
const Funcionarios = lazy(() => import('./pages/Funcionarios'));
const Departamentos = lazy(() => import('./pages/Departamentos'));
const Avaliar = lazy(() => import('./pages/Avaliar'));
const Historicos = lazy(() => import('./pages/Historicos'));
const Permissoes = lazy(() => import('./pages/Permissoes'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const MinhaConta = lazy(() => import('./pages/MinhaConta'));
const Relatorios = lazy(() => import('./pages/Relatorios'));
const Ajuda = lazy(() => import('./pages/Ajuda'));

// Páginas do Usuário
const UserHome = lazy(() => import('./pages/PagesUser/Home'));
const MinhasAvaliacoes = lazy(() => import('./pages/PagesUser/MinhasAvaliacoes'));
const Status = lazy(() => import('./pages/PagesUser/Status'));
const Profile = lazy(() => import('./pages/PagesUser/Profile'));
const Settings = lazy(() => import('./pages/PagesUser/Settings'));

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Redireciona a raiz para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Rotas de Autenticação Admin */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastrar" element={<Cadastrar />} />
          
          {/* Rotas de Autenticação Usuário (Colaborador) */}
          <Route path="/user/login" element={<LoginUser />} />
          <Route path="/user/cadastro" element={<CadastroUser />} />

          {/* Rotas do Dashboard (Admin) - URLs na raiz */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cadastrar-funcionario" element={<CadastrarFuncionario />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/departamentos" element={<Departamentos />} />
            <Route path="/avaliar" element={<Avaliar />} />
            <Route path="/historicos" element={<Historicos />} />
            <Route path="/permissoes" element={<Permissoes />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/minha-conta" element={<MinhaConta />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/ajuda" element={<Ajuda />} />
          </Route>
          
          {/* Rotas do Usuário - URLs na raiz e prefixadas */}
          <Route element={<UserLayout />}>
            <Route path="/user/home" element={<UserHome />} />
            <Route path="/user" element={<Navigate to="/user/home" />} />
            <Route path="/minhas-avaliacoes" element={<MinhasAvaliacoes />} />
            <Route path="/status" element={<Status />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}
