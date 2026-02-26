import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { FaEdit, FaSave, FaCamera, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, FaIdBadge, FaUserTie } from 'react-icons/fa';
import styles from './MinhaConta.module.css';

export default function MinhaConta() {
  const { currentUser, updateCurrentUser } = useContext(AuthContext);
  const [editando, setEditando] = useState(false);
  const [usuario, setUsuario] = useState({
    nome: currentUser?.nome || currentUser?.username || "",
    cargo: currentUser?.cargo || (currentUser?.role === 'global_admin' ? 'Administrador Global' : 'Administrador'),
    departamento: currentUser?.departamento || '',
    email: currentUser?.email || "",
    telefone: currentUser?.telefone || "",
    endereco: currentUser?.endereco || "",
    matricula: currentUser?.bi || "",
    bio: currentUser?.sobre || "",
    sexo: currentUser?.sexo || "",
    estadoCivil: currentUser?.estado_civil || "",
    foto: currentUser?.foto || "/assets/admin_professional.png"
  });

  const [novoUsuario, setNovoUsuario] = useState({ ...usuario });

  // Sincronizar quando o currentUser mudar (após o fetchMe do context)
  React.useEffect(() => {
    if (currentUser) {
      const updated = {
        nome: currentUser.nome || currentUser.username || "",
        cargo: currentUser.cargo || (currentUser.role === 'global_admin' ? 'Administrador Global' : 'Administrador'),
        departamento: currentUser.departamento || '',
        email: currentUser.email || "",
        telefone: currentUser.telefone || "",
        endereco: currentUser.endereco || "",
        matricula: currentUser.bi || "",
        bio: currentUser.sobre || "",
        sexo: currentUser.sexo || "",
        estadoCivil: currentUser.estado_civil || "",
        foto: currentUser.foto || "/assets/admin_professional.png"
      };
      setUsuario(updated);
      setNovoUsuario(updated);
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoUsuario(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    const success = await updateCurrentUser({
      nome: novoUsuario.nome,
      cargo: novoUsuario.cargo,
      departamento: novoUsuario.departamento,
      email: novoUsuario.email,
      telefone: novoUsuario.telefone,
      endereco: novoUsuario.endereco,
      sobre: novoUsuario.bio,
      sexo: novoUsuario.sexo,
      estado_civil: novoUsuario.estadoCivil,
      foto: novoUsuario.foto
    });

    if (success) {
      setUsuario({ ...novoUsuario });
      setEditando(false);
      alert("Perfil atualizado com sucesso!");
    } else {
      alert("Erro ao atualizar perfil. Verifique a conexão com o servidor.");
    }
  };

  const handleCancelar = () => {
    setNovoUsuario({ ...usuario });
    setEditando(false);
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("A imagem deve ter menos de 2MB");

      const reader = new FileReader();
      reader.onload = (event) => {
        const photoData = event.target.result;
        setNovoUsuario(prev => ({ ...prev, foto: photoData }));
      };
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
        <>
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

              <span className={styles.userRole}>
                {currentUser?.role === 'global_admin' ? 'Administrador Global' : (currentUser?.role === 'employee' ? 'Colaborador' : 'Administrador Comum')}
              </span>
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

                <div className={styles.infoItem}>
                  <FaUserTie className={styles.icon} />
                  <div className={styles.infoData}>
                    <label>Sexo</label>
                    <span>{usuario.sexo}</span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <FaIdBadge className={styles.icon} />
                  <div className={styles.infoData}>
                    <label>Estado Civil</label>
                    <span>{usuario.estadoCivil}</span>
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
        </>

      </div>
    </div>
  )
}
