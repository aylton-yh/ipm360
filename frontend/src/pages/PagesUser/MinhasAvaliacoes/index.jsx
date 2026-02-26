import React, { useState } from 'react';
import { FaUserEdit, FaUsers, FaArrowRight, FaClock, FaCalendarAlt, FaPaperPlane } from 'react-icons/fa';
import styles from './MinhasAvaliacoes.module.css';

export default function MinhasAvaliacoes() {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>Minhas Avaliações</h2>
        <p>Acompanhe e participe dos ciclos de feedback ativos.</p>
      </div>

      <div className={styles.emptyContainer}>
        <div className={styles.emptyCard}>
          <FaCalendarAlt size={48} color="#94a3b8" />
          <h3>Nenhuma Avaliação Disponível</h3>
          <p>Você ainda não possui ciclos de avaliação vinculados ao seu perfil ou os resultados ainda não foram publicados.</p>
        </div>
      </div>


    </div>
  );
}
