/**
 * Configuração centralizada de todas as rotas do sistema IPM360°
 */

// Páginas de Autenticação
export const AUTH_ROUTES = {
  LOGIN: '/login',
  CADASTRAR: '/cadastrar',
};

// Páginas do Dashboard (Admin) - URLs Raiz
export const DASHBOARD_ROUTES = {
  HOME: '/dashboard',
  CADASTRAR_FUNCIONARIO: '/cadastrar-funcionario',
  FUNCIONARIOS: '/funcionarios',
  DEPARTAMENTOS: '/departamentos',
  AVALIAR: '/avaliar',
  HISTORICOS: '/historicos',
  PERMISSOES: '/permissoes',
  CONFIGURACOES: '/configuracoes',
  MINHA_CONTA: '/minha-conta',
  RELATORIOS: '/relatorios',
  AJUDA: '/ajuda',
};

// Páginas do Usuário - URLs Raiz
export const USER_ROUTES = {
  HOME: '/user',
  MINHAS_AVALIACOES: '/minhas-avaliacoes',
  STATUS: '/status',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

export default {
  AUTH_ROUTES,
  DASHBOARD_ROUTES,
  USER_ROUTES,
};
