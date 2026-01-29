import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BiAlignMiddle } from 'react-icons/bi'
import { AiOutlineUserAdd, AiTwotoneSetting } from 'react-icons/ai'
import { HiOutlineUserGroup } from 'react-icons/hi'
import { MdOutlinePublishedWithChanges } from 'react-icons/md'
import { RiLogoutBoxRLine, RiLockPasswordLine } from 'react-icons/ri'
import { TbReportSearch } from 'react-icons/tb'
import { BsInfoCircle, BsBuilding } from 'react-icons/bs'
import { FaUserCircle, FaHistory, FaChevronDown, FaChevronRight, FaList } from 'react-icons/fa'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const location = useLocation();
  const [funcionariosOpen, setFuncionariosOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  
  // Verifica se alguma rota filha está ativa para manter o menu aberto (opcional)
  // Mas o user pode querer controle manual. Vou deixar manual e abrir se o path bater.
  React.useEffect(() => {
    if (location.pathname.includes('/cadastrar-funcionario') || location.pathname.includes('/funcionarios')) {
      setFuncionariosOpen(true);
    }
  }, [location.pathname]);

  const toggleFuncionarios = () => setFuncionariosOpen(!funcionariosOpen);

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>IPM360°</h2>
        <span>Gestão de Desempenho</span>
      </div>

      <nav className={styles.menu}>
        <Link to='/dashboard' className={isActive('/dashboard') ? styles.active : ''}>
          <BiAlignMiddle />Dashboard
        </Link>
        
        {/* Menu Colapsável de Funcionários */}
        <div className={styles.menuGroup}>
          <button 
            className={`${styles.menuButton} ${(isActive('/cadastrar-funcionario') || isActive('/funcionarios')) ? styles.activeGroup : ''}`} 
            onClick={toggleFuncionarios}
          >
            <div className={styles.menuLabel}>
               <HiOutlineUserGroup /> Funcionários
            </div>
            {funcionariosOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
          </button>
          
          <div className={`${styles.submenu} ${funcionariosOpen ? styles.open : ''}`}>
             <Link to='/cadastrar-funcionario' className={isActive('/cadastrar-funcionario') ? styles.activeSub : ''}>
               <AiOutlineUserAdd /> Cadastrar
             </Link>
             <Link to='/funcionarios' className={isActive('/funcionarios') ? styles.activeSub : ''}>
               <FaList /> Lista
             </Link>
          </div>
        </div>

        <Link to='/departamentos' className={isActive('/departamentos') ? styles.active : ''}>
          <BsBuilding />Departamentos
        </Link>
        <Link to='/avaliar' className={isActive('/avaliar') ? styles.active : ''}>
          <MdOutlinePublishedWithChanges />Avaliar
        </Link>
        <Link to='/historicos' className={isActive('/historicos') ? styles.active : ''}>
          <FaHistory />Históricos
        </Link>
        <Link to='/permissoes' className={isActive('/permissoes') ? styles.active : ''}>
          <RiLockPasswordLine />Permissões
        </Link>
        <Link to='/configuracoes' className={isActive('/configuracoes') ? styles.active : ''}>
          <AiTwotoneSetting />Configurações
        </Link>
        <Link to='/minha-conta' className={isActive('/minha-conta') ? styles.active : ''}>
          <FaUserCircle />Minha Conta
        </Link>
        <Link to='/relatorios' className={isActive('/relatorios') ? styles.active : ''}>
          <TbReportSearch />Relatórios
        </Link>
        <Link to='/ajuda' className={isActive('/ajuda') ? styles.active : ''}>
          <BsInfoCircle />Ajuda
        </Link>
        <Link to='/login' className={styles.logout}>
          <RiLogoutBoxRLine />Sair
        </Link>
      </nav>
    </div>
  )
}
