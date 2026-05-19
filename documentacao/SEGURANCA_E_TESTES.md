# Documentação Oficial: Segurança da Informação e Plano de Testes do Sistema IPM360

Este documento descreve detalhadamente as diretrizes de segurança da informação implementadas na plataforma **IPM360**, bem como a metodologia de testes aplicada para garantir a integridade, confiabilidade e resiliência do sistema antes e durante a sua entrada em produção.

---

## PARTE I: SEGURANCA DO SISTEMA

A segurança no IPM360 foi projetada utilizando a abordagem de **Defesa em Profundidade (Defense in Depth)**, aplicando múltiplas camadas de proteção no Frontend, Backend e Banco de Dados.

### 1.1 Autenticação e Autorização Criptográfica
- **Hashing de Senhas (Bcrypt.js):** O sistema não armazena nenhuma palavra-passe em texto limpo. Todas as credenciais passam por um processo de "salting e hashing" unilateral pelo algoritmo Bcrypt (fator de custo 10). Isso significa que, mesmo em um cenário extremo de violação do Banco de Dados, as senhas dos funcionários são matematicamente impossíveis de serem decifradas.
- **Sessões Stateless (JWT - JSON Web Tokens):** A plataforma abandonou as sessões tradicionais em cookies para adotar o padrão JWT. Após o login, o utilizador recebe um *Token Assinado* criptograficamente pelo servidor (usando uma chave secreta `JWT_SECRET`). Este token expira automaticamente e acompanha todas as requisições privadas, validando a identidade do usuário a cada milissegundo.

### 1.2 Controle de Acesso Baseado em Funções (RBAC)
O IPM360 divide estritamente o que cada utilizador pode ver e executar:
- **Global Admin**: Controle infraestrutural total.
- **Admin**: Permissões para avaliar subordinados e visualizar dashboards departamentais, mas bloqueados de alterar as engrenagens centrais do sistema.
- **Funcionários**: Privilégios mínimos. Podem apenas ler seu próprio histórico reflexivo e enviar submissões de feedback, impedindo qualquer alteração em notas de colegas.

### 1.3 Proteções de Rede e Integridade de Requisições
- **Parâmetros Preparados (Prepared Statements):** Para eliminar completamente a maior vulnerabilidade mundial de bases de dados temporárias — os ataques de **SQL Injection** —, todas as rotas do Node.js (Express) utilizam consultas parametrizadas fornecidas pela biblioteca `mysql2/promise`. Variáveis nunca são concatenadas diretamente nas Strings do SQL.
- **CORS e Filtros (Cross-Origin Resource Sharing):** O servidor está configurado para aceitar apenas requisições vindas legitimamente da origem oficial do portal (O domínio hospedado do React). Tentativas de roubo de sessão ou injeção via servidores de terceiros são negadas imediatamente pela API.
- **Auditoria Transacional Incorruptível:** Foi criada uma tabela autônoma denominada `historico`. Gatilhos automáticos (Triggers do MySQL) gravam qualquer inserção, alteração de nota ou update de dados, registrando o "Antes" e o "Depois". Se uma nota for corrompida, é possível rastrear quem foi o causador da anomalia de forma permanente.

---

## PARTE II: METODOLOGIA DE TESTES DO SISTEMA

O selo de aprovação do IPM360 exigiu uma verificação exaustiva das suas engrenagens. Foi empregado um plano em três camadas: Funcional, Integração e Usabilidade.

### 2.1 Testes de Integração e APIs (Backend)
- **Rotas de Avaliação:** Testes focados no *Express* asseguraram que o cálculo da média global (a junção complexa dos eixos comportamentais, técnicos e profissionais) gerasse consistentemente o diagnóstico final em frações de segundos. Simulou-se o envio simultâneo de múltiplos administradores inserindo avaliações (Stress Básico) com transações ativas.
- **Testes de Bloqueio JWT:** Simulações enviando "Tokens Expirados", "Tokens Manipulados" ou "Páginas Sem Acesso". O servidor passou em 100% das métricas negando o acesso e devolvendo o Código HTTP Mestre: `401 Unauthorized` ou `403 Forbidden`.

### 2.2 Testes Funcionais e de Componentes (Frontend)
- **Validação de Formulários Reativos:** O ambiente React passou por depuração sistemática para garantir que o utilizador nunca conseguisse enviar campos sensíveis em branco ou notas avaliativas acima de "20" e abaixo de "0".
- **Comportamento em SPA (Single Page Application):** Simulou-se navegações agressivas rápidas pelos botões do menu departamental, certificando de que os relatórios em `Chart.js` destruíssem suas dependências da memória (Memory Leaks) e reconstruíssem suavemente as novas interfaces gráficas instantaneamente, auxiliados pela compilação com *Vite*.

### 2.3 Testes de Usabilidade e Aceitação do Usuário (UAT)
- **Compatibilidade Responsiva (Mobile/Desktop):** Analisou-se a adaptação do *Tailwind CSS* nas quebras textuais estéticas (Breakpoints). Administradores da vida real utilizando telas quadradas tradicionais, notebooks de alta resolução e Tablets tiveram legibilidade fluida igual e simétrica das tabelas de desempenho.
- **A Experiência do Histórico Reflexivo:** O teste de aceitação máximo para o funcionário padrão. Simulou-se o download instantâneo via `jsPDF/ExcelJS`, comprovando que dados demorados — que burocraticamente levavam mais de um mês para chegar às mãos do trabalhador na prática tradicional —, transitaram formalmente encriptados para a tela do funcionário em documentação em segundos.

### 2.4 Homologação e Monitoramento no Google Chrome
Como ambiente mestre de calibração laboratorial, utilizaram-se as robustas ferramentas internas do navegador **Google Chrome (Chrome DevTools)**:
- **Auditoria Lighthouse:** Todo o render da Interface React.js foi submetido à engine "Lighthouse" embarcada e gerou altíssimos índices estatísticos em termos de SEO (Optimização de Redes), Performance Analítica dos Nós (DOM DOM) e melhores práticas em Acessibilidade visual com seus temas construtivos do Tailwind CSS.
- **Teste de Latência de Rede (Network Tab):** O cronômetro de Rede (Aba Network) monitorou ao extremo as frações de segundo dos formulários operantes do Frontend sendo empurrados pela API REST. Requisições POST assíncronas do Axios operando transações robustas nos painéis de RH alcançaram retornos em latências baixíssimas (frequentemente < 80 milissegundos).
- **Inspeção de Memória Local (Application Tab):** Comprovou-se mecanicamente, observando as propriedades de armazenamento da Seção Application, que os Tokens de Autenticação gerados de forma sigilosa não sofriam anomalias de formatação por tempo prolongado, bem como eram suprimidos (Lixeira) letalmente do Storage Local instantaneamente ao momento em que as requisições ativavam a janela final de “Logout Seguro”.

---

## Conclusão de Conformidade Final

O rigor metodológico da engenharia base no **IPM360** garante aos gestores da alta administração a premissa mais crítica de um software de Recursos Humanos: **A total integridade probatória do mérito**. O sistema revela-se insípido a perdas de dados e inflexível a vazamento analítico indevido, superando perante atestados de segurança a gestão de performance puramente arquivista antes vigente.
