# Ferramentas de Desenvolvimento e Gestão do Projeto IPM360

Este documento detalha o conjunto de ferramentas selecionadas para garantir o desenvolvimento ágil, seguro e eficiente da plataforma **IPM360**. Cada ferramenta foi escolhida com propósitos específicos, compondo um ecossistema capaz de suprir as necessidades de codificação, versionamento, gestão de tarefas, testes e armazenamento de dados.

## Sumário
1. [IDE e Editor de Código: Antigravity](#1-ide-e-editor-de-código-antigravity)
2. [Controle de Versão: Git](#2-controle-de-versão-git)
3. [Gestão de Projeto: Trello](#3-gestão-de-projeto-trello)
4. [Metodologia e Ferramentas de Testes](#4-metodologia-e-ferramentas-de-testes)
5. [Banco de Dados e Ambiente Local: MySQL e XAMPP](#5-banco-de-dados-e-ambiente-local-mysql-e-xampp)
6. [Sinergia do Toolset e Produtividade](#6-sinergia-do-toolset-e-produtividade)
7. [Conclusão](#7-conclusão)

---

## 1. IDE e Editor de Código: Antigravity

A principal ferramenta de desenvolvimento e edição de código utilizada no projeto foi o **Antigravity**. Diferenciando-se das IDEs tradicionais, o Antigravity introduz um paradigma inovador, atuando como um assistente de codificação inteligente com recursos avançados.

### Principais Benefícios:
- **Codificação Assistida por IA**: Uso de inteligência artificial profunda para geração de código, identificação de padrões e resolução de bugs em tempo real, acelerando drasticamente o ciclo de desenvolvimento (SDLC).
- **Análise Contextual Profunda**: A ferramenta entende o contexto geral do projeto (Frontend e Backend simultaneamente), permitindo sugestões arquiteturais inteligentes.
- **Refatoração Dinâmica**: Capacidade superior em analisar blocos de códigos antigos e refatorá-los para versões mais otimizadas (como transição de componentes de classe para funções modernas com Hooks no React).
- **Eficiência**: Menor carga cognitiva na configuração de ambientes, permitindo o foco total na lógica de negócio e na arquitetura da plataforma IPM360.

---

## 2. Controle de Versão: Git

A padronização e segurança histórico-evolutiva do código foram geridas através do **Git**, o sistema de controle de versão distribuído padrão da indústria.

### Funcionalidades Exploradas:
- **Rastreabilidade de Mudanças**: Cada alteração, desde pequenos ajustes estéticos via Tailwind CSS até lógicas complexas no Node.js, foi auditada, mantendo o histórico de criação seguro.
- **Isolamento de Funcionalidades**: O uso do Git permitiu garantir que versões estáveis da API e do frontend pudessem ser resgatadas imediatamente caso uma nova integração em desenvolvimento quebrassem a aplicação.
- **Versionamento de Arquivos**: Proteção absoluta contra perda de dados locais, fundamental no desenvolvimento de um Trabalho de Conclusão de Curso (TCC) / Projeto Final.

---

## 3. Gestão de Projeto: Trello

A orquestração do trabalho seguiu conceitos ágeis, com toda a gestão de tarefas e features organizada na plataforma **Trello**.

### Aplicação da Ferramenta:
- **Metodologia Kanban**: O projeto foi dividido em quadros visuais, com listas representando estados evolutivos das tarefas (ex: *Backlog do Produto*, *A Fazer*, *Em Desenvolvimento*, *Testes* e *Concluído*).
- **Divisão em Sprints/Entregas**: O Trello permitiu a segmentação do módulo de avaliação 360º em pequenas etapas viáveis (ex: "Criar formulário de login", "Implementar middleware de JWT", "Criar gráfico radar").
- **Acompanhamento Visual de Metas**: Controle eficiente sobre gargalos no desenvolvimento, permitindo ajuste de prazos e foco das prioridades semanais de codificação e testagem.

---

## 4. Metodologia e Ferramentas de Testes

A fase de testes foi fundamental para garantir que o IPM360 operasse com precisão matemática (especialmente nos cálculos de médias) e segurança de dados. O processo foi dividido em três frentes principais:

### 4.1. Testes de API e Backend (Postman/Insomnia)
Antes de integrar o frontend, todas as rotas da API Node.js foram testadas individualmente.
- **Validação de Endpoints**: Testou-se a resposta de cada URL (ex: `/api/login`, `/api/avaliar`) para garantir que retornassem os códigos HTTP corretos (200 OK para sucesso, 401 Unauthorized para acessos negados).
- **Consistência de Dados**: Verificou-se se o JSON retornado pelo banco de dados MySQL continha exatamente os campos necessários para a interface, evitando tráfego de dados desnecessário.

### 4.2. Testes de Interface e UX (Developer Tools)
Utilizando as ferramentas de desenvolvedor dos navegadores modernos (Chrome/Edge DevTools):
- **Depuração em Tempo Real**: Monitoramento do estado dos componentes React e das propriedades (props) passadas entre eles.
- **Responsividade**: Simulação de diversos dispositivos (Kindle, iPhone, Tablets e Monitores 4K) para garantir que o layout construído com Tailwind CSS se comportasse de forma fluida em todas as resoluções.

### 4.3. Testes Funcionais Finais
- **Simulação de Ciclo Completo**: Realizou-se o percurso completo de um usuário gestor (cadastrar funcionário -> lançar notas -> visualizar ranking) e de um funcionário (acessar perfil -> verificar feedback) para garantir que não houvesse "quebras" no fluxo lógico do sistema.

---

## 5. Banco de Dados e Ambiente Local: MySQL e XAMPP

O armazenamento, a persistência e o relacionamento dos dados foram encarregues a tecnologias altamente validadas no mercado para aplicações robustas.

### 5.1. XAMPP
Para emular o ambiente de servidor antes do deploy oficial, utilizou-se o pacote de ferramentas **XAMPP**.
- **Servidor Local Ágil**: O XAMPP provisionou imediatamente os serviços de Apache Web Server e o motor de banco de dados no ambiente local de desenvolvimento.
- **PhpMyAdmin**: Interface web facilitada para visualização rápida das tabelas, exportação de backups e execução de consultas SQL complexas para depuração manual.

### 5.2. MySQL
Como Sistema de Gerenciamento de Banco de Dados Relacional (SGBDR), o **MySQL** operou a arquitetura do IPM360.
- **Integridade Relacional**: O sistema se baseia em relações complexas (Funcionários associados a Departamentos, Cargos, Históricos e Avaliações). O MySQL permitiu manter chaves primárias e estrangeiras rígidas, proibindo registros órfãos.
- **Triggers e Automação**: Uso de gatilhos automáticos para gravar logs de auditoria, garantindo que qualquer alteração em notas de avaliação fosse registrada com data, hora e autor da modificação.

---

## 6. Sinergia do Toolset e Produtividade

A integração entre estas ferramentas não foi meramente funcional, mas estratégica. O fluxo de trabalho (Workflow) adotado permitiu que cada fase do desenvolvimento alimentasse a seguinte de forma contínua:

1.  **Planejamento (Trello)**: As demandas eram transformadas em cartões, permitindo uma visão clara do que precisava ser codificado a cada dia.
2.  **Desenvolvimento (Antigravity + Git)**: A codificação assistida pela IA do Antigravity acelerou a escrita das rotas e componentes, enquanto o Git garantia que cada avanço fosse salvo e versionado com segurança.
3.  **Execução Local (XAMPP + MySQL)**: O ambiente local robusto permitiu testar a lógica do banco de dados e a performance das queries em tempo real, sem depender de conexões externas.
4.  **Validação (Testes)**: O uso de ferramentas como Postman e o Chrome DevTools garantiu que, ao final de cada "sprint" do Trello, o recurso estivesse livre de bugs críticos.

Esta sinergia resultou em uma redução significativa no tempo de depuração e um aumento na qualidade final da plataforma IPM360.

---

## 7. Resumo Técnico do Ambiente

Para fins de padronização, abaixo seguem as especificações técnicas gerais do ambiente de engenharia:

| Categoria | Ferramenta | Detalhe Técnico |
| :--- | :--- | :--- |
| **Ambiente de Código** | Antigravity IDE | Assistência de IA e Edição Multipropósito |
| **Linguagem Base** | JavaScript (ES6+) | Padrão moderno Node.js / Browser |
| **Controle de Versão** | Git 2.x | Gestão de Branching e Commits |
| **Motor de Dados** | MySQL 8.0 / MariaDB | Mecanismo InnoDB para transações |
| **Servidor Web Local** | XAMPP (Apache) | Emulação de ambiente LAMP/WAMP |
| **Gestão Ágil** | Trello | Quadros Kanban e Backlog de User Stories |

---

## 8. Conclusão

A escolha deste conjunto de ferramentas — do **Antigravity** para a codificação inteligente ao **MySQL/XAMPP** para a infraestrutura de dados — foi fundamental para o sucesso do projeto. Cada elemento foi selecionado para maximizar a produtividade e garantir que o **IPM360** fosse uma solução de software escalável, segura e profissional.

A combinação entre ferramentas modernas de IA, sistemas de controle de versão consolidados e metodologias ágeis de gestão permitiu que o desenvolvimento ocorrece de forma organizada, resultando em um produto final que atende rigorosamente aos requisitos técnicos e funcionais propostos.

---
> **Documento: Ferramentas do Projeto IPM360**
> *Status: Finalizado - Versão 1.3*
