import { useRef, useState } from "react";
import styles from "./CadastrarFuncionario.module.css";
import {
  FaUser, FaIdCard, FaMapMarkerAlt, FaCalendarAlt, 
  FaBuilding, FaBriefcase, FaEnvelope, FaPhone, 
  FaCamera, FaSave, FaHistory, FaCheckCircle, FaToggleOn
} from "react-icons/fa";

export default function CadastrarFuncionario() {
  const [foto, setFoto] = useState(null);
  const [formData, setFormData] = useState({});

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setFoto(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
           <h1 className="page-title">Novo Funcionário</h1>
           <p style={{color: '#64748b'}}>Preencha os dados completos para admissão</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Coluna Principal - Formulário */}
        <div className={styles.mainColumn}>
          <div className="card-modern">
            <h3 className={styles.sectionTitle}>Dados Pessoais</h3>
            <div className={styles.gridForm}>
               <div className={styles.inputGroup}>
                 <label>Nome Completo</label>
                 <div className={styles.inputWrapper}>
                   <FaUser className={styles.icon} />
                   <input type="text" placeholder="Nome do funcionário" name="nome" onChange={handleChange} />
                 </div>
               </div>

               <div className={styles.inputGroup}>
                 <label>BI / Passaporte</label>
                 <div className={styles.inputWrapper}>
                   <FaIdCard className={styles.icon} />
                   <input type="text" placeholder="000000000LA000" name="bi" onChange={handleChange} />
                 </div>
               </div>

               <div className={styles.inputGroup}>
                 <label>Data de Nascimento</label>
                 <div className={styles.inputWrapper}>
                   <FaCalendarAlt className={styles.icon} />
                   <input type="date" name="nascimento" onChange={handleChange} />
                 </div>
               </div>

               <div className={styles.inputGroup}>
                 <label>Local de Residência</label>
                 <div className={styles.inputWrapper}>
                   <FaMapMarkerAlt className={styles.icon} />
                   <input type="text" placeholder="Cidade, Bairro" name="endereco" onChange={handleChange} />
                 </div>
               </div>

               <div className={styles.inputGroup}>
                 <label>Telefone</label>
                 <div className={styles.inputWrapper}>
                   <FaPhone className={styles.icon} />
                   <input type="tel" placeholder="+244 9..." name="telefone" onChange={handleChange} />
                 </div>
               </div>

               <div className={styles.inputGroup}>
                 <label>Email Pessoal</label>
                 <div className={styles.inputWrapper}>
                   <FaEnvelope className={styles.icon} />
                   <input type="email" placeholder="email@exemplo.com" name="email" onChange={handleChange} />
                 </div>
               </div>
            </div>

            <h3 className={styles.sectionTitle} style={{marginTop: '30px'}}>Dados Profissionais</h3>
            <div className={styles.gridForm}>
               <div className={styles.inputGroup}>
                 <label>Departamento</label>
                 <div className={styles.inputWrapper}>
                   <FaBuilding className={styles.icon} />
                   <select name="departamento" onChange={handleChange}>
                     <option value="">Selecione...</option>
                     <option value="administracao">Administração</option>
                     <option value="docencia">Docência</option>
                     <option value="servicos_gerais">Serviços Gerais</option>
                     <option value="tic">TIC</option>
                   </select>
                 </div>
               </div>

               {formData.departamento === 'docencia' && (
                 <div className={styles.inputGroup}>
                   <label>Número de Agente</label>
                   <div className={styles.inputWrapper}>
                     <FaIdCard className={styles.icon} />
                     <input type="text" placeholder="Nº Agente Docente" name="num_agente" onChange={handleChange} />
                   </div>
                 </div>
               )}

               <div className={styles.inputGroup}>
                 <label>Cargo</label>
                 <div className={styles.inputWrapper}>
                   <FaBriefcase className={styles.icon} />
                   <input type="text" placeholder="Ex: Analista Senior" name="cargo" onChange={handleChange} />
                 </div>
               </div>

               <div className={styles.inputGroup}>
                 <label>Data de Admissão</label>
                 <div className={styles.inputWrapper}>
                   <FaCalendarAlt className={styles.icon} />
                   <input type="date" name="admissao" onChange={handleChange} />
                 </div>
               </div>

               <div className={styles.inputGroup}>
                 <label>Email Corporativo</label>
                 <div className={styles.inputWrapper}>
                   <FaEnvelope className={styles.icon} />
                   <input type="email" placeholder="funcionario@empresa.com" name="email_corp" onChange={handleChange} />
                 </div>
               </div>

               <div className={styles.inputGroup}>
                 <label>Status</label>
                 <div className={styles.inputWrapper}>
                   <FaToggleOn className={styles.icon} />
                   <select name="status" onChange={handleChange}>
                     <option value="ativo">Ativo</option>
                     <option value="inativo">Inativo</option>
                     <option value="ferias">Férias</option>
                     <option value="suspenso">Suspenso</option>
                   </select>
                 </div>
               </div>
            </div>

            <div className={styles.formFooter}>
               <button className={styles.btnSave}>
                 <FaSave /> Cadastrar Funcionário
               </button>
            </div>
          </div>
        </div>

        {/* Coluna Lateral - Foto e Resumo */}
        <div className={styles.sideColumn}>
          {/* Card Foto */}
          <div className={`${styles.photoCard} card-modern`}>
             <h3>Foto de Perfil</h3>
             <div className={styles.photoArea}>
               <img src={foto || "https://via.placeholder.com/150"} alt="Preview" />
               <label htmlFor="upload-foto" className={styles.uploadBtn}>
                 <FaCamera />
               </label>
               <input type="file" id="upload-foto" hidden onChange={handleFotoChange} accept="image/*" />
             </div>
             <p className={styles.photoHint}>JPG ou PNG. Max 2MB.</p>
          </div>

          {/* Card Histórico Recente */}
          <div className="card-modern">
            <h3 className={styles.sideTitle}><FaHistory /> Recentes</h3>
            <ul className={styles.recentList}>
              <li>
                <div className={styles.recentIcon}><FaCheckCircle /></div>
                <div>
                  <strong>João Manuel</strong>
                  <span>Cadastrado hoje, 09:45</span>
                </div>
              </li>
              <li>
                 <div className={styles.recentIcon}><FaCheckCircle /></div>
                 <div>
                   <strong>Maria Silva</strong>
                   <span>Cadastrada ontem</span>
                 </div>
              </li>
              <li>
                 <div className={styles.recentIcon}><FaCheckCircle /></div>
                 <div>
                   <strong>Carlos Pedro</strong>
                   <span>Cadastrado em 20/01</span>
                 </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
