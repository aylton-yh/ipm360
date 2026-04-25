import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FaCalendarAlt, FaStar, FaChartLine, FaCheckCircle, FaUserTie, FaTools, FaFilter, FaThumbsUp, FaThumbsDown, FaPaperPlane, FaCommentDots
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../../context/AuthContext';
import styles from './MinhasAvaliacoes.module.css';

export default function MinhasAvaliacoes() {
  const { getApiUrl } = useContext(AuthContext);
  const location = useLocation();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [feedbackLoading, setFeedbackLoading] = useState(null);
  const [showMotivoInput, setShowMotivoInput] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [activeThread, setActiveThread] = useState(null); // { id_nota, messages: [] }
  const [newMessage, setNewMessage] = useState('');
  const [threadLoading, setThreadLoading] = useState(false);

  const fetchEvals = async () => {
    const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
    if (!token) return;
    try {
      const res = await fetch(getApiUrl('/api/evaluations/my-evaluations'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvaluations(data);
      }
    } catch (e) {
      console.error("Erro ao buscar avaliações:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchThread = async (id_nota) => {
    setThreadLoading(true);
    const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
    try {
      const res = await fetch(getApiUrl(`/api/evaluations/feedback/thread/${id_nota}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveThread({ id_nota: id_nota, messages: data });
      }
    } catch (e) {
      console.error("Erro ao buscar histórico de mensagens:", e);
    } finally {
      setThreadLoading(false);
    }
  };

  const handleSendMessage = async (id_nota) => {
    if (!newMessage.trim()) return;
    const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
    try {
      const res = await fetch(getApiUrl('/api/evaluations/feedback/message'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_nota, mensagem: newMessage })
      });
      if (res.ok) {
        setNewMessage('');
        fetchThread(id_nota);
      }
    } catch (e) {
      console.error("Erro ao enviar mensagem:", e);
    }
  };

  useEffect(() => {
    fetchEvals();
  }, [getApiUrl]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idNota = params.get('id_nota');
    if (idNota) {
      fetchThread(idNota);
      setTimeout(() => {
        const el = document.getElementById(`eval-${idNota}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 800);
    }
  }, [location.search]);

  const handleFeedback = async (id_nota, satisfacao) => {
    if (!satisfacao && !showMotivoInput) {
      setShowMotivoInput(id_nota);
      return;
    }

    setFeedbackLoading(id_nota);
    const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
    try {
      const res = await fetch(getApiUrl('/api/evaluations/feedback'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_nota,
          satisfacao,
          motivo: satisfacao ? null : motivo,
          notify_admin: true // Explicitly trigger notification on backend
        })
      });

      if (res.ok) {
        alert("Feedback enviado com sucesso!");
        await fetchEvals();
        setShowMotivoInput(null); // Fecha a área de input
        setMotivo(''); // Limpa o texto
      } else {
        const err = await res.json();
        alert("Erro: " + (err.error || "Falha ao enviar feedback"));
      }
    } catch (e) {
      console.error("Erro ao enviar feedback:", e);
      alert("Erro de conexão com o servidor.");
    } finally {
      setFeedbackLoading(null);
    }
  };

  const filteredEvals = evaluations.filter(ev => {
    const date = new Date(ev.data);
    const matchYear = date.getFullYear().toString() === filterYear;
    const matchMonth = filterMonth ? (date.getMonth() + 1).toString() === filterMonth : true;
    return matchYear && matchMonth;
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Carregando avaliações...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h2>Minhas Avaliações</h2>
          <p>Acompanhe seu histórico de desempenho e acompanhe as respostas.</p>
        </div>

        <div className={styles.filtersWrapper}>
          <div className={styles.yearFilters}>
            {[2024, 2025, 2026].map(y => (
              <button
                key={y}
                className={`${styles.filterBtn} ${filterYear === y.toString() ? styles.active : ''}`}
                onClick={() => setFilterYear(y.toString())}
              >
                {y}
              </button>
            ))}
          </div>

          <div className={styles.monthFilters}>
            <button
              className={`${styles.filterBtn} ${filterMonth === '' ? styles.active : ''}`}
              onClick={() => setFilterMonth('')}
            >
              Todos os Meses
            </button>
            <select
              className={styles.monthSelect}
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
            >
              <option value="" disabled>Selecionar Mês...</option>
              {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredEvals.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyCard}>
            <FaCalendarAlt size={48} color="#94a3b8" />
            <h3>Nenhuma Avaliação Encontrada</h3>
            <p>Não existem avaliações para o período selecionado.</p>
          </div>
        </div>
      ) : (
        <div className={styles.evaluationsList}>
          {filteredEvals.map((evalItem, idx) => (
            <motion.div
              key={idx}
              id={`eval-${evalItem.id_nota}`}
              className={styles.evalCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className={styles.evalHeader}>
                <div className={styles.evalMainInfo}>
                  <div className={styles.dateInfo}>
                    <FaCalendarAlt />
                    <span>{new Date(evalItem.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <h3 className={styles.evalQualitative}>{evalItem.resultadoQualitativo}</h3>
                </div>
                <div className={styles.evalBadge}>
                  <span className={styles.evalScore}>{evalItem.resultadoQuantitativo}</span>
                  <span className={styles.scoreLabel}>Média Global</span>
                </div>
              </div>

              <div className={styles.criteriaContent}>
                {(() => {
                  const behavioralNames = [
                    'Pontualidade', 'Assiduidade', 'Adaptação', 'Relação com Colegas',
                    'Organização', 'Ética Profissional', 'Iniciativa', 'Cumprimento de Prazos'
                  ];

                  const behavioralItems = evalItem.criterios?.filter(c => behavioralNames.includes(c.nome)) || [];
                  const technicalItems = evalItem.criterios?.filter(c => !behavioralNames.includes(c.nome)) || [];

                  return (
                    <>
                      {behavioralItems.length > 0 && (
                        <div className={styles.criteriaGroup}>
                          <div className={styles.groupHeader}>
                            <div className={styles.groupIcon}><FaUserTie /></div>
                            <h4>Critérios Comportamentais</h4>
                          </div>
                          <div className={styles.criteriaGrid}>
                            {behavioralItems.map((c, i) => (
                              <div key={i} className={styles.criteriaItem}>
                                <div className={styles.criteriaLabel}>
                                  <span className={styles.criteriaName}>{c.nome}</span>
                                  <span className={styles.criteriaGrade}>{Number(c.nota).toFixed(1)}/20</span>
                                </div>
                                <div className={styles.progressBar}>
                                  <motion.div
                                    className={styles.progressFill}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(c.nota / 20) * 100}%` }}
                                    style={{
                                      backgroundColor: c.nota >= 18 ? '#10b981' : c.nota >= 14 ? '#3b82f6' : c.nota >= 10 ? '#f59e0b' : '#ef4444'
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {technicalItems.length > 0 && (
                        <div className={styles.criteriaGroup}>
                          <div className={styles.groupHeader}>
                            <div className={styles.groupIcon}><FaTools /></div>
                            <h4>Critérios Técnicos</h4>
                          </div>
                          <div className={styles.criteriaGrid}>
                            {technicalItems.map((c, i) => (
                              <div key={i} className={styles.criteriaItem}>
                                <div className={styles.criteriaLabel}>
                                  <span className={styles.criteriaName}>{c.nome}</span>
                                  <span className={styles.criteriaGrade}>{Number(c.nota).toFixed(1)}/20</span>
                                </div>
                                <div className={styles.progressBar}>
                                  <motion.div
                                    className={styles.progressFill}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(c.nota / 20) * 100}%` }}
                                    style={{
                                      backgroundColor: c.nota >= 18 ? '#10b981' : c.nota >= 14 ? '#3b82f6' : c.nota >= 10 ? '#f59e0b' : '#ef4444'
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className={styles.evalFooter}>
                {!evalItem.feedback ? (
                  <div className={styles.feedbackSection}>
                    <h4>Estás satisfeito com esta avaliação?</h4>
                    <div className={styles.feedbackButtons}>
                      <button
                        className={styles.btnSim}
                        disabled={feedbackLoading === evalItem.id_nota}
                        onClick={() => handleFeedback(evalItem.id_nota, true)}
                      >
                        <FaThumbsUp /> Sim
                      </button>
                      <button
                        className={styles.btnNao}
                        disabled={feedbackLoading === evalItem.id_nota}
                        onClick={() => handleFeedback(evalItem.id_nota, false)}
                      >
                        <FaThumbsDown /> Não
                      </button>
                    </div>

                    <AnimatePresence>
                      {showMotivoInput === evalItem.id_nota && (
                        <motion.div
                          className={styles.motivoArea}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <textarea
                            placeholder="Diga-nos o motivo da sua insatisfação..."
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                          />
                          <button
                            className={styles.btnSubmitMotivo}
                            onClick={() => handleFeedback(evalItem.id_nota, false)}
                          >
                            <FaPaperPlane /> Enviar Motivo
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className={styles.feedbackResult}>
                    <div className={styles.feedbackStatus}>
                      {evalItem.feedback.satisfacao ? (
                        <span className={styles.statusSatisfied}><FaThumbsUp /> Respondeste que estavas satisfeito</span>
                      ) : (
                        <div className={styles.statusUnsatisfied}>
                          <span><FaThumbsDown /> Marcaste como insatisfeito</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.chatSection}>
                      <button
                        className={styles.toggleChatBtn}
                        onClick={() => activeThread?.id_nota === evalItem.id_nota ? setActiveThread(null) : fetchThread(evalItem.id_nota)}
                      >
                        <FaCommentDots /> {activeThread?.id_nota === evalItem.id_nota ? 'Fechar Conversa' : 'Ver Conversa / Responder'}
                      </button>

                      <AnimatePresence>
                        {activeThread?.id_nota === evalItem.id_nota && (
                          <motion.div
                            className={styles.threadContainer}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <div className={styles.messageList}>
                              {activeThread.messages.length === 0 && (
                                <p className={styles.noMessages}>Nenhuma mensagem detalhada ainda.</p>
                              )}
                              {activeThread.messages.map((m, mi) => (
                                <div key={mi} className={`${styles.messageItem} ${m.tipo_remetente === 'funcionario' ? styles.myMsg : styles.otherMsg}`}>
                                  <div className={styles.msgBubble}>
                                    <p>{m.mensagem}</p>
                                    <span className={styles.msgTime}>{new Date(m.criado_em).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className={styles.replyBox}>
                              <textarea
                                placeholder="Enviar nova mensagem..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                              />
                              <button onClick={() => handleSendMessage(evalItem.id_nota)}>
                                <FaPaperPlane />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
                <div className={styles.footerNote}>
                  <FaCheckCircle className={styles.checkIcon} />
                  <span>Avaliação oficial processada.</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
