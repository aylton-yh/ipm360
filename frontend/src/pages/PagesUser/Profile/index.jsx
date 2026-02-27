import React, { useContext, useState, useMemo, useRef } from 'react';
import {
   FaUser, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt,
   FaBriefcase, FaGraduationCap, FaEdit, FaPaperPlane,
   FaCommentDots, FaUserShield, FaCamera
} from 'react-icons/fa';
import styles from './Profile.module.css';
import { AuthContext } from '../../../context/AuthContext';
import { EmployeeContext } from '../../../context/EmployeeContext';

export default function Profile() {
   const { currentUser, updateCurrentUser } = useContext(AuthContext);
   const { updateEmployee, departments } = useContext(EmployeeContext);
   const [isEditing, setIsEditing] = useState(false);
   const [editData, setEditData] = useState({});
   const fileInputRef = useRef(null);

   React.useEffect(() => {
      if (currentUser) {
         setEditData({
            ...currentUser,
            nome: currentUser.nome_completo || currentUser.nome || '',
            email: currentUser.email || '',
            telefone: currentUser.telefone || '',
            endereco: currentUser.endereco || '',
            departamento: currentUser.departamento || currentUser.dept || '',
            cargo: currentUser.cargo || '',
            bi: currentUser.bi || '',
            admissao: currentUser.admissao || '',
            nascimento: currentUser.nascimento || '',
            sexo: currentUser.sexo || '',
            estadoCivil: currentUser.estadoCivil || '',
            skills: Array.isArray(currentUser.skills) ? currentUser.skills.join(', ') : (currentUser.skills || ''),
            sobre: currentUser.sobre || '',
            foto: currentUser.foto || null,
            numeroAgente: currentUser.numeroAgente || ''
         });
      }
   }, [currentUser]);

   const user = {
      nome: currentUser?.nome || "Colaborador",
      cargo: currentUser?.cargo || "Cargo não definido",
      email: currentUser?.email || "email@exemplo.com",
      telefone: currentUser?.telefone || "---",
      local: currentUser?.endereco || "Endereço não informado",
      departamento: currentUser?.dept || currentUser?.departamento || "Não informado",
      gestor: currentUser?.gestor || "Gestor não definido",
      admissao: currentUser?.admissao || "---",
      bi: currentUser?.bi || "---",
      nascimento: currentUser?.nascimento || "---",
      sexo: currentUser?.sexo || "---",
      estadoCivil: currentUser?.estadoCivil || "---",
      numeroAgente: currentUser?.numeroAgente || "",
      bio: currentUser?.sobre || "Bio não cadastrada.",
      skills: Array.isArray(currentUser?.skills) ? currentUser.skills : (typeof currentUser?.skills === 'string' ? currentUser.skills.split(',').map(s => s.trim()) : [])
   };

   // Lógica dinâmica para Cargos (Igual ao CadastroUser)
   const rolesDisponiveis = useMemo(() => {
      const dept = departments.find(d => d.nome === editData.departamento);
      return dept ? dept.seccoes || [] : [];
   }, [editData.departamento, departments]);

   const handleSaveProfile = () => {
      // Converter skills de string para array se necessário ao salvar, ou manter string se backend preferir
      // Aqui vamos manter compatibilidade com o que AuthContext espera
      const formattedData = {
         ...editData,
         skills: editData.skills // AuthContext lida com isso ou updateCurrentUser
      };

      updateCurrentUser(formattedData);
      // Sincroniza também com a lista que o admin vê
      if (editData.id || editData.bi) {
         updateEmployee(editData.id || editData.bi, formattedData);
      }
      setIsEditing(false);
      alert("Perfil atualizado com sucesso!");
   };

   const handlePhotoChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
            setEditData(prev => ({ ...prev, foto: reader.result }));
         };
         reader.readAsDataURL(file);
      }
   };

   return (
      <div className={styles.container}>
         <div className={styles.pageHeader}>
            <h2>Meu Perfil Profissional</h2>
         </div>

         <div className={styles.profileGrid}>
            <aside className={styles.userCard}>
               <div className={styles.coverPhoto}></div>
               <div className={styles.avatarWrapper}>
                  {editData.foto || currentUser?.foto ? (
                     <img src={isEditing ? (editData.foto || currentUser.foto) : currentUser.foto} alt="Profile" className={styles.avatarImg} />
                  ) : (
                     <div className={styles.defaultAvatar}>{user.nome.charAt(0)}</div>
                  )}

                  {isEditing && (
                     <div className={styles.avatarEditOverlay} onClick={() => fileInputRef.current?.click()}>
                        <FaCamera />
                        <input
                           type="file"
                           ref={fileInputRef}
                           onChange={handlePhotoChange}
                           style={{ display: 'none' }}
                           accept="image/*"
                        />
                     </div>
                  )}
               </div>

               <div className={styles.userInfo}>
                  <h2 className={styles.userName}>{user.nome}</h2>
                  <span className={styles.userRole}>{user.cargo}</span>
                  <span className={styles.statusBadge}>Ativo</span>

                  <div className={styles.contactList}>
                     <div className={styles.contactItem}>
                        <FaEnvelope /> {user.email}
                     </div>
                     <div className={styles.contactItem}>
                        <FaPhone /> {user.telefone}
                     </div>
                     <div className={styles.contactItem}>
                        <FaMapMarkerAlt /> {user.local}
                     </div>
                  </div>

                  {isEditing ? (
                     <div className={styles.editActions}>
                        <button className={styles.btnSave} onClick={handleSaveProfile}>Salvar</button>
                        <button className={styles.btnCancel} onClick={() => { setIsEditing(false); setEditData(currentUser); }}>Cancelar</button>
                     </div>
                  ) : (
                     <button className={styles.btnEdit} onClick={() => setIsEditing(true)}>
                        <FaEdit /> Editar Perfil
                     </button>
                  )}
               </div>
            </aside>

            {/* MAIN DETAILS SECTION */}
            <div className={styles.detailsSection}>

               {isEditing ? (
                  // MODO EDIÇÃO - FORMULÁRIO COMPLETO (Baseado em CadastroUser)
                  <div className={styles.editFormContainer}>

                     <div className={styles.cardSection}>
                        <h3 className={styles.sectionTitle}><FaUser /> Informações Pessoais</h3>
                        <div className={styles.infoGrid}>
                           <div className={styles.infoField}>
                              <label>Nome Completo</label>
                              <input className={styles.editInput} value={editData.nome || ''} onChange={e => setEditData({ ...editData, nome: e.target.value })} />
                           </div>
                           <div className={styles.infoField}>
                              <label>Data de Nascimento</label>
                              <input className={styles.editInput} type="date" value={editData.nascimento || ''} onChange={e => setEditData({ ...editData, nascimento: e.target.value })} />
                           </div>
                           <div className={styles.infoField}>
                              <label>Gênero</label>
                              <select className={styles.editSelect} value={editData.sexo || ''} onChange={e => setEditData({ ...editData, sexo: e.target.value })}>
                                 <option value="">Selecione...</option>
                                 <option value="Masculino">Masculino</option>
                                 <option value="Feminino">Feminino</option>
                              </select>
                           </div>
                           <div className={styles.infoField}>
                              <label>Estado Civil</label>
                              <select className={styles.editSelect} value={editData.estadoCivil || ''} onChange={e => setEditData({ ...editData, estadoCivil: e.target.value })}>
                                 <option value="">Selecione...</option>
                                 <option value="Solteiro(a)">Solteiro(a)</option>
                                 <option value="Casado(a)">Casado(a)</option>
                                 <option value="Divorciado(a)">Divorciado(a)</option>
                                 <option value="Viúvo(a)">Viúvo(a)</option>
                              </select>
                           </div>
                           <div className={styles.infoField}>
                              <label>Telefone</label>
                              <input className={styles.editInput} value={editData.telefone || ''} onChange={e => setEditData({ ...editData, telefone: e.target.value })} />
                           </div>
                           <div className={styles.infoField}>
                              <label>Endereço</label>
                              <input className={styles.editInput} value={editData.endereco || ''} onChange={e => setEditData({ ...editData, endereco: e.target.value })} />
                           </div>
                        </div>
                     </div>

                     <div className={styles.cardSection}>
                        <h3 className={styles.sectionTitle}><FaBriefcase /> Informações Profissionais</h3>
                        <div className={styles.infoGrid}>
                           <div className={styles.infoField}>
                              <label>Departamento</label>
                              <select className={styles.editSelect} value={editData.departamento || ''} onChange={e => setEditData({ ...editData, departamento: e.target.value, cargo: '' })}>
                                 <option value="">Selecione...</option>
                                 {departments.map(d => <option key={d.id} value={d.nome}>{d.nome}</option>)}
                              </select>
                           </div>
                           <div className={styles.infoField}>
                              <label>Função / Cargo</label>
                              <select className={styles.editSelect} value={editData.cargo || ''} onChange={e => setEditData({ ...editData, cargo: e.target.value })} disabled={!editData.departamento}>
                                 <option value="">Selecione...</option>
                                 {rolesDisponiveis.map((r, i) => <option key={i} value={r}>{r}</option>)}
                              </select>
                           </div>
                           {editData.departamento === 'Docência' && (
                              <div className={styles.infoField}>
                                 <label>Número de Agente</label>
                                 <input className={styles.editInput} value={editData.numeroAgente || ''} onChange={e => setEditData({ ...editData, numeroAgente: e.target.value })} />
                              </div>
                           )}
                           <div className={styles.infoField}>
                              <label>BI / Passaporte</label>
                              <input className={styles.editInput} value={editData.bi || ''} onChange={e => setEditData({ ...editData, bi: e.target.value })} />
                           </div>
                           <div className={styles.infoField}>
                              <label>Data de Admissão</label>
                              <input className={styles.editInput} type="date" value={editData.admissao || ''} onChange={e => setEditData({ ...editData, admissao: e.target.value })} />
                           </div>
                        </div>
                     </div>

                     <div className={styles.cardSection}>
                        <h3 className={styles.sectionTitle}><FaGraduationCap /> Competências e Skills</h3>
                        <div className={styles.infoField}>
                           <label>Listar Competências (separadas por vírgula)</label>
                           <input
                              className={styles.editInput}
                              placeholder="Ex: Liderança, Python, Gestão de Tempo"
                              value={editData.skills || ''}
                              onChange={e => setEditData({ ...editData, skills: e.target.value })}
                           />
                        </div>
                     </div>

                     <div className={styles.cardSection}>
                        <h3 className={styles.sectionTitle}><FaUser /> Sobre Mim</h3>
                        <textarea
                           className={styles.editTextArea}
                           placeholder="Conte um pouco sobre sua trajetória..."
                           value={editData.sobre || ''}
                           onChange={e => setEditData({ ...editData, sobre: e.target.value })}
                        />
                     </div>

                  </div>
               ) : (
                  // MODO VISUALIZAÇÃO (READ-ONLY)
                  <>
                     <div className={styles.cardSection}>
                        <h3 className={styles.sectionTitle}><FaUser /> Sobre Mim</h3>
                        <p className={styles.bioText}>{user.bio}</p>
                     </div>

                     <div className={styles.cardSection}>
                        <h3 className={styles.sectionTitle}><FaBriefcase /> Informações Profissionais</h3>
                        <div className={styles.infoGrid}>
                           <div className={styles.infoField}>
                              <label>Departamento</label>
                              <p>{user.departamento}</p>
                           </div>
                           <div className={styles.infoField}>
                              <label>Função / Cargo</label>
                              <p>{user.cargo}</p>
                           </div>
                           <div className={styles.infoField}>
                              <label>BI / Passaporte</label>
                              <p>{user.bi}</p>
                           </div>
                           <div className={styles.infoField}>
                              <label>Data de Admissão</label>
                              <p>{user.admissao}</p>
                           </div>
                           <div className={styles.infoField}>
                              <label>Gênero</label>
                              <p>{user.sexo}</p>
                           </div>
                           <div className={styles.infoField}>
                              <label>Data de Nascimento</label>
                              <p>{user.nascimento}</p>
                           </div>
                           <div className={styles.infoField}>
                              <label>Estado Civil</label>
                              <p>{user.estadoCivil}</p>
                           </div>
                           {user.departamento === 'Docência' && user.numeroAgente && (
                              <div className={styles.infoField}>
                                 <label>Número de Agente</label>
                                 <p>{user.numeroAgente}</p>
                              </div>
                           )}
                        </div>
                     </div>

                     <div className={styles.cardSection}>
                        <h3 className={styles.sectionTitle}><FaGraduationCap /> Competências e Skills</h3>
                        <div className={styles.skillsTagContainer}>
                           {user.skills.length > 0 ? user.skills.map((skill, index) => (
                              <span key={index} className={styles.skillTag}>{skill}</span>
                           )) : <p>Nenhuma competência registrada.</p>}
                        </div>
                     </div>
                  </>
               )}

            </div>
         </div>
      </div>
   );
}
