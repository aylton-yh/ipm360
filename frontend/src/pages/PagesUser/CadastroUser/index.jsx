import React, { useState, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
   FaCheckCircle, FaUser, FaIdCard, FaMapMarkerAlt, FaCalendarAlt,
   FaBuilding, FaBriefcase, FaEnvelope, FaPhone, FaCamera,
   FaGraduationCap, FaUserTie, FaUserTag
} from 'react-icons/fa';
import styles from './CadastroUser.module.css';
import logoImage from '../../../assets/images/logoSistema.jpeg';
import { AuthContext } from '../../../context/AuthContext';
import { EmployeeContext } from '../../../context/EmployeeContext';

export default function CadastroUser() {
   const { registerCollaborator } = useContext(AuthContext);
   const { addEmployee, departments } = useContext(EmployeeContext);
   const navigate = useNavigate();

   const [loading, setLoading] = useState(false);
   const [foto, setFoto] = useState(null);
   const [formData, setFormData] = useState({
      nome: '',
      sobrenome: '',
      email: '',
      password: '',
      confirmPassword: '',
      sexo: '',
      estadoCivil: '',
      departamento: '',
      cargo: '',
      telefone: '',
      endereco: '',
      nascimento: '',
      bi: '',
      admissao: '',
      skills: '',
      sobre: '',
      numeroAgente: ''
   });

   const handleFotoChange = (e) => {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => setFoto(reader.result);
         reader.readAsDataURL(file);
      }
   };

   const rolesDisponiveis = useMemo(() => {
      const dept = departments.find(d => d.nome === formData.departamento);
      return dept ? dept.seccoes || [] : [];
   }, [formData.departamento, departments]);

   const handleRegister = async (e) => {
      e.preventDefault();

      // Validação básica
      if (!formData.nome || !formData.email || !formData.password || !formData.bi) {
         return alert("Campos essenciais: Nome, E-mail, Senha e BI são obrigatórios.");
      }
      if (formData.password !== formData.confirmPassword) {
         return alert("As senhas não coincidem.");
      }

      setLoading(true);

      const userData = {
         ...formData,
         nome: `${formData.nome} ${formData.sobrenome}`,
         foto: foto,
         dept: formData.departamento,
         cargo: formData.cargo
      };

      try {
         const res = await registerCollaborator(userData);

         if (res.success) {
            // Sincroniza com o painel do Admin
            addEmployee({
               ...userData,
               status: 'Ativo'
            });

            setTimeout(() => {
               alert("Conta e Perfil configurados com sucesso!");
               navigate('/user/login');
            }, 2000);
         } else {
            setLoading(false);
            alert("Erro ao criar conta.");
         }
      } catch (error) {
         setLoading(false);
         alert("Ocorreu um erro inesperado no cadastro.");
      }
   };

   if (loading) {
      return (
         <div className={styles.loadingScreen}>
            <div className={styles.waveContainer}>
               {[1, 2, 3, 4, 5].map(i => <div key={i} className={styles.waveBar}></div>)}
            </div>
            <div className={styles.loadingText}>Configurando seu ambiente profissional...</div>
         </div>
      );
   }

   return (
      <div className={styles.container}>
         <div className={styles.card}>
            <aside className={styles.leftPanel}>
               <img src={logoImage} alt="IPM 360" className={styles.logoSide} />
               <h2>Inicie sua Jornada no IPM 360°</h2>
               <p>Preencha seu perfil completo para que possamos personalizar sua experiência e destacar seu talento.</p>

               <div className={styles.photoSection}>
                  <div className={styles.photoPreview}>
                     {foto ? <img src={foto} alt="Preview" /> : <FaUser Tie />}
                  </div>
                  <label htmlFor="user-photo" className={styles.uploadBtn}>
                     <FaCamera /> {foto ? 'Alterar Foto' : 'Adicionar Foto'}
                  </label>
                  <input
                     type="file"
                     id="user-photo"
                     hidden
                     accept="image/*"
                     onChange={handleFotoChange}
                  />
               </div>

               <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                  <Link to="/user" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', opacity: 0.8 }}>
                     ← Voltar para Início
                  </Link>
               </div>
            </aside>

            <main className={styles.rightPanel}>
               <div className={styles.formHeader}>
                  <h2>Cadastro de Colaborador</h2>
                  <p>Informe seus dados pessoais e profissionais abaixo.</p>
               </div>

               <form onSubmit={handleRegister}>
                  {/* SEÇÃO 1: ACESSO */}
                  <div className={styles.sectionTitle}><FaUserShield /> Dados de Acesso</div>
                  <div className={styles.row}>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>E-mail Corporativo</label>
                        <input
                           type="email"
                           className={styles.input}
                           placeholder="seu.email@empresa.com"
                           value={formData.email}
                           onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                     </div>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>BI / Passaporte</label>
                        <input
                           type="text"
                           className={styles.input}
                           placeholder="Número do seu documento"
                           value={formData.bi}
                           onChange={e => setFormData({ ...formData, bi: e.target.value })}
                        />
                     </div>
                  </div>
                  <div className={styles.row}>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>Senha</label>
                        <input
                           type="password"
                           className={styles.input}
                           placeholder="********"
                           value={formData.password}
                           onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                     </div>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>Confirmar Senha</label>
                        <input
                           type="password"
                           className={styles.input}
                           placeholder="Repita a senha"
                           value={formData.confirmPassword}
                           onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                     </div>
                  </div>

                  {/* SEÇÃO 2: DADOS PESSOAIS */}
                  <div className={styles.sectionTitle}><FaUser /> Informações Pessoais</div>
                  <div className={styles.row}>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>Nome</label>
                        <input
                           type="text"
                           className={styles.input}
                           placeholder="Primeiro nome"
                           value={formData.nome}
                           onChange={e => setFormData({ ...formData, nome: e.target.value })}
                        />
                     </div>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>Sobrenome</label>
                        <input
                           type="text"
                           className={styles.input}
                           placeholder="Últimos nomes"
                           value={formData.sobrenome}
                           onChange={e => setFormData({ ...formData, sobrenome: e.target.value })}
                        />
                     </div>
                  </div>
                  <div className={styles.row}>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>Data de Nascimento</label>
                        <input
                           type="date"
                           className={styles.input}
                           value={formData.nascimento}
                           onChange={e => setFormData({ ...formData, nascimento: e.target.value })}
                        />
                     </div>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>Telefone</label>
                        <input
                           type="tel"
                           className={styles.input}
                           placeholder="+244 9..."
                           value={formData.telefone}
                           onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                        />
                     </div>
                  </div>
                  <div className={styles.row}>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>Gênero</label>
                        <select
                           className={styles.select}
                           value={formData.sexo}
                           onChange={e => setFormData({ ...formData, sexo: e.target.value })}
                        >
                           <option value="">Selecione...</option>
                           <option value="Masculino">Masculino</option>
                           <option value="Feminino">Feminino</option>
                        </select>
                     </div>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>Estado Civil</label>
                        <select
                           className={styles.select}
                           value={formData.estadoCivil}
                           onChange={e => setFormData({ ...formData, estadoCivil: e.target.value })}
                        >
                           <option value="">Selecione...</option>
                           <option value="Solteiro(a)">Solteiro(a)</option>
                           <option value="Casado(a)">Casado(a)</option>
                           <option value="Divorciado(a)">Divorciado(a)</option>
                           <option value="Viúvo(a)">Viúvo(a)</option>
                        </select>
                     </div>
                  </div>
                  <div className={styles.formGroup}>
                     <label className={styles.label}>Endereço Residencial</label>
                     <input
                        type="text"
                        className={styles.input}
                        placeholder="Rua, Bairro, Cidade"
                        value={formData.endereco}
                        onChange={e => setFormData({ ...formData, endereco: e.target.value })}
                     />
                  </div>

                  {/* SEÇÃO 3: DADOS PROFISSIONAIS */}
                  <div className={styles.sectionTitle}><FaBriefcase /> Carreira & Competências</div>
                  <div className={styles.row}>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>Departamento</label>
                        <select
                           className={styles.select}
                           value={formData.departamento}
                           onChange={e => setFormData({ ...formData, departamento: e.target.value, cargo: '' })}
                        >
                           <option value="">Selecione...</option>
                           {departments.map(d => <option key={d.id} value={d.nome}>{d.nome}</option>)}
                        </select>
                     </div>
                     <div className={styles.formGroup}>
                        <label className={styles.label}>Função / Cargo</label>
                        <select
                           className={styles.select}
                           value={formData.cargo}
                           onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                           disabled={!formData.departamento}
                        >
                           <option value="">Selecione...</option>
                           {rolesDisponiveis.map((r, i) => <option key={i} value={r}>{r}</option>)}
                        </select>
                     </div>
                  </div>

                  {/* Campo Condicional: Número de Agente (Apenas para Docência) */}
                  {formData.departamento === 'Docência' && (
                     <div className={styles.formGroup} style={{ marginTop: '-15px', marginBottom: '15px' }}>
                        <label className={styles.label}>Número de Agente</label>
                        <input
                           type="text"
                           className={styles.input}
                           placeholder="Ex: AGT-2024-001"
                           value={formData.numeroAgente || ''}
                           onChange={e => setFormData({ ...formData, numeroAgente: e.target.value })}
                        />
                     </div>
                  )}


                  <div className={styles.formGroup}>
                     <label className={styles.label}>Data de Admissão</label>
                     <input
                        type="date"
                        className={styles.input}
                        value={formData.admissao}
                        onChange={e => setFormData({ ...formData, admissao: e.target.value })}
                     />
                  </div>
                  <div className={styles.formGroup}>
                     <label className={styles.label}>Competências e Skills</label>
                     <input
                        type="text"
                        className={styles.input}
                        placeholder="Ex: Liderança, Python, Gestão de Tempo (Separe por vírgula)"
                        value={formData.skills}
                        onChange={e => setFormData({ ...formData, skills: e.target.value })}
                     />
                  </div>
                  <div className={styles.formGroup}>
                     <label className={styles.label}>Sua Biografia Profissional</label>
                     <textarea
                        className={styles.textarea}
                        placeholder="Conte um pouco sobre sua trajetória e objetivos..."
                        value={formData.sobre}
                        onChange={e => setFormData({ ...formData, sobre: e.target.value })}
                     />
                  </div>

                  <button type="submit" className={styles.btnRegister}>Concluir Cadastro e Ativar Perfil</button>
               </form>

               <div className={styles.footer}>
                  Já tem conta? <Link to="/user/login" className={styles.link}>Fazer Login</Link>
               </div>
            </main>
         </div>
      </div>
   );
}

const FaUserShield = () => (
   <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <path d="M466.5 83.7l-192-80c-4.9-2-10.3-2-15.1 0l-192 80C60.7 86.5 56 94.1 56 102.4v133.4c0 119.5 73.1 228.6 186.2 274.5 4.9 2 10.3 2 15.1 0 113.1-45.9 186.2-155 186.2-274.5V102.4c1.1-8.3-3.6-15.9-11-18.7zM256 461.3c-91.8-38.3-152-127-152-225.5V114l152-63.3L408 114v121.7c0 98.6-60.2 187.3-152 225.6z"></path>
   </svg>
);
