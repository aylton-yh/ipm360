import React, { useState } from 'react';
import { FaUserEdit, FaUsers, FaArrowRight, FaClock, FaCalendarAlt, FaPaperPlane } from 'react-icons/fa';
import styles from './MinhasAvaliacoes.module.css';

export default function MinhasAvaliacoes() {
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>Minhas Avaliações</h2>
        <p>Acompanhe e participe dos ciclos de feedback ativos.</p>
      </div>

      <div className={styles.grid}>
        {/* Card 1: Minhas Notas */}
        <div className={`${styles.card} ${styles.autoavaliação}`}>
          <div className={styles.header}>
            <div className={`${styles.iconBox} ${styles.blueIcon}`}>
              <FaCalendarAlt />
            </div>
            <span className={`${styles.tag} ${styles.tagMandatory}`}>Ciclo Ativo</span>
          </div>
          
          <div className={styles.cardContent}>
            <h3>Minhas Notas - Semestre 2026/1</h3>
            <p><strong>Status:</strong> Avaliação concluída. Confira abaixo suas pontuações parciais.</p>
            
            <table className={styles.criteriaTable}>
              <thead>
                <tr>
                  <th>Critério de Avaliação</th>
                  <th style={{textAlign: 'center', width: '50px'}}>Nota</th>
                </tr>
              </thead>
              <tbody>
                {/* Comportamentais */}
                <tr className={styles.criteriaCategory}><td colSpan="2">COMPORTAMENTAIS</td></tr>
                <tr><td>Pontualidade</td><td align="center"><span className={styles.scoreBox}>5</span></td></tr>
                <tr><td>Assiduidade</td><td align="center"><span className={styles.scoreBox}>5</span></td></tr>
                <tr><td>Adaptação</td><td align="center"><span className={styles.scoreBox}>4</span></td></tr>
                <tr><td>Rel. Colegas</td><td align="center"><span className={styles.scoreBox}>5</span></td></tr>
                
                {/* Técnicos */}
                <tr className={styles.criteriaCategory}><td colSpan="2">TÉCNICO-PEDAGÓGICOS</td></tr>
                <tr><td>Proc. Ensino</td><td align="center"><span className={styles.scoreBox}>4</span></td></tr>
                <tr><td>Aperfeiçoamento</td><td align="center"><span className={styles.scoreBox}>3</span></td></tr>
                <tr><td>Inovação</td><td align="center"><span className={styles.scoreBox}>4</span></td></tr>
                <tr><td>Responsabilidade</td><td align="center"><span className={styles.scoreBox}>5</span></td></tr>
                <tr><td>Rel. Humanas</td><td align="center"><span className={styles.scoreBox}>4</span></td></tr>
                <tr><td>Ativ. Extras</td><td align="center"><span className={styles.scoreBox}>5</span></td></tr>
              </tbody>
            </table>
          </div>

          <div className={styles.classificationContainer}>
            <div className={styles.classBox}>
               <span className={styles.classTitle}>Classificação Quantitativa</span>
               <span className={styles.classValue}>18.0 <small style={{fontSize:'12px', color:'#94a3b8'}}>/ 20</small></span>
            </div>
            <div className={styles.classBox}>
               <span className={styles.classTitle}>Classificação Qualitativa</span>
               <span className={`${styles.classValue} ${styles.qualitativeValue}`}>Excelente</span>
            </div>
          </div>


          <button className={`${styles.btnAction} ${styles.btnStart}`} onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes Completos'} <FaArrowRight style={{transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s'}}/>
          </button>

          {/* PAINEL DE DETALHES (EXPANSÍVEL) */}
          {showDetails && (
            <div className={styles.detailsPanel}>
               <h4 style={{margin: '0 0 15px 0', color: '#334155'}}>Detalhamento da Avaliação</h4>
               
               {/* Exemplo de Detalhe 1 */}
               <div className={styles.detailRow}>
                  <div className={styles.detailContent}>
                     <span className={styles.detailTitle}>Pontualidade</span>
                     <p className={styles.detailDesc}>"Colaborador sempre chega no horário e respeita os prazos de reuniões. Exemplo de compromisso."</p>
                  </div>
                  <div className={styles.detailScoreBox}>
                     <span className={styles.detailScoreVal}>5</span>
                     <span className={styles.detailScoreLabel}>Nota</span>
                  </div>
               </div>

               {/* Exemplo de Detalhe 2 */}
               <div className={styles.detailRow}>
                   <div className={styles.detailContent}>
                      <span className={styles.detailTitle}>Inovação</span>
                      <p className={styles.detailDesc}>"Trouxe boas ideias para o projeto X, mas precisa estruturar melhor as propostas antes de apresentar."</p>
                   </div>
                   <div className={styles.detailScoreBox}>
                      <span className={styles.detailScoreVal}>4</span>
                      <span className={styles.detailScoreLabel}>Nota</span>
                   </div>
               </div>

               {/* Exemplo de Detalhe 3 */}
               <div className={styles.detailRow}>
                   <div className={styles.detailContent}>
                      <span className={styles.detailTitle}>Processo de Ensino-Aprendizagem</span>
                      <p className={styles.detailDesc}>"Demonstra domínio técnico, porém alunos reportaram dificuldade em alguns tópicos avançados. Sugiro revisão da didática no módulo 3."</p>
                   </div>
                   <div className={styles.detailScoreBox}>
                      <span className={styles.detailScoreVal}>4</span>
                      <span className={styles.detailScoreLabel}>Nota</span>
                   </div>
               </div>
               
               <p style={{fontSize:'12px', color:'#94a3b8', textAlign:'center', marginTop:'10px'}}>... (demais critérios seguem o mesmo padrão) ...</p>
            </div>
          )}
        </div>

        {/* Card 2: Feedback entre Pares */}
        <div className={`${styles.card} ${styles.pares} ${styles.smallCard}`}>
          <div className={styles.header}>
            <div className={`${styles.iconBox} ${styles.purpleIcon}`}>
              <FaUsers />
            </div>
            <span className={`${styles.tag} ${styles.tagOptional}`}>Em Andamento</span>
          </div>
          
          <div className={styles.cardContent}>
            <h3>Feedback entre Pares</h3>
            <p>Seus colegas esperam seu feedback! Complete as avaliações pendentes.</p>
            
            {/* Progress Bar */}
            <div style={{marginTop: '15px'}}>
               <span className={styles.metaLabel}>Seu Progresso: 3 de 5 Colegas</span>
               <div className={styles.progressContainer}>
                  <div className={styles.progressBar} style={{width: '60%'}}></div>
               </div>
               <span className={styles.progressText}>60% Concluído</span>
            </div>
          </div>

          <div className={styles.metaInfo}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Pendentes</span>
              <span className={styles.metaValue}>2 Avaliações</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Prazo</span>
              <span className={styles.metaValue}><FaCalendarAlt /> 15 Jul, 2026</span>
            </div>
          </div>

          <button className={`${styles.btnAction} ${styles.btnSendFeedback}`} onClick={() => setShowModal(true)}>
            Enviar Feedback <FaPaperPlane />
          </button>
        </div>
      </div>

      {/* MODAL DE FEEDBACK */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Enviar Feedback ao Gestor</h3>
              <p>Este espaço é seu. Expresse suas observações sobre este ciclo.</p>
            </div>
            
            <textarea 
              className={styles.textArea} 
              placeholder="Escreva aqui sua mensagem, sugestão ou justificativa..."
            ></textarea>

            <div className={styles.modalActions}>
              <button className={`${styles.btnAction} ${styles.btnCancel}`} style={{width: 'auto'}} onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className={`${styles.btnAction} ${styles.btnSendFeedback}`} style={{width: 'auto'}} onClick={() => {alert('Feedback enviado com sucesso!'); setShowModal(false)}}>
                Confirmar Envio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
