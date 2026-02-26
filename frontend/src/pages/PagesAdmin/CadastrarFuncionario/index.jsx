import { useRef, useState, useContext, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./CadastrarFuncionario.module.css";
import { EmployeeContext } from "../../../context/EmployeeContext";
import { AuthContext } from "../../../context/AuthContext";
import {
  FaUser, FaIdCard, FaMapMarkerAlt, FaCalendarAlt,
  FaBuilding, FaBriefcase, FaEnvelope, FaPhone,
  FaCamera, FaSave, FaHistory, FaCheckCircle, FaToggleOn,
  FaVenusMars, FaRing
} from "react-icons/fa";

export default function CadastrarFuncionario() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addEmployee, updateEmployee, addHistoryEvent, employees, departments } = useContext(EmployeeContext);

  const editingEmployee = location.state?.employee;

  const [foto, setFoto] = useState(editingEmployee?.foto || null);
  const [formData, setFormData] = useState({
    nome: editingEmployee?.nome || '',
    bi: editingEmployee?.bi || '',
    nascimento: editingEmployee?.nascimento || '',
    endereco: editingEmployee?.endereco || '',
    telefone: editingEmployee?.telefone || '',
    email: editingEmployee?.email_pessoal || editingEmployee?.email || '',
    departamento: editingEmployee?.dept || '',
    num_agente: editingEmployee?.num_agente || '',
    cargo: editingEmployee?.cargo || '',
    admissao: editingEmployee?.admissao || '',
    sexo: editingEmployee?.sexo || '',
    estadoCivil: editingEmployee?.estadoCivil || '',
    status: editingEmployee?.status || 'Ativo'
  });

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Obter cargos (seções) baseados no departamento selecionado
  const selectedDeptData = useMemo(() => {
    return departments.find(d => d.nome === formData.departamento);
  }, [formData.departamento, departments]);

  const cargosDisponiveis = useMemo(() => {
    return selectedDeptData ? selectedDeptData.secções : [];
  }, [selectedDeptData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // 1. Validação de Campos Obrigatórios
    const requiredFields = [
      { key: 'nome', label: 'Nome Completo' },
      { key: 'bi', label: 'BI / Passaporte' },
      { key: 'nascimento', label: 'Data de Nascimento' },
      { key: 'endereco', label: 'Local de Residência' },
      { key: 'telefone', label: 'Telefone' },
      { key: 'email', label: 'Email Pessoal' },
      { key: 'departamento', label: 'Departamento' },
      { key: 'cargo', label: 'Cargo' },
      { key: 'admissao', label: 'Data de Admissão' },
      { key: 'sexo', label: 'Sexo' },
      { key: 'estadoCivil', label: 'Estado Civil' }
    ];

    const missingFields = requiredFields.filter(field => !formData[field.key]);

    // Validação condicional para Professor
    if (formData.departamento === 'Docência' && !formData.num_agente) {
      missingFields.push({ key: 'num_agente', label: 'Número de Agente' });
    }

    if (missingFields.length > 0) {
      alert(`Por favor, preencha os seguintes campos obrigatórios:\n- ${missingFields.map(f => f.label).join('\n- ')}`);
      return;
    }

    // Encontrar ID do cargo selecionado
    const selectedCargoObj = cargosDisponiveis.find(c => c.nome_seccao_cargo === formData.cargo);
    const cargoId = selectedCargoObj ? selectedCargoObj.id_seccao_cargo : 1;

    const employeeData = {
      nome: formData.nome,
      cargo: formData.cargo,
      cargoId: cargoId,
      dept: formData.departamento,
      email: formData.email,
      status: formData.status,
      foto: foto,
      bi: formData.bi,
      nascimento: formData.nascimento,
      endereco: formData.endereco,
      telefone: formData.telefone,
      num_agente: formData.num_agente,
      dataAdmissao: formData.admissao,
      sexo: formData.sexo,
      estadoCivil: formData.estadoCivil
    };


    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, employeeData);
      addHistoryEvent({
        data: new Date().toISOString(),
        evento: 'Atualização Cadastral',
        tipo: 'sistema',
        funcionario: employeeData.nome,
        cargo: employeeData.cargo,
        dept: employeeData.dept,
        resultadoQuantitativo: '-',
        resultadoQualitativo: 'Dados Atualizados'
      });
      navigate('/funcionarios');
    } else {
      const result = await addEmployee(employeeData);
      if (result.success) {
        addHistoryEvent({
          data: new Date().toISOString(),
          evento: 'Admissão de Funcionário',
          tipo: 'promocao',
          funcionario: employeeData.nome,
          cargo: employeeData.cargo,
          dept: employeeData.dept,
          resultadoQuantitativo: 'N/A',
          resultadoQualitativo: 'Concluído'
        });
        navigate('/funcionarios');
      } else {
        alert(`Erro ao cadastrar: ${result.message}`);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}</h1>
          <p style={{ color: '#64748b' }}>{editingEmployee ? 'Atualize os dados do colaborador' : 'Preencha os dados completos para admissão'}</p>
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
                <label>Gênero</label>
                <div className={styles.inputWrapper}>
                  <FaVenusMars className={styles.icon} />
                  <select name="sexo" onChange={handleChange} value={formData.sexo}>
                    <option value="">Selecione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Estado Civil</label>
                <div className={styles.inputWrapper}>
                  <FaRing className={styles.icon} />
                  <select name="estadoCivil" onChange={handleChange} value={formData.estadoCivil}>
                    <option value="">Selecione...</option>
                    <option value="Solteiro(a)">Solteiro(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viúvo(a)">Viúvo(a)</option>
                  </select>
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

            <h3 className={styles.sectionTitle} style={{ marginTop: '30px' }}>Dados Profissionais</h3>
            <div className={styles.gridForm}>
              <div className={styles.inputGroup}>
                <label>Departamento</label>
                <div className={styles.inputWrapper}>
                  <FaBuilding className={styles.icon} />
                  <select name="departamento" onChange={handleChange} value={formData.departamento}>
                    <option value="">Selecione...</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.nome}>{dept.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.departamento === 'Docência' && (
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
                  <select
                    name="cargo"
                    onChange={handleChange}
                    disabled={!formData.departamento}
                    value={formData.cargo}
                  >
                    <option value="">
                      {formData.departamento ? 'Selecione a Função...' : 'Selecione o Dept. primeiro'}
                    </option>
                    {cargosDisponiveis.map((cargo, index) => (
                      <option key={index} value={cargo}>{cargo}</option>
                    ))}
                  </select>
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
                <label>Status</label>
                <div className={styles.inputWrapper}>
                  <FaToggleOn className={styles.icon} />
                  <select name="status" onChange={handleChange}>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Férias">Férias</option>
                    <option value="Suspenso">Suspenso</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formFooter}>
              <button className={styles.btnSave} onClick={handleSubmit}>
                <FaSave /> {editingEmployee ? 'Salvar Alterações' : 'Cadastrar Funcionário'}
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
              {/* Pegar os últimos 3 funcionários cadastrados (invertendo a lista) */}
              {employees.slice(-3).reverse().map(emp => (
                <li key={emp.id}>
                  <div className={styles.recentIcon}>
                    {emp.foto ? (
                      <img src={emp.foto} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <FaCheckCircle />
                    )}
                  </div>
                  <div>
                    <strong>{emp.nome}</strong>
                    <span>{emp.cargo}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
