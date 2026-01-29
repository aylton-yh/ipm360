import React from 'react';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt, FaIdCard, FaBriefcase, FaGraduationCap, FaEdit } from 'react-icons/fa';
import styles from './Profile.module.css';

export default function Profile() {
  const user = {
    nome: "Aylton Dinis",
    cargo: "Professor Senior de Matemática",
    email: "aylton.dinis@ipm360.ao",
    telefone: "+244 923 456 789",
    local: "Luanda, Angola",
    departamento: "Departamento de Ciências Exatas",
    gestor: "Dr. Roberto Almeida",
    admissao: "12 de Março de 2019",
    matricula: "PROF-2019042",
    bio: "Profissional dedicado com mais de 10 anos de experiência no ensino de matemática superior. Focado em metodologias ativas e tecnologia na educação.",
    skills: ["Matemática Avançada", "Gestão de Sala de Aula", "Liderança", "Mentoria", "Tecnologia Educacional"]
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>Meu Perfil</h2>
      </div>

      <div className={styles.profileGrid}>
        
        {/* ESQUERDA: Cartão de Visita */}
        <aside className={styles.userCard}>
          <div className={styles.coverPhoto}></div>
          <div className={styles.avatarWrapper}>
            <img src="/assets/profile-aylton.png" alt="Profile" className={styles.avatarImg} />
          </div>
          
          <div className={styles.userInfo}>
             <h3 className={styles.userName}>{user.nome}</h3>
             <span className={styles.userRole}>{user.cargo}</span>
             <span className={styles.statusBadge}>Ativo</span>

             <div className={styles.contactList}>
                <div className={styles.contactItem}>
                   <FaEnvelope className={styles.contactIcon} /> {user.email}
                </div>
                <div className={styles.contactItem}>
                   <FaPhone className={styles.contactIcon} /> {user.telefone}
                </div>
                <div className={styles.contactItem}>
                   <FaMapMarkerAlt className={styles.contactIcon} /> {user.local}
                </div>
             </div>

             <button className={styles.btnEdit}>
                <FaEdit /> Editar Perfil
             </button>
          </div>
        </aside>

        {/* DIREITA: Detalhes */}
        <div className={styles.detailsSection}>
           
           {/* Card: Sobre Mim */}
           <div className={styles.cardSection}>
              <h3 className={styles.sectionTitle}><FaUser /> Sobre Mim</h3>
              <p className={styles.bioText}>{user.bio}</p>
           </div>

           {/* Card: Informações Profissionais */}
           <div className={styles.cardSection}>
              <h3 className={styles.sectionTitle}><FaBriefcase /> Informações Profissionais</h3>
              <div className={styles.infoGrid}>
                 <div className={styles.infoField}>
                    <label>Departamento</label>
                    <p>{user.departamento}</p>
                 </div>
                 <div className={styles.infoField}>
                    <label>Gestor Imediato</label>
                    <p>{user.gestor}</p>
                 </div>
                 <div className={styles.infoField}>
                    <label>Matrícula</label>
                    <p>{user.matricula}</p>
                 </div>
                 <div className={styles.infoField}>
                    <label>Data de Admissão</label>
                    <p>{user.admissao}</p>
                 </div>
              </div>
           </div>

           {/* Card: Habilidades */}
           <div className={styles.cardSection}>
              <h3 className={styles.sectionTitle}><FaGraduationCap /> Competências e Skills</h3>
              <div className={styles.skillsContainer}>
                 {user.skills.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>{skill}</span>
                 ))}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
