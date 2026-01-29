import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { BiAlignMiddle, BiLineChart } from 'react-icons/bi'
import { FaUserCircle, FaIdBadge } from 'react-icons/fa' // Importei FaIdBadge para logo
import { AiTwotoneSetting } from 'react-icons/ai'
import { RiLogoutBoxRLine } from 'react-icons/ri'
import { MdAssignment } from 'react-icons/md'
import styles from './UserLayout.module.css'

export default function UserLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname === path + '/';

  return (
    <div className={styles.layout}>
      {/* Navbar Superior */}
      <header className={styles.navbar}>
        <div className={styles.brand}>
          <div style={{fontSize: '32px', color: '#2563eb'}}><FaIdBadge /></div>
          <div className={styles.logoText}>
            <h2>IPM360°</h2>
            <span>Portal do Colaborador</span>
          </div>
        </div>

        <nav className={styles.menu}>
          <Link to='/user/home' className={`${styles.navLink} ${isActive('/user/home') || isActive('/user') ? styles.active : ''}`}>
            <BiAlignMiddle />Dashboard
          </Link>
          <Link to='/minhas-avaliacoes' className={`${styles.navLink} ${isActive('/minhas-avaliacoes') ? styles.active : ''}`}>
            <MdAssignment />Avaliações
          </Link>
          <Link to='/status' className={`${styles.navLink} ${isActive('/status') ? styles.active : ''}`}>
            <BiLineChart />Desempenho
          </Link>
          <Link to='/profile' className={`${styles.navLink} ${isActive('/profile') ? styles.active : ''}`}>
            <FaUserCircle />Meu Perfil
          </Link>
          <Link to='/settings' className={`${styles.navLink} ${isActive('/settings') ? styles.active : ''}`}>
            <AiTwotoneSetting />Ajustes
          </Link>
          <Link to='/user/login' className={styles.logoutBtn}>
            <RiLogoutBoxRLine />Sair
          </Link>
        </nav>
      </header>

      {/* Conteúdo Centralizado */}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
