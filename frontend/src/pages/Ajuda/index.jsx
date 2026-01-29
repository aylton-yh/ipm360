import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaUserCircle, FaFileAlt, FaShieldAlt, FaQuestionCircle, FaEnvelope, FaHeadset, FaChevronDown, FaChevronUp, FaArrowLeft, FaBook, FaLightbulb, FaExclamationTriangle } from 'react-icons/fa';
import styles from './Ajuda.module.css';

export default function Ajuda() {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null); // null = Home
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  // Dados dos Tópicos e seus Artigos Detalhados
  const topicsMap = useMemo(() => ({
    conta: {
      id: 'conta',
      title: 'Minha Conta',
      desc: 'Perfil, acesso e logins',
      icon: <FaUserCircle />,
      color: 'blue',
      articles: [
        { q: 'Como alterar minha foto de perfil?', a: 'Vá em "Minha Conta", clique no ícone de câmera sobre sua foto atual e selecione uma nova imagem.' },
        { q: 'Esqueci minha senha, e agora?', a: 'Na tela de login, clique em "Esqueceu a senha?". Ou se já estiver logado, vá em Segurança e redefina.' },
        { q: 'Como atualizar meu telefone?', a: 'Em "Minha Conta", clique em "Editar Perfil" e altere o campo Telefone.' }
      ]
    },
    relatorios: {
      id: 'relatorios',
      title: 'Relatórios',
      desc: 'Exportação e dados',
      icon: <FaFileAlt />,
      color: 'green',
      articles: [
        { q: 'Como exportar em Excel?', a: 'Na tela de Relatórios, selecione o relatório e clique no ícone verde de Excel. O download iniciará automaticamente.' },
        { q: 'Os dados são em tempo real?', a: 'Sim, a maioria dos relatórios reflete os dados inseridos até o momento da geração.' },
        { q: 'Posso agendar relatórios?', a: 'Atualmente essa função está em desenvolvimento. Por enquanto, gere-os manualmente.' }
      ]
    },
    seguranca: {
      id: 'seguranca',
      title: 'Segurança',
      desc: 'Permissões e privacidade',
      icon: <FaShieldAlt />,
      color: 'red',
      articles: [
        { q: 'O que é autenticação de dois fatores?', a: 'É uma camada extra de proteção que pede um código enviado ao seu celular além da senha.' },
        { q: 'Quem pode ver meus dados?', a: 'Apenas você e o Administrador Global têm acesso aos seus dados sensíveis.' },
        { q: 'Como reportar uma atividade suspeita?', a: 'Entre em contato imediatamente com o suporte via chat ou email.' }
      ]
    },
    geral: {
      id: 'geral',
      title: 'Geral',
      desc: 'Navegação e Sistema',
      icon: <FaQuestionCircle />,
      color: 'purple',
      articles: [
        { q: 'O sistema está lento, o que fazer?', a: 'Verifique sua conexão de internet. Se persistir, limpe o cache do navegador.' },
        { q: 'Funciona no celular?', a: 'Sim, o sistema é responsivo e funciona em navegadores móveis (Chrome, Safari).' }
      ]
    }
  }), []);

  // Lógica de Pesquisa
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const allArticles = [];
    Object.values(topicsMap).forEach(topic => {
      topic.articles.forEach(article => {
        allArticles.push({ ...article, topicId: topic.id, topicName: topic.title });
      });
    });

    const filtered = allArticles.filter(item => 
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSuggestions(filtered);
  }, [searchTerm, topicsMap]);

  const handleSuggestionClick = (topicId) => {
    setSelectedTopic(topicId);
    setSearchTerm(''); // Limpa a busca ao selecionar
    setSuggestions([]);
  };

  /* VISUALIZAÇÃO DE DETALHES DO TÓPICO */
  if (selectedTopic) {
    const topic = topicsMap[selectedTopic];
    return (
      <div className={styles.helpContainer}>
        {/* Header Compacto do Tópico */}
        <div className={`${styles.topicHeader} ${styles[`bg-${topic.color}`]}`}>
           <button onClick={() => setSelectedTopic(null)} className={styles.backBtn}>
             <FaArrowLeft /> Voltar para Ajuda
           </button>
           <div className={styles.topicHeaderContent}>
             <div className={styles.largeIcon}>{topic.icon}</div>
             <div>
               <h1>{topic.title}</h1>
               <p>{topic.desc}</p>
             </div>
           </div>
        </div>

        <div className={styles.contentWrapper}>
           <div className={styles.articlesList}>
             <h2 className={styles.sectionTitle}>Artigos e Tutoriais</h2>
             {topic.articles.map((article, idx) => (
               <div key={idx} className={styles.articleCard}>
                 <div className={styles.articleIcon}><FaBook /></div>
                 <div>
                   <h3>{article.q}</h3>
                   <p>{article.a}</p>
                 </div>
               </div>
             ))}
             
             <div className={styles.tipsBox}>
               <FaLightbulb className={styles.tipIcon} />
               <p><strong>Dica Pro:</strong> Se não encontrou o que procurava, tente usar a busca global na tela anterior.</p>
             </div>
           </div>
        </div>
      </div>
    );
  }

  /* VISUALIZAÇÃO HOME (Cards Melhorados) */
  return (
    <div className={styles.helpContainer}>
      <div className={styles.heroSection}>
         <h1 className={styles.heroTitle}>Central de Suporte</h1>
         <div className={styles.searchWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Qual sua dúvida hoje?" 
              className={styles.searchInput} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {/* Sugestões de Pesquisa */}
            {suggestions.length > 0 && (
              <div className={styles.suggestionsDropdown}>
                {suggestions.map((item, index) => (
                  <div 
                    key={index} 
                    className={styles.suggestionItem}
                    onClick={() => handleSuggestionClick(item.topicId)}
                  >
                    <div className={styles.suggestionIcon}><FaBook /></div>
                    <div className={styles.suggestionText}>
                      <strong>{item.q}</strong>
                      <span>Em: {item.topicName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
         </div>
      </div>

      <div className={styles.contentWrapper}>
        <h2 className={styles.sectionTitle}>Escolha um Tópico</h2>
        <div className={styles.topicGrid}>
           {/* Card Conta */}
           <div className={`${styles.topicCard} ${styles.cardBlue}`} onClick={() => setSelectedTopic('conta')}>
              <div className={styles.cardGlow}></div>
              <div className={styles.iconBox}><FaUserCircle /></div>
              <h3>Minha Conta</h3>
              <p>Perfil, senhas e acesso</p>
              <span className={styles.linkText}>Ver 3 artigos</span>
           </div>

           {/* Card Relatórios */}
           <div className={`${styles.topicCard} ${styles.cardGreen}`} onClick={() => setSelectedTopic('relatorios')}>
              <div className={styles.cardGlow}></div>
              <div className={styles.iconBox}><FaFileAlt /></div>
              <h3>Relatórios</h3>
              <p>Exportação e métricas</p>
              <span className={styles.linkText}>Ver 3 artigos</span>
           </div>

           {/* Card Segurança */}
           <div className={`${styles.topicCard} ${styles.cardRed}`} onClick={() => setSelectedTopic('seguranca')}>
              <div className={styles.cardGlow}></div>
              <div className={styles.iconBox}><FaShieldAlt /></div>
              <h3>Segurança</h3>
              <p>Privacidade e autenticação</p>
              <span className={styles.linkText}>Ver 3 artigos</span>
           </div>

           {/* Card Geral */}
           <div className={`${styles.topicCard} ${styles.cardPurple}`} onClick={() => setSelectedTopic('geral')}>
              <div className={styles.cardGlow}></div>
              <div className={styles.iconBox}><FaQuestionCircle /></div>
              <h3>Geral</h3>
              <p>Dúvidas do sistema</p>
              <span className={styles.linkText}>Ver 2 artigos</span>
           </div>
        </div>

        {/* Footer Contato */}
        <div className={styles.contactFooter}>
           <div className={styles.contactInfo}>
              <h3>Não encontrou a resposta?</h3>
              <p>Entre em contato com nossa equipe especializada.</p>
           </div>
           <div className={styles.contactActions}>
              <button className={styles.btnContact}><FaHeadset /> Chat Online</button>
           </div>
        </div>
      </div>
    </div>
  );
}
