# Relatório Técnico: Ecossistema de Tecnologias do IPM360

Este documento fornece uma análise detalhada das tecnologias, linguagens e metodologias que compõem a infraestrutura do sistema **IPM360**. A escolha de cada componente foi baseada em critérios de performance, escalabilidade, segurança e padrões modernos de engenharia de software.

---

## 1. Linguagem de Programação: JavaScript (ES6+)

A base fundamental de todo o ecossistema IPM360 é a linguagem **JavaScript**, utilizando as especificações mais recentes (ECMAScript 2015+).

- **Unificação de Stack (Fullstack JS)**: O uso de JavaScript tanto no Frontend (React) quanto no Backend (Node.js) permitiu uma maior agilidade no desenvolvimento, compartilhamento de lógica de validação e uma curva de aprendizado otimizada.
- **Assincronismo e Performance**: Através do uso extensivo de `Promises` e `Async/Await`, o sistema consegue lidar com operações de entrada e saída (I/O) — como requisições ao banco de dados e leitura de arquivos — sem bloquear o fluxo principal da aplicação.
- **Ecossistema Robusto**: O acesso ao gerenciador de pacotes NPM (Node Package Manager) permitiu a integração de bibliotecas seguras para criptografia, manipulação de datas e geração de relatórios.

---

## 2. Frameworks e Bibliotecas de Suporte

Para estruturar a aplicação de forma profissional e modular, foram utilizados frameworks líderes de mercado.

### 2.1. React.js (Frontend)
Responsável pela criação da Interface de Usuário (UI).
- **Componentização**: O sistema foi dividido em pequenas partes reutilizáveis (botões, cards de avaliação, modais), facilitando a manutenção.
- **Virtual DOM**: Garante que a interface seja atualizada de forma instantânea e fluida, essencial para dashboards de indicadores em tempo real.

### 2.2. Express.js (Backend)
Framework minimalista para Node.js que atua como o servidor de API.
- **Roteamento Inteligente**: Organização clara das rotas de acesso (ex: `/api/funcionarios`, `/api/login`).
- **Middleware**: Implementação de camadas de segurança que verificam a autenticidade do usuário antes de processar qualquer dado sensível.

### 2.3. Vite (Build Tool)
Utilizado para orquestrar o ambiente de desenvolvimento e realizar o "build" de produção, oferecendo carregamento quase instantâneo do código durante a fase de criação.

---

## 3. Banco de Dados: SQL (MySQL)

A persistência de dados do IPM360 é gerida pelo **MySQL**, um sistema de gerenciamento de banco de dados relacional (SGBDR) robusto e amplamente utilizado em aplicações corporativas.

- **Modelagem Relacional**: Estrutura baseada em tabelas estritamente ligadas (Chaves Estrangeiras), garantindo que um histórico de avaliação nunca fique órfão ou associado a um funcionário inexistente.
- **Integridade de Dados (ACID)**: Transações seguras que garantem que os dados sejam salvos de forma completa ou totalmente descartados em caso de erro, evitando corrupção das notas.
- **Consultas Otimizadas**: Uso de SQL puro para extração de médias ponderadas e geração de rankings de desempenho com alta velocidade.

---

## 4. Metodologia Ágil (Kanban e Scrum)

O desenvolvimento do IPM360 não foi um processo linear e rígido, mas sim adaptativo, seguindo os princípios de **Metodologias Ágeis**.

- **Ciclos de Entrega (Sprints)**: O projeto foi dividido em pequenas entregas funcionais, permitindo validar o módulo de login antes de iniciar o módulo de avaliações, por exemplo.
- **Visibilidade via Trello**: O uso de quadros Kanban permitiu visualizar o fluxo das tarefas (*Backlog*, *Em Progresso*, *Testes*, *Concluído*), reduzindo gargalos e garantindo que o cronograma do projeto fosse cumprido.
- **Foco no Usuário**: A agilidade permitiu realizar ajustes constantes na interface baseados em testes rápidos, melhorando a experiência final (UX).

---

## 5. Ferramentas de Testes (QA - Quality Assurance)

Para assegurar que o sistema funcione conforme o esperado e sem falhas de segurança, implementou-se um protocolo de testes rigoroso.

- **Postman / Insomnia**: Utilizados para testar exaustivamente a API Backend. Cada "endpoint" foi validado para garantir que os cálculos de médias e a proteção de rotas (JWT) estivessem funcionando antes mesmo da interface visual existir.
- **Testes de Integração**: Verificação da comunicação entre o Frontend (Axios) e o Backend, assegurando que os dados enviados pelo formulário chegassem corretamente ao banco SQL.
- **Validação de Inputs**: Testes de estresse para garantir que o sistema rejeite dados inválidos (ex: notas negativas ou textos em campos numéricos).

---

## 6. Navegador: Google Chrome (Dev Environment)

Embora o sistema seja compatível com múltiplos navegadores, o **Google Chrome** foi a ferramenta central de desenvolvimento e depuração.

- **Chrome DevTools**: Utilização intensa do console de desenvolvedor para monitorar requisições de rede (aba *Network*), analisar o desempenho do render e depurar o estado dos componentes React.
- **Motor V8**: O desempenho superior do motor JavaScript do Chrome permitiu simular ambientes de alta carga, garantindo que o IPM360 permaneça fluido mesmo com grandes volumes de dados em tela.
- **Auditoria Lighthouse**: Uso do motor de auditoria integrado para otimizar o SEO, acessibilidade e as melhores práticas de carregamento da plataforma.

---

## 7. Conclusão

A combinação destas tecnologias cria um ambiente de software coeso e moderno. Enquanto o **JavaScript** e os **Frameworks** garantem a agilidade e a interatividade, o **MySQL** fornece a segurança dos dados e as **Metodologias Ágeis** asseguram a organização necessária para entregar um produto de alta qualidade técnica e acadêmica.

---
> **Documento de Referência Técnica: Tecnologias IPM360**
> *Data de Emissão: 2026*
