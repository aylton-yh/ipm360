import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { FaDownload, FaFilter, FaSearch, FaRegCalendarAlt, FaClipboardCheck, FaTrophy, FaUserEdit, FaExclamationCircle, FaTimes, FaUserTie, FaFilePdf, FaFileExcel, FaChevronDown, FaUserPlus, FaTrash, FaFileWord } from 'react-icons/fa';
import styles from './Historicos.module.css';
import { useNavigate } from 'react-router-dom';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { AuthContext } from '../../../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';

export default function Historicos() {
  const navigate = useNavigate();
  const { history, clearHistory, removeHistoryItem, employees } = useContext(EmployeeContext);
  const { adminHistory, currentUser, deleteAdminHistoryItem, clearAdminHistory, getApiUrl } = useContext(AuthContext);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all'); // Modified options below
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const exportRef = useRef(null);

  const historyData = useMemo(() => {
    // Mapear adminHistory para o formato do histórico de funcionários
    const formattedAdminHistory = adminHistory.map(h => ({
      id: `admin-${h.id}`,
      data: h.data,
      evento: h.evento,
      tipo: h.tipo,
      funcionario: h.nome,
      cargo: h.cargo || 'Administrador',
      dept: h.departamento || 'Geral',
      foto: h.foto,
      resultadoQuantitativo: '-',
      resultadoQualitativo: h.status === 'pending' ? 'Pendente' : (h.status === 'approved' ? 'Aprovado' : 'Recusado'),
      adminData: h // Guardar dados extras se necessário
    }));

    // Mapear history de funcionários para garantir que temos nome, cargo e dept resolvidos
    const formattedEmployeeHistory = history.map(item => {
      const empId = item.id_funcionario || item.funcionarioId || item.id_funcionario;
      const employee = employees.find(e => e.id === parseInt(empId));

      return {
        ...item,
        // Se o item já tem esses dados, mantém (fallback), senão busca no funcionário
        funcionario: item.funcionario || employee?.nome || 'N/A',
        cargo: item.cargo || employee?.cargo || 'N/A',
        dept: item.dept || employee?.dept || 'Geral',
        foto: item.foto || employee?.foto || null,
        resultadoQuantitativo: item.resultadoQuantitativo || (item.score !== undefined ? item.score : '-'),
        resultadoQualitativo: item.resultadoQualitativo || (item.tipo === 'avaliacao' ? 'Concluído' : 'Processado')
      };
    });

    return [...formattedAdminHistory, ...formattedEmployeeHistory].sort((a, b) => new Date(b.data) - new Date(a.data));
  }, [history, adminHistory, employees]);

  // Logic para filtrar os dados baseados no tempo e pesquisa
  const filteredHistory = historyData.filter(item => {
    const itemDate = new Date(item.data);
    const now = new Date();

    // Filtro de Tempo
    let passesTime = true;
    if (timeFilter === '24h') {
      const dayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      passesTime = itemDate >= dayAgo;
    } else if (timeFilter === '7d') {
      const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      passesTime = itemDate >= weekAgo;
    } else if (timeFilter === 'thisMonth') {
      passesTime = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    } else if (timeFilter === 'lastMonth') {
      const lastM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      passesTime = itemDate.getMonth() === lastM.getMonth() && itemDate.getFullYear() === lastM.getFullYear();
    } else if (timeFilter === 'thisYear') {
      passesTime = itemDate.getFullYear() === now.getFullYear();
    }

    // Filtro de Pesquisa
    const searchLower = searchTerm.toLowerCase();
    const passesSearch =
      item.funcionario.toLowerCase().includes(searchLower) ||
      item.evento.toLowerCase().includes(searchLower) ||
      item.dept.toLowerCase().includes(searchLower);

    return passesTime && passesSearch;
  });

  // Sugestões de pesquisa (nomes únicos de funcionários ou eventos)
  const suggestions = Array.from(new Set([
    ...historyData.map(h => h.funcionario),
    ...historyData.map(h => h.evento)
  ])).filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()) && searchTerm.length > 1).slice(0, 5);

  // Cálculos dinâmicos para os cards de resumo baseados no filtro ATUAL
  const totalEventosPeriodo = filteredHistory.length;
  const totalAvaliacoes = filteredHistory.filter(item => item.tipo === 'avaliacao').length;
  const totalPromocoes = filteredHistory.filter(item => item.tipo === 'promocao').length;
  const totalPendentes = filteredHistory.filter(item => item.resultadoQualitativo === 'Pendente').length;

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'avaliacao': return <FaClipboardCheck style={{ color: '#8b5cf6' }} />;
      case 'promocao': return <FaTrophy style={{ color: '#f59e0b' }} />;
      case 'feedback': return <FaExclamationCircle style={{ color: '#3b82f6' }} />;
      case 'admin_request': return <FaUserPlus style={{ color: '#10b981' }} />;
      default: return <FaUserEdit style={{ color: '#64748b' }} />;
    }
  };

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (type) => {
    setShowExportMenu(false);
    setIsExporting(true);
    const periodLabel = timeFilter === 'all' ? 'Completo' : getTimeLabel(timeFilter).toUpperCase();
    const fileName = `Historico_IPM360_${periodLabel}_${new Date().toISOString().split('T')[0]}`;

    if (!filteredHistory || filteredHistory.length === 0) {
      alert('Não há dados no histórico para exportar com os filtros atuais.');
      setIsExporting(false);
      return;
    }

    try {
      if (type === 'PDF') {
        const doc = new jsPDF();

        // Cabeçalho
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text('INSTITUTO POLITÉCNICO MAIOMBE - IPM360', 14, 22);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Relatório de Histórico de Eventos - Período: ${periodLabel}`, 14, 30);
        doc.text(`Data de Emissão: ${new Date().toLocaleString()}`, 14, 37);

        const tableData = filteredHistory.map(item => {
          const formattedDate = item.data ? new Date(item.data).toLocaleDateString() : 'N/A';
          const qual = item.resultadoQualitativo || (item.evento === 'promocao' || item.evento === 'transferencia' ? 'Concluído' : 'Pendente');
          const quant = (item.resultadoQuantitativo && item.resultadoQuantitativo !== '-') ? ` (${item.resultadoQuantitativo})` : '';

          return [
            formattedDate,
            item.evento || 'Evento',
            item.funcionario || 'N/A',
            item.dept || 'Geral',
            qual + quant
          ];
        });

        // Verificação e Chamada Funcional (Mais estável que protótipo)
        try {
          autoTable(doc, {
            startY: 45,
            head: [['Data', 'Evento', 'Funcionário', 'Departamento', 'Resultado / Status']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [139, 92, 246] }, // Violet primary color
            styles: { fontSize: 9 }
          });
          doc.save(`${fileName}.pdf`);
        } catch (atError) {
          console.error("Erro interno autoTable:", atError);
          throw new Error(`Falha no componente de tabela: ${atError.message}`);
        }

      } else if (type === 'Excel') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Histórico');

        worksheet.columns = [
          { header: 'Data', key: 'data', width: 15 },
          { header: 'Evento', key: 'evento', width: 25 },
          { header: 'Funcionário', key: 'funcionario', width: 30 },
          { header: 'Departamento', key: 'dept', width: 20 },
          { header: 'Resultado', key: 'resultado', width: 20 }
        ];

        // Format header
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF8B5CF6' }
        };

        filteredHistory.forEach(item => {
          worksheet.addRow({
            data: item.data ? new Date(item.data).toLocaleDateString() : 'N/A',
            evento: item.evento || 'Evento',
            funcionario: item.funcionario || 'N/A',
            dept: item.dept || 'Geral',
            resultado: (item.resultadoQualitativo || 'Pendente') + ((item.resultadoQuantitativo && item.resultadoQuantitativo !== '-') ? ` (${item.resultadoQuantitativo})` : '')
          });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${fileName}.xlsx`);

      } else if (type === 'Word') {
        const tableRows = [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: "DATA", bold: true })], shading: { fill: "f1f5f9" } }),
              new TableCell({ children: [new Paragraph({ text: "EVENTO", bold: true })], shading: { fill: "f1f5f9" } }),
              new TableCell({ children: [new Paragraph({ text: "FUNCIONÁRIO", bold: true })], shading: { fill: "f1f5f9" } }),
              new TableCell({ children: [new Paragraph({ text: "DEPTO", bold: true })], shading: { fill: "f1f5f9" } }),
              new TableCell({ children: [new Paragraph({ text: "RESULTADO", bold: true })], shading: { fill: "f1f5f9" } }),
            ],
          }),
        ];

        filteredHistory.forEach(item => {
          tableRows.push(
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(item.data ? new Date(item.data).toLocaleDateString() : 'N/A')] }),
                new TableCell({ children: [new Paragraph(item.evento || 'N/A')] }),
                new TableCell({ children: [new Paragraph(item.funcionario || 'N/A')] }),
                new TableCell({ children: [new Paragraph(item.dept || 'Geral')] }),
                new TableCell({ children: [new Paragraph((item.resultadoQualitativo || 'Concluído') + (item.resultadoQuantitativo && item.resultadoQuantitativo !== '-' ? ` (${item.resultadoQuantitativo})` : ''))] }),
              ],
            })
          );
        });

        const docX = new Document({
          sections: [{
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "IPM360° - RELATÓRIO DE HISTÓRICO", bold: true, size: 32, color: "8B5CF6" }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({ text: `Período: ${periodLabel}`, spacing: { after: 200 }, alignment: AlignmentType.CENTER }),
              new Paragraph({ text: `Emissão: ${new Date().toLocaleString()}`, spacing: { after: 400 }, alignment: AlignmentType.CENTER }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: tableRows,
              }),
              new Paragraph({ text: "Documento oficial gerado autonomamente pelo sistema IPM360°.", alignment: AlignmentType.CENTER, spacing: { before: 800 } }),
            ],
          }],
        });

        const blob = await Packer.toBlob(docX);
        saveAs(blob, `${fileName}.docx`);
      }
    } catch (error) {
      console.error('ERRO_EXPORT_DEFINITIVO:', error);
      alert(`Erro ao processar o ficheiro: ${error.message || 'Falha na geração'}\n\nDetalhes técnico: ${error.stack?.substring(0, 100)}...`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenFullProfile = () => {
    // Navegar para a lista de funcionários e solicitar abertura do perfil
    navigate('/funcionarios', { state: { openProfileByName: selectedItem.funcionario } });
  };

  const getTimeLabel = (filter) => {
    switch (filter) {
      case '24h': return 'Últimas 24H';
      case '7d': return 'Últimos 7 Dias';
      case 'thisMonth': return 'Este Mês';
      case 'lastMonth': return 'Mês Passado';
      case 'thisYear': return 'Todo o Ano';
      default: return 'Todo Histórico';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Histórico de Eventos</h1>
          <p style={{ color: '#64748b' }}>Monitoramento de atividades e ciclos de vida</p>
        </div>

        {/* Botão Exportar com Dropdown */}
        <div className={styles.exportWrapper} ref={exportRef}>
          <button
            className={`${styles.exportBtn} ${showExportMenu ? styles.active : ''}`}
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <FaDownload /> Exportar <FaChevronDown size={12} style={{ marginLeft: 5 }} />
          </button>

          {showExportMenu && (
            <div className={styles.exportDropdown}>
              <button onClick={() => handleExport('PDF')} className={styles.exportOption}>
                <FaFilePdf style={{ color: '#ef4444' }} /> PDF
              </button>
              <button onClick={() => handleExport('Excel')} className={styles.exportOption}>
                <FaFileExcel style={{ color: '#10b981' }} /> Excel
              </button>
              <button onClick={() => handleExport('Word')} className={styles.exportOption}>
                <FaFileWord style={{ color: '#2b5797' }} /> Word
              </button>
            </div>
          )}
        </div>

        {currentUser?.role === 'global_admin' && (
          <button
            className={styles.clearAllBtn}
            onClick={() => {
              if (window.confirm('Tem certeza que deseja apagar TODO o histórico visualizado nesta tela?')) {
                clearAdminHistory(true); // Limpa pedidos de admin (adminHistory)
                clearHistory(true);      // Limpa eventos de funcionários (history)
                alert('O histórico foi removido com sucesso!');
              }
            }}
            style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
          >
            <FaTrash size={14} /> Limpar
          </button>
        )}
      </div>

      {/* Cards de Resumo */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Eventos ({getTimeLabel(timeFilter)})</span>
          <strong className={styles.statValue}>{totalEventosPeriodo}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avaliações</span>
          <strong className={styles.statValue}>{totalAvaliacoes}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Promoções</span>
          <strong className={styles.statValue}>{totalPromocoes}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pendentes</span>
          <strong className={styles.statValue} style={{ color: '#f59e0b' }}>{totalPendentes}</strong>
        </div>
      </div>

      <div className={`${styles.tableCard} card-modern`}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper} ref={searchRef}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por funcionário, evento..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.suggestionsDropdown}>
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    className={styles.suggestionItem}
                    onClick={() => {
                      setSearchTerm(s);
                      setShowSuggestions(false);
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.periodSelector}>
              <span className={styles.periodLabel}><FaRegCalendarAlt /> Período:</span>
              <select
                className={styles.timeSelect}
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">Todo Histórico</option>
                <option value="24h">Últimas 24H</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="thisMonth">Este Mês</option>
                <option value="lastMonth">Mês Passado</option>
                <option value="thisYear">Todo Ano</option>
              </select>
            </div>
            <button className={styles.filterBtn}><FaFilter /> Tipo</button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th width="150">Data</th>
                <th>Evento</th>
                <th>Funcionário</th>
                <th>Departamento</th>
                <th>Resultado / Status</th>
                <th align="right"></th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => (
                <tr key={item.id}>
                  <td className={styles.dateCell}>
                    <div style={{ fontWeight: '600' }}>{new Date(item.data).toLocaleDateString()}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(item.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td>
                    <div className={styles.eventCell}>
                      <div className={styles.iconBg}>{getIcon(item.tipo)}</div>
                      <span className={styles.eventName}>{item.evento}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar}>
                        {item.foto && typeof item.foto === 'string' && item.foto.length > 5 ? (
                          <img
                            src={(item.foto.startsWith('data:image') || item.foto.startsWith('http')) ? item.foto : getApiUrl('/' + item.foto)}
                            alt={item.funcionario}
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                          />
                        ) : (
                          item.funcionario.charAt(0)
                        )}
                      </div>
                      <div>
                        <span className={styles.userName}>{item.funcionario}</span>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{item.cargo}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.deptTag}>{item.dept}</span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${item.resultadoQualitativo === 'Pendente' ? styles.pending : styles.success}`}>
                      {item.resultadoQualitativo} {item.resultadoQuantitativo !== '-' ? `(${item.resultadoQuantitativo})` : ''}
                    </span>
                  </td>
                  <td align="right">
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button className={styles.detailsBtn} onClick={() => setSelectedItem(item)}>Detalhes</button>
                      {currentUser?.role === 'global_admin' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Excluir este registro permanentemente?')) {
                              if (item.id.toString().startsWith('admin-')) {
                                deleteAdminHistoryItem(item.adminData.id);
                              } else {
                                removeHistoryItem(item.id);
                              }
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}
                          title="Excluir Registro"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes Simples */}
      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>
              <FaTimes />
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalAvatar}>
                {selectedItem.foto && typeof selectedItem.foto === 'string' && selectedItem.foto.length > 5 ? (
                  <img
                    src={(selectedItem.foto.startsWith('data:image') || selectedItem.foto.startsWith('http')) ? selectedItem.foto : getApiUrl('/' + selectedItem.foto)}
                    alt={selectedItem.funcionario}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  selectedItem.funcionario.charAt(0)
                )}
              </div>
              <div>
                <h2 className={styles.modalTitle}>{selectedItem.funcionario}</h2>
                <span className={styles.modalSubtitle}>{selectedItem.cargo}</span>
              </div>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Departamento</span>
                <span className={styles.infoValue}>{selectedItem.dept}</span>
              </div>

              <div className={styles.modalDivider}></div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Evento</span>
                <span className={styles.infoValue}>{selectedItem.evento}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Data</span>
                <span className={styles.infoValue}>{new Date(selectedItem.data).toLocaleDateString()}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Resultado</span>
                <span className={`${styles.statusBadge} ${selectedItem.resultado === 'Pendente' ? styles.pending : styles.success}`}>
                  {selectedItem.resultado}
                </span>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnAction} onClick={handleOpenFullProfile}>
                <FaUserTie /> Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOVO: Modal de Perfil Completo */}
      {showFullProfile && (
        <div className={styles.modalOverlayFull} onClick={() => setShowFullProfile(false)}>
          <div className={styles.modalContentFull} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowFullProfile(false)}>
              <FaTimes />
            </button>

            <div className={styles.modalHeaderFull}></div>

            <div className={styles.modalBodyFull}>
              {/* Avatar Grande */}
              <div className={styles.largeAvatar}>
                J
              </div>

              <h2 className={styles.modalTitle} style={{ textAlign: 'center' }}>João Silva</h2>
              <span className={styles.modalSubtitle} style={{ textAlign: 'center', display: 'block' }}>Desenvolvedor Senior</span>

              <div className={styles.modalTags}>
                <span className={styles.modalTag}>TI</span>
                <span className={styles.modalTag}>Admitido em 2023</span>
                <span className={styles.modalTag}>ID: 1</span>
              </div>

              <div className={styles.infoSection}>
                <div className={styles.infoItem}>
                  <label>Email Corporativo</label>
                  <p>joao@ipm360.com</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Telefone</label>
                  <p>+244 923 000 000</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Status Atual</label>
                  <p style={{ color: '#10b981' }}>Ativo</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Localização</label>
                  <p>Luanda, Angola</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
