import React, { useState, useEffect, useRef, useContext } from 'react';
import { FaUserTie, FaChalkboardTeacher, FaBroom, FaLaptopCode, FaPlus, FaEllipsisH, FaEdit, FaTrash, FaSave, FaTimes, FaLayerGroup } from 'react-icons/fa';
import { AuthContext } from '../../../context/AuthContext';
import styles from './Departamentos.module.css';
import { EmployeeContext } from '../../../context/EmployeeContext';

export default function Departamentos() {
  const { departments, addDepartment, updateDepartment, removeDepartment, employees } = useContext(EmployeeContext);
  const { hasPermission } = useContext(AuthContext);
  const [menuAberto, setMenuAberto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [newDept, setNewDept] = useState({
    nome: '',
    head: '',
    color: 'blue',
    iconKey: 'tie',
    seccoes: ['']
  });

  const menuRef = useRef(null);

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setMenuAberto(menuAberto === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleAddSection = () => {
    setNewDept({ ...newDept, seccoes: [...newDept.seccoes, ''] });
  };

  const handleSectionChange = (index, value) => {
    const newSeccoes = [...newDept.seccoes];
    newSeccoes[index] = value;
    setNewDept({ ...newDept, seccoes: newSeccoes });
  };


  const iconMap = {
    'tie': <FaUserTie />,
    'chalkboard': <FaChalkboardTeacher />,
    'broom': <FaBroom />,
    'laptop': <FaLaptopCode />,
    'layer': <FaLayerGroup />
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setNewDept({ nome: '', head: '', color: 'blue', iconKey: 'tie', seccoes: [''] });
    setShowModal(true);
  };

  const handleEdit = (dept) => {
    setEditingId(dept.id);
    setNewDept({
      nome: dept.nome,
      head: dept.head,
      color: dept.color,
      iconKey: dept.icon,
      seccoes: dept.seccoes
    });
    setMenuAberto(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja eliminar este departamento?')) {
      await removeDepartment(id);
    }
    setMenuAberto(null);
  };

  const handleSave = async () => {
    if (!newDept.nome || !newDept.head) return alert('Preencha o nome e o responsável!');

    const deptToSave = {
      nome: newDept.nome,
      head: newDept.head,
      color: newDept.color,
      icon: newDept.iconKey,
      seccoes: newDept.seccoes.filter(s => s.trim() !== '')
    };

    if (editingId) {
      await updateDepartment(editingId, deptToSave);
    } else {
      await addDepartment(deptToSave);
    }

    setShowModal(false);
    setEditingId(null);
    setNewDept({ nome: '', head: '', color: 'blue', iconKey: 'tie', seccoes: [''] });
  };

  const getStaffCount = (deptName) => {
    // Conta funcionários ativos neste departamento
    return employees.filter(e => e.dept === deptName && e.status === 'Ativo').length;
  };

  return (
    <div className="page-container" onClick={() => setMenuAberto(null)}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Departamentos</h1>
          <p style={{ color: '#64748b' }}>Gestão estrutural da organização</p>
        </div>
        {hasPermission('departamentos', 'Gerir') && (
          <button className={styles.addButton} onClick={handleOpenModal}>
            <FaPlus /> Novo Departamento
          </button>
        )}
      </div>

      <div className={styles.grid}>
        {departments.map(dept => (
          <div key={dept.id} className={`${styles.deptCard} ${styles[`border-${dept.color}`]} card-modern`}>
            <div className={styles.cardHeader}>
              <div className={`${styles.iconBox} ${styles[`bg-${dept.color}`]}`}>
                {/* Safe render: lookup in map, or fallback to default if key is invalid/missing */}
                {iconMap[dept.icon] || <FaUserTie />}
              </div>

              <div className={styles.menuContainer}>
                {hasPermission('departamentos', 'Gerir') ? (
                  <>
                    <button
                      className={`${styles.moreBtn} ${menuAberto === dept.id ? styles.active : ''}`}
                      onClick={(e) => toggleMenu(dept.id, e)}
                    >
                      <FaEllipsisH />
                    </button>

                    {menuAberto === dept.id && (
                      <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.menuItem} onClick={() => handleEdit(dept)}><FaEdit /> Editar</button>
                        <div className={styles.divider}></div>
                        <button className={`${styles.menuItem} ${styles.delete}`} onClick={() => handleDelete(dept.id)}><FaTrash /> Eliminar</button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ width: '32px' }}></div> // Spacer
                )}
              </div>
            </div>

            <h2 className={styles.deptName}>{dept.nome}</h2>

            <div className={styles.statRow}>
              <div>
                <span className={styles.label}>Gestor</span>
                <p className={styles.value}>{dept.head}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={styles.label}>Equipe</span>
                <p className={styles.value}>{getStaffCount(dept.nome)} Colaboradores</p>
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.sectionArea}>
              <span className={styles.sectionTitle}>Seções & Áreas</span>
              <div className={styles.tags}>
                {dept.seccoes.map((sec, idx) => (
                  <span key={idx} className={styles.tag}>{sec}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL NOVO DEPARTAMENTO */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? 'Editar Departamento' : 'Novo Departamento'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Nome do Departamento</label>
                <input
                  type="text"
                  value={newDept.nome}
                  onChange={e => setNewDept({ ...newDept, nome: e.target.value })}
                  placeholder="Ex: Marketing Digital"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Gestor Responsável</label>
                <input
                  type="text"
                  value={newDept.head}
                  onChange={e => setNewDept({ ...newDept, head: e.target.value })}
                  placeholder="Ex: Sofia Almeida"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Cor Identificadora</label>
                  <select value={newDept.color} onChange={e => setNewDept({ ...newDept, color: e.target.value })}>
                    <option value="blue">Azul</option>
                    <option value="green">Verde</option>
                    <option value="orange">Laranja</option>
                    <option value="purple">Roxo</option>
                    <option value="pink">Rosa</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Ícone</label>
                  <select value={newDept.iconKey} onChange={e => setNewDept({ ...newDept, iconKey: e.target.value })}>
                    <option value="tie">Corporativo</option>
                    <option value="chalkboard">Ensino</option>
                    <option value="broom">Serviços</option>
                    <option value="laptop">Tecnologia</option>
                    <option value="layer">Geral</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Seções / Cargos (Adicione quantos precisar)</label>
                {newDept.seccoes.map((sec, index) => (
                  <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={sec}
                      onChange={e => handleSectionChange(index, e.target.value)}
                      placeholder={`Seção ${index + 1}`}
                    />
                  </div>
                ))}
                <button className={styles.addBtnSmall} onClick={handleAddSection}>
                  <FaPlus /> Adicionar Seção
                </button>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSave} onClick={handleSave}>
                <FaSave /> Salvar Departamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
