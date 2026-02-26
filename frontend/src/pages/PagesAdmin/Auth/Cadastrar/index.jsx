import React, { useState, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AiOutlineUser,
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineEye,
  AiOutlineEyeInvisible
} from 'react-icons/ai';
import {
  FaCamera,
  FaInfoCircle,
  FaPhone,
  FaTransgender,
  FaHeart,
  FaMapMarkerAlt,
  FaIdCard,
  FaCalendarAlt,
  FaBuilding,
  FaBriefcase
} from 'react-icons/fa';
import styles from './Cadastrar.module.css';
import logoImage from '../../../../assets/images/LogoSistema.jpeg';

import { AuthContext } from '../../../../context/AuthContext';
import { EmployeeContext } from '../../../../context/EmployeeContext';

export default function Cadastrar() {
  const { t } = useTranslation();
  const { registerAdmin } = useContext(AuthContext);
  const { departments } = useContext(EmployeeContext);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [foto, setFoto] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bi: '',
    departamento: '',
    cargo: '',
    admissao: '',
    num_agente: '',
    sobre: '',
    telefone: '',
    sexo: '',
    estadoCivil: '',
    endereco: ''
  });

  const navigate = useNavigate();

  // Obter cargos disponíveis baseados no departamento
  const cargosDisponiveis = useMemo(() => {
    const selectedDept = departments.find(d => d.nome === formData.departamento);
    return selectedDept ? selectedDept.seccoes : [];
  }, [formData.departamento, departments]);

  const togglePassword = () => setShowPassword(!showPassword);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'departamento') {
      setFormData({
        ...formData,
        [name]: value,
        cargo: '' // Reset cargo when department changes
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação básica
    const isTeacher = formData.departamento === 'Docência';
    const hasAllBaseFields = formData.username && formData.email && formData.password &&
      formData.confirmPassword && formData.bi && formData.departamento && formData.cargo &&
      formData.admissao && formData.telefone && formData.sexo && formData.estadoCivil && formData.endereco;
    const hasAgentNumberIfTeacher = isTeacher ? !!formData.num_agente : true;

    if (formData.password !== formData.confirmPassword) {
      alert(t('registration.passwords_dont_match'));
      return;
    }

    if (hasAllBaseFields && hasAgentNumberIfTeacher) {
      setIsLoading(true);

      // Delay simulado de cadastro + redirect
      setTimeout(() => {
        registerAdmin({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          nome: formData.username,
          bi: formData.bi,
          dept: formData.departamento,
          cargo: formData.cargo,
          admissao: formData.admissao,
          num_agente: formData.num_agente,
          foto: foto,
          sobre: formData.sobre,
          telefone: formData.telefone,
          sexo: formData.sexo,
          estadoCivil: formData.estadoCivil,
          endereco: formData.endereco
        });
        navigate('/login');
      }, 3000);
    } else {
      alert(t('registration.fill_all_fields'));
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.cubeGrid}>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
          <div className={styles.cube}></div>
        </div>
        <div className={styles.loadingText}>{t('registration.loading_account')}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.overlay}></div>
      <div className={styles.card}>
        <div className={styles.leftSide}>
          <div className={styles.logoArea}>
            <img src={logoImage} alt={t('registration.logo_alt')} className={styles.logo} />
            <h1>{t('registration.create_account')}</h1>
            <p>{t('registration.join_us_desc')}</p>
          </div>
        </div>

        <div className={styles.rightSide}>
          <div className={styles.formContent}>
            <h2>{t('registration.registration_title')}</h2>
            <p className={styles.subtitle}>{t('registration.fill_details_desc')}</p>

            <form onSubmit={handleSubmit}>
              {/* Área da Foto - Reposicionada para dentro do formulário */}
              <div className={styles.photoContainer}>
                <div className={styles.photoWrapper}>
                  <img src={foto || "https://via.placeholder.com/150"} alt="Preview" />
                  <label htmlFor="upload-admin-photo" className={styles.uploadBtn}>
                    <FaCamera />
                  </label>
                  <input type="file" id="upload-admin-photo" hidden onChange={handleFotoChange} accept="image/*" />
                </div>
                <p className={styles.photoHint}>{t('registration.photo_hint')}</p>
              </div>

              <div className={styles.formGrid}>
                {/* Linha 1: Identidade básica */}
                <div className={styles.inputGroup}>
                  <label>{t('registration.username')}</label>
                  <div className={styles.inputWrapper}>
                    <AiOutlineUser className={styles.inputIcon} />
                    <input
                      type="text"
                      name="username"
                      placeholder={t('registration.username_placeholder')}
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>{t('registration.email')}</label>
                  <div className={styles.inputWrapper}>
                    <AiOutlineMail className={styles.inputIcon} />
                    <input
                      type="email"
                      name="email"
                      placeholder={t('registration.email_placeholder')}
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Linha 2: Documentação e Datas */}
                <div className={styles.inputGroup}>
                  <label>{t('registration.id_card')}</label>
                  <div className={styles.inputWrapper}>
                    <FaIdCard className={styles.inputIcon} />
                    <input
                      type="text"
                      name="bi"
                      placeholder={t('registration.id_card_placeholder')}
                      value={formData.bi}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>{t('registration.admission_date')}</label>
                  <div className={styles.inputWrapper}>
                    <FaCalendarAlt className={styles.inputIcon} />
                    <input
                      type="date"
                      name="admissao"
                      value={formData.admissao}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Linha 3: Estrutura Organizacional */}
                <div className={styles.inputGroup}>
                  <label>{t('registration.department')}</label>
                  <div className={styles.inputWrapper}>
                    <FaBuilding className={styles.inputIcon} />
                    <select
                      name="departamento"
                      value={formData.departamento}
                      onChange={handleChange}
                      className={styles.selectInput}
                    >
                      <option value="">{t('registration.select_department')}</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.nome}>{dept.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>{t('registration.role')}</label>
                  <div className={styles.inputWrapper}>
                    <FaBriefcase className={styles.inputIcon} />
                    <select
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                      disabled={!formData.departamento}
                      className={styles.selectInput}
                    >
                      <option value="">
                        {formData.departamento
                          ? t('registration.select_role')
                          : t('registration.select_dept_first')}
                      </option>
                      {cargosDisponiveis.map((cargo, index) => (
                        <option key={index} value={cargo}>{cargo}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Linha adicional: Telefone e Sexo */}
                <div className={styles.inputGroup}>
                  <label>{t('registration.phone')}</label>
                  <div className={styles.inputWrapper}>
                    <FaPhone className={styles.inputIcon} />
                    <input
                      type="text"
                      name="telefone"
                      placeholder={t('registration.phone_placeholder')}
                      value={formData.telefone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>{t('registration.gender')}</label>
                  <div className={styles.inputWrapper}>
                    <FaTransgender className={styles.inputIcon} />
                    <select
                      name="sexo"
                      value={formData.sexo}
                      onChange={handleChange}
                      className={styles.selectInput}
                    >
                      <option value="">{t('registration.select_gender')}</option>
                      <option value="Masculino">{t('registration.male')}</option>
                      <option value="Feminino">{t('registration.female')}</option>
                      <option value="Outro">{t('registration.other')}</option>
                    </select>
                  </div>
                </div>

                {/* Linha adicional: Estado Civil e Endereço */}
                <div className={styles.inputGroup}>
                  <label>{t('registration.marital_status')}</label>
                  <div className={styles.inputWrapper}>
                    <FaHeart className={styles.inputIcon} />
                    <select
                      name="estadoCivil"
                      value={formData.estadoCivil}
                      onChange={handleChange}
                      className={styles.selectInput}
                    >
                      <option value="">{t('registration.select_marital_status')}</option>
                      <option value="Solteiro">{t('registration.single')}</option>
                      <option value="Casado">{t('registration.married')}</option>
                      <option value="Divorciado">{t('registration.divorced')}</option>
                      <option value="Viúvo">{t('registration.widowed')}</option>
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>{t('registration.address')}</label>
                  <div className={styles.inputWrapper}>
                    <FaMapMarkerAlt className={styles.inputIcon} />
                    <input
                      type="text"
                      name="endereco"
                      placeholder={t('registration.address_placeholder')}
                      value={formData.endereco}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Linha 4: Condicional ou Espaçador */}
                {formData.departamento === 'Docência' ? (
                  <div className={styles.inputGroup}>
                    <label>{t('registration.agent_number')}</label>
                    <div className={styles.inputWrapper}>
                      <FaIdCard className={styles.inputIcon} />
                      <input
                        type="text"
                        name="num_agente"
                        placeholder={t('registration.agent_number_placeholder')}
                        value={formData.num_agente}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={styles.inputGroup}>
                    {/* Placeholder para manter o grid simétrico */}
                  </div>
                )}

                <div className={styles.inputGroup}>
                  {/* Espaço para manter alinhamento se necessário */}
                </div>

                {/* Linha 5: Segurança */}
                <div className={styles.inputGroup}>
                  <label>{t('registration.password')}</label>
                  <div className={styles.inputWrapper}>
                    <AiOutlineLock className={styles.inputIcon} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder={t('registration.password_placeholder')}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button type="button" className={styles.eyeBtn} onClick={togglePassword}>
                      {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </button>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>{t('registration.confirm_password')}</label>
                  <div className={styles.inputWrapper}>
                    <AiOutlineLock className={styles.inputIcon} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder={t('registration.confirm_password_placeholder')}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button type="button" className={styles.eyeBtn} onClick={togglePassword}>
                      {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </button>
                  </div>
                </div>

                {/* Linha 6: Bio (Sempre total) */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label>{t('registration.about_label')}</label>
                  <div className={styles.inputWrapper}>
                    <FaInfoCircle className={styles.inputIcon} />
                    <textarea
                      name="sobre"
                      className={styles.textareaInput}
                      placeholder={t('registration.about_placeholder')}
                      value={formData.sobre}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className={styles.loginBtn}>{t('registration.register_btn')}</button>
            </form>

            <div className={styles.footer}>
              <div style={{ marginBottom: '10px' }}>
                {t('registration.already_have_account')} <Link to="/login">{t('registration.login_link')}</Link>
              </div>
              <Link to="/" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>← Voltar para Início</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
