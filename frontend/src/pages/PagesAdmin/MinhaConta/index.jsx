import React, { useState, useContext, useEffect } from 'react';
import {
  FaUserCircle, FaEdit, FaSave, FaTimes, FaCamera, FaEnvelope,
  FaPhone, FaMars, FaHeart, FaBuilding, FaUserTie, FaIdBadge,
  FaGlobe, FaChartLine
} from 'react-icons/fa';
import { AuthContext } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MinhaConta.module.css';

export default function MinhaConta() {
  const { currentUser, updateCurrentUser, getApiUrl } = useContext(AuthContext);
  const [editando, setEditando] = useState(false);
  const [minhasAvaliacoes, setMinhasAvaliacoes] = useState([]);

  const [usuario, setUsuario] = useState({
    nome: currentUser?.nome_completo || "",
    cargo: currentUser?.cargo || (currentUser?.role === 'global_admin' ? 'Administrador Global' : 'Administrador'),
    departamento: currentUser?.departamento || '',
    email: currentUser?.email || "",
    telefone: currentUser?.telefone || "",
    endereco: currentUser?.endereco || "",
    matricula: currentUser?.bi || "",
    bio: currentUser?.sobre || "",
    sexo: currentUser?.sexo || "",
    estadoCivil: currentUser?.estado_civil || "",
    foto: currentUser?.foto || ""
  });

  const [novoUsuario, setNovoUsuario] = useState({ ...usuario });

  useEffect(() => {
    const fetchEvals = async () => {
      const token = localStorage.getItem('ipm360_token') || sessionStorage.getItem('ipm360_token');
      if (!token) return;
      try {
        const res = await fetch(getApiUrl('/api/evaluations/my-evaluations'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMinhasAvaliacoes(data);
        }
      } catch (e) { console.error(e); }
    };
    fetchEvals();
  }, [getApiUrl]);

  useEffect(() => {
    if (currentUser) {
      const updated = {
        nome: currentUser.nome_completo || "",
        cargo: currentUser.cargo || (currentUser.role === 'global_admin' ? 'Administrador Global' : 'Administrador'),
        departamento: currentUser.departamento || '',
        email: currentUser.email || "",
        telefone: currentUser.telefone || "",
        endereco: currentUser.endereco || "",
        matricula: currentUser.bi || "",
        bio: currentUser.sobre || "",
        sexo: currentUser.sexo || "",
        estadoCivil: currentUser.estado_civil || "",
        foto: currentUser.foto || ""
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
      nome_completo: novoUsuario.nome,
      cargo: novoUsuario.cargo,
      departamento: novoUsuario.departamento,
      email: novoUsuario.email,
      telefone: novoUsuario.telefone,
      endereco: novoUsuario.endereco,
      sobre: novoUsuario.bio,
      sexo: novoUsuario.sexo,
      estado_civil: novoUsuario.estadoCivil,
      bi: novoUsuario.matricula,
      foto: novoUsuario.foto
    });

    if (success) {
      setUsuario({ ...novoUsuario });
      setEditando(false);
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
        setNovoUsuario(prev => ({ ...prev, foto: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="page-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className={styles.coverImage}>
        <motion.div
          className={styles.coverOverlay}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        />
      </div>

      <div className={styles.profileContainer}>
        <motion.div className={styles.mainCard} variants={itemVariants}>
          <div className={styles.avatarWrapper}>
            <div className={styles.innerAvatar}>
              {novoUsuario.foto ? (
                <img src={novoUsuario.foto} alt="Avatar" className={styles.avatarImg} />
              ) : (
                <div className={styles.avatarPlaceholder}>{novoUsuario.nome.charAt(0)}</div>
              )}
            </div>

            <AnimatePresence>
              {editando && (
                <motion.label
                  className={styles.cameraBtn}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <FaCamera />
                  <input type="file" onChange={handleFotoChange} hidden />
                </motion.label>
              )}
            </AnimatePresence>
          </div>

          <div className={styles.headerInfo}>
            {editando ? (
              <motion.input
                type="text"
                name="nome"
                value={novoUsuario.nome}
                onChange={handleInputChange}
                className={styles.titleInput}
                autoFocus
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            ) : (
              <h1 className={styles.userName}>{usuario.nome}</h1>
            )}
            <span className={styles.userRole}>
              {currentUser?.role === 'global_admin' ? 'Administrador Global' : 'Administrador'}
            </span>
          </div>

          <div className={styles.actionButtons}>
            {editando ? (
              <>
                <button onClick={handleCancelar} className={styles.btnCancel}>
                  <FaTimes /> Cancelar
                </button>
                <motion.button
                  onClick={handleSalvar}
                  className={styles.btnSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaSave /> Salvar Alterações
                </motion.button>
              </>
            ) : (
              <motion.button
                onClick={() => setEditando(true)}
                className={styles.btnEdit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaEdit /> Editar Perfil
              </motion.button>
            )}
          </div>
        </motion.div>

        <div className={styles.infoGrid}>
          {/* Informações Pessoais */}
          <motion.div className={styles.infoCard} variants={itemVariants}>
            <h3 className={styles.cardTitle}>Informações Pessoais</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}><FaEnvelope /></div>
                <div className={styles.infoData}>
                  <label>Email Corporativo</label>
                  {editando ? <input name="email" value={novoUsuario.email} onChange={handleInputChange} /> : <span>{usuario.email}</span>}
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}><FaPhone /></div>
                <div className={styles.infoData}>
                  <label>Telefone</label>
                  {editando ? <input name="telefone" value={novoUsuario.telefone} onChange={handleInputChange} /> : <span>{usuario.telefone}</span>}
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}><FaMars /></div>
                <div className={styles.infoData}>
                  <label>Sexo</label>
                  {editando ? (
                    <select name="sexo" value={novoUsuario.sexo} onChange={handleInputChange}>
                      <option value="">Selecionar</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  ) : <span>{usuario.sexo || "Não definido"}</span>}
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}><FaHeart /></div>
                <div className={styles.infoData}>
                  <label>Estado Civil</label>
                  {editando ? (
                    <select name="estadoCivil" value={novoUsuario.estadoCivil} onChange={handleInputChange}>
                      <option value="">Selecionar</option>
                      <option value="Solteiro(a)">Solteiro(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viúvo(a)">Viúvo(a)</option>
                    </select>
                  ) : <span>{usuario.estadoCivil || "Não definido"}</span>}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dados Profissionais */}
          <motion.div className={styles.infoCard} variants={itemVariants}>
            <h3 className={styles.cardTitle}>Dados Profissionais</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}><FaBuilding /></div>
                <div className={styles.infoData}>
                  <label>Departamento</label>
                  {editando ? <input name="departamento" value={novoUsuario.departamento} onChange={handleInputChange} /> : <span>{usuario.departamento}</span>}
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}><FaUserTie /></div>
                <div className={styles.infoData}>
                  <label>Cargo</label>
                  {editando ? <input name="cargo" value={novoUsuario.cargo} onChange={handleInputChange} /> : <span>{usuario.cargo}</span>}
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}><FaIdBadge /></div>
                <div className={styles.infoData}>
                  <label>Matrícula / BI</label>
                  {editando ? <input name="matricula" value={novoUsuario.matricula} onChange={handleInputChange} /> : <span className={styles.badge}>{usuario.matricula}</span>}
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}><FaGlobe /></div>
                <div className={styles.infoData}>
                  <label>Endereço</label>
                  {editando ? <input name="endereco" value={novoUsuario.endereco} onChange={handleInputChange} /> : <span>{usuario.endereco}</span>}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio Section */}
          <motion.div className={`${styles.infoCard} ${styles.fullWidth}`} variants={itemVariants}>
            <h3 className={styles.cardTitle}>Resumo Profissional / Biografia</h3>
            <div className={styles.bioSection}>
              {editando ? (
                <textarea
                  name="bio"
                  value={novoUsuario.bio}
                  onChange={handleInputChange}
                  className={styles.bioInput}
                  rows={4}
                  placeholder="Escreva um pouco sobre sua trajetória profissional..."
                />
              ) : (
                <p className={styles.bioText}>{usuario.bio || "Nenhuma biografia adicionada."}</p>
              )}
            </div>
          </motion.div>

          {/* Minhas Avaliações Section */}
          {!editando && minhasAvaliacoes.length > 0 && (
            <motion.div className={`${styles.infoCard} ${styles.fullWidth}`} variants={itemVariants}>
              <h3 className={styles.cardTitle}><FaChartLine style={{ marginRight: '10px' }} /> Minhas Avaliações</h3>
              <div className={styles.evaluationsGrid}>
                {minhasAvaliacoes.map((evalItem, idx) => (
                  <div key={idx} className={styles.evalCard}>
                    <div className={styles.evalHeader}>
                      <div>
                        <span className={styles.evalDate}>{new Date(evalItem.data).toLocaleDateString()}</span>
                        <h4 className={styles.evalQualitative}>{evalItem.resultadoQualitativo}</h4>
                      </div>
                      <div className={styles.evalScore}>
                        {evalItem.resultadoQuantitativo}
                      </div>
                    </div>
                    <div className={styles.criteriaGrid}>
                      {evalItem.criterios?.map((c, i) => (
                        <div key={i} className={styles.criteriaItem}>
                          <div className={styles.criteriaLabel}>
                            <span>{c.nome}</span>
                            <span>{c.nota}/5</span>
                          </div>
                          <div className={styles.progressBar}>
                            <motion.div
                              className={styles.progressFill}
                              initial={{ width: 0 }}
                              animate={{ width: `${(c.nota / 5) * 100}%` }}
                              style={{
                                backgroundColor: c.nota >= 4 ? '#22c55e' : c.nota >= 3 ? '#eab308' : '#ef4444'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
