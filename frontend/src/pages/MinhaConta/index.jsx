import React, { useState } from 'react';
import { FaEdit, FaSave, FaCamera, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, FaIdBadge, FaUserTie, FaTimes } from 'react-icons/fa';
import styles from './MinhaConta.module.css';

export default function MinhaConta() {
  const [editando, setEditando] = useState(false);
  const [usuario, setUsuario] = useState({
    nome: "Aylton Dinis",
    cargo: "Administrador Global",
    departamento: "Diretoria Executiva",
    email: "aylton.dinis@ipm360.com",
    telefone: "+244 923 000 000",
    endereco: "Luanda, Angola",
    matricula: "ADM-2025-001",
    bio: "Gerenciando estratégias e operações globais para maximizar a eficiência organizacional.",
    foto: null,
    capa: null
  });

  const [novoUsuario, setNovoUsuario] = useState({ ...usuario });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoUsuario(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvar = () => {
    setUsuario({ ...novoUsuario });
    setEditando(false);
  };

  const handleCancelar = () => {
    setNovoUsuario({ ...usuario });
    setEditando(false);
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setNovoUsuario(prev => ({ ...prev, foto: event.target.result }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="page-container">
      {/* Capa do Perfil */}
      <div className={styles.coverImage}>
         <div className={styles.coverOverlay}></div>
      </div>

      <div className={styles.profileContainer}>
        {/* Cartão Principal */}
        <div className={styles.mainCard}>
          <div className={styles.avatarWrapper}>
             {novoUsuario.foto ? (
               <img src={novoUsuario.foto} alt="Avatar" className={styles.avatarImg} />
             ) : (
               <div className={styles.avatarPlaceholder}>{novoUsuario.nome.charAt(0)}</div>
             )}
             
             {editando && (
               <label className={styles.cameraBtn}>
                 <FaCamera />
                 <input type="file" onChange={handleFotoChange} hidden />
               </label>
             )}
          </div>

          <div className={styles.headerInfo}>
            {editando ? (
              <input 
                type="text" 
                name="nome"
                value={novoUsuario.nome} 
                onChange={handleInputChange}
                className={styles.titleInput}
              />
            ) : (
              <h1 className={styles.userName}>{usuario.nome}</h1>
            )}
            
            <span className={styles.userRole}>{usuario.cargo}</span>
          </div>

          <div className={styles.actionButtons}>
             {editando ? (
               <>
                 <button onClick={handleCancelar} className={styles.btnCancel}>Cancelar</button>
                 <button onClick={handleSalvar} className={styles.btnSave}><FaSave /> Salvar</button>
               </>
             ) : (
               <button onClick={() => setEditando(true)} className={styles.btnEdit}><FaEdit /> Editar Perfil</button>
             )}
          </div>
        </div>

        {/* Grid de Informações */}
        <div className={styles.infoGrid}>
          {/* Coluna Esquerda: Pessoais */}
          <div className={styles.infoCard}>
             <h3 className={styles.cardTitle}>Informações de Contato</h3>
             <div className={styles.infoList}>
               <div className={styles.infoItem}>
                 <FaEnvelope className={styles.icon} />
                 <div className={styles.infoData}>
                   <label>Email</label>
                   {editando ? <input name="email" value={novoUsuario.email} onChange={handleInputChange} /> : <span>{usuario.email}</span>}
                 </div>
               </div>
               
               <div className={styles.infoItem}>
                 <FaPhone className={styles.icon} />
                 <div className={styles.infoData}>
                   <label>Telefone</label>
                   {editando ? <input name="telefone" value={novoUsuario.telefone} onChange={handleInputChange} /> : <span>{usuario.telefone}</span>}
                 </div>
               </div>

               <div className={styles.infoItem}>
                 <FaMapMarkerAlt className={styles.icon} />
                 <div className={styles.infoData}>
                   <label>Localização</label>
                   {editando ? <input name="endereco" value={novoUsuario.endereco} onChange={handleInputChange} /> : <span>{usuario.endereco}</span>}
                 </div>
               </div>
             </div>
          </div>

          {/* Coluna Direita: Corporativas */}
          <div className={styles.infoCard}>
             <h3 className={styles.cardTitle}>Dados Corporativos</h3>
             <div className={styles.infoList}>
               <div className={styles.infoItem}>
                 <FaBuilding className={styles.icon} />
                 <div className={styles.infoData}>
                   <label>Departamento</label>
                   {editando ? <input name="departamento" value={novoUsuario.departamento} onChange={handleInputChange} /> : <span>{usuario.departamento}</span>}
                 </div>
               </div>

               <div className={styles.infoItem}>
                 <FaUserTie className={styles.icon} />
                 <div className={styles.infoData}>
                   <label>Cargo</label>
                   {editando ? <input name="cargo" value={novoUsuario.cargo} onChange={handleInputChange} /> : <span>{usuario.cargo}</span>}
                 </div>
               </div>

               <div className={styles.infoItem}>
                 <FaIdBadge className={styles.icon} />
                 <div className={styles.infoData}>
                   <label>Matrícula</label>
                   <span className={styles.badge}>{usuario.matricula}</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
        
        {/* Seção Bio */}
        <div className={`${styles.infoCard} ${styles.fullWidth}`}>
           <h3 className={styles.cardTitle}>Sobre</h3>
           {editando ? (
             <textarea 
               name="bio"
               value={novoUsuario.bio}
               onChange={handleInputChange}
               className={styles.bioInput}
               rows={3}
             />
           ) : (
             <p className={styles.bioText}>{usuario.bio}</p>
           )}
        </div>

      </div>
    </div>
  )
}
