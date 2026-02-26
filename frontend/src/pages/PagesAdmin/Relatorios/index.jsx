import React, { useState, useContext } from 'react';
import { FaSearch, FaFilePdf, FaFileExcel, FaChartBar, FaUsers, FaDownload, FaFilter, FaCalendarAlt, FaCloudDownloadAlt, FaArrowLeft, FaCheckCircle, FaHistory, FaEye, FaTimes, FaPrint } from 'react-icons/fa';
import { EmployeeContext } from '../../../context/EmployeeContext';
import { AuthContext } from '../../../context/AuthContext';
import styles from './Relatorios.module.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';

export default function Relatorios() {
  const { history, departments, employees } = useContext(EmployeeContext);
  const { hasPermission } = useContext(AuthContext);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [view, setView] = useState('list'); // 'list' | 'create'
  const [searchTerm, setSearchTerm] = useState('');
  const [previewReport, setPreviewReport] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFormatOptions, setShowFormatOptions] = useState(null);

  // Estados para o formulário de criação
  const [createForm, setCreateForm] = useState({
    tipo: 'Desempenho Geral',
    departamento: 'Todos',
    funcionario: 'Todos',
    dataInicio: '',
    dataFim: '',
    formato: 'pdf'
  });

  // Transformar Histórico em "Relatórios" dinâmicos
  const reports = history.map(item => ({
    id: item.id,
    title: `${item.evento} - ${item.funcionario}`,
    category: item.dept,
    date: new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    size: `${(Math.random() * 5 + 1).toFixed(1)} MB`, // Simulado baseado no volume de dados
    type: item.tipo === 'avaliacao' ? 'pdf' : 'excel',
    rawDate: new Date(item.data)
  }));

  const categories = [
    { name: 'Todos', icon: null },
    ...departments.map(d => ({ name: d.nome, icon: <FaUsers /> })),
    { name: 'Histórico', icon: <FaHistory /> },
  ];

  const filteredReports = reports.filter(r => {
    const passesCategory = selectedCategory === 'Todos' || r.category === selectedCategory;
    const passesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase());
    return passesCategory && passesSearch;
  });

  // Cálculos dinâmicos para os cards baseados no filtro ATUAL
  const totalGerados = filteredReports.length;

  const agora = new Date();
  const downloadsMes = filteredReports.filter(r =>
    r.rawDate.getMonth() === agora.getMonth() &&
    r.rawDate.getFullYear() === agora.getFullYear()
  ).length;

  // Encontrar a categoria mais frequente no filtro
  const categoryCounts = filteredReports.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});
  const maisAcessado = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const getFinalGrade = (employeeName) => {
    const employeeEvaluations = history.filter(h => h.funcionario === employeeName && h.tipo === 'avaliacao');
    if (employeeEvaluations.length === 0) return 'N/A';

    const totalSum = employeeEvaluations.reduce((acc, evalItem) => {
      const evalSum = (evalItem.criterios || []).reduce((s, c) => s + parseFloat(c.nota || 0), 0);
      return acc + evalSum;
    }, 0);

    return (totalSum / employeeEvaluations.length).toFixed(1);
  };

  const handleDownload = async (report, forcedFormat = null) => {
    const format = forcedFormat || report.type;
    setIsDownloading(true);
    const originalItem = history.find(h => h.id === report.id);

    try {
      if (format === 'pdf') {
        const doc = new jsPDF();

        // Cabeçalho / Logo (Verde IPM360)
        doc.setFillColor(46, 125, 50);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('IPM360°', 15, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('SISTEMA DE GESTÃO DE DESEMPENHO', 15, 32);

        // Corpo do Relatório
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(18);
        doc.text('RELATÓRIO DE ATIVIDADE', 15, 55);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Identificador: #REL-${report.id}  |  Emissão: ${report.date}`, 15, 62);

        const mainData = [
          ['Funcionário', originalItem?.funcionario || 'N/A'],
          ['Departamento', report.category],
          ['Evento', originalItem?.evento || 'N/A'],
          ['Métrica Atual', originalItem?.resultadoQuantitativo || 'N/A'],
          ['Nota Final (Média)', getFinalGrade(originalItem?.funcionario)],
        ];

        doc.autoTable({
          startY: 70,
          head: [['Atributo', 'Detalhes']],
          body: mainData,
          theme: 'striped',
          headStyles: { fillColor: [46, 125, 50] },
          styles: { fontSize: 10, cellPadding: 5 }
        });

        if (originalItem?.criterios && originalItem.criterios.length > 0) {
          doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15,
            head: [['Critério de Avaliação', 'Nota']],
            body: originalItem.criterios.map(c => [c.nome, c.nota]),
            theme: 'grid',
            headStyles: { fillColor: [100, 116, 139] }
          });
        }

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Documento gerado digitalmente pelo IPM360°. Autenticidade garantida.', 105, 285, { align: 'center' });

        doc.save(`${report.title.replace(/\s+/g, '_')}.pdf`);
      } else if (format === 'excel' || format === 'xlsx') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Relatório');

        worksheet.columns = [
          { header: 'CAMPO', key: 'label', width: 30 },
          { header: 'INFORMAÇÃO', key: 'value', width: 50 }
        ];

        // Header Style
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.addRow({ label: 'SISTEMA', value: 'IPM360°' });
        worksheet.addRow({ label: 'DOCUMENTO', value: report.title });
        worksheet.addRow({ label: 'DATA DE EMISSÃO', value: report.date });
        worksheet.addRow({ label: 'DEPARTAMENTO', value: report.category });
        worksheet.addRow({}); // Empty line

        worksheet.addRow({ label: 'DADOS DO FUNCIONÁRIO', value: '' });
        worksheet.getRow(worksheet.rowCount).font = { bold: true };

        worksheet.addRow({ label: 'NOME', value: originalItem?.funcionario });
        worksheet.addRow({ label: 'EVENTO', value: originalItem?.evento });
        worksheet.addRow({ label: 'NOTA FINAL (MÉDIA)', value: getFinalGrade(originalItem?.funcionario) });
        worksheet.addRow({ label: 'MÉTRICA ATUAL', value: originalItem?.resultadoQuantitativo });
        worksheet.addRow({ label: 'AVALIAÇÃO QUALITATIVA', value: originalItem?.resultadoQualitativo });

        if (originalItem?.criterios) {
          worksheet.addRow({});
          worksheet.addRow({ label: 'DETALHAMENTO DE CRITÉRIOS', value: '' });
          worksheet.getRow(worksheet.rowCount).font = { bold: true };
          originalItem.criterios.forEach(c => {
            worksheet.addRow({ label: c.nome, value: c.nota });
          });
        }

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${report.title.replace(/\s+/g, '_')}.xlsx`);
      } else if (format === 'word' || format === 'docx') {
        // Geração de Word real com docx
        const document = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "IPM360°",
                    bold: true,
                    size: 48,
                    color: "2E7D32",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                text: "SISTEMA DE GESTÃO DE DESEMPENHO",
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "RELATÓRIO DE ATIVIDADE",
                    bold: true,
                    size: 32,
                  }),
                ],
                spacing: { before: 200, after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Relatório: ${report.title}`, bold: true }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: `Data de Emissão: ${report.date}`,
                spacing: { after: 400 },
              }),

              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: "CAMPO", bold: true })], shading: { fill: "f1f5f9" } }),
                      new TableCell({ children: [new Paragraph({ text: "DETALHAMENTO", bold: true })], shading: { fill: "f1f5f9" } }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Funcionário")] }),
                      new TableCell({ children: [new Paragraph(originalItem?.funcionario || "N/A")] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Departamento")] }),
                      new TableCell({ children: [new Paragraph(report.category)] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Evento")] }),
                      new TableCell({ children: [new Paragraph(originalItem?.evento || "N/A")] }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Nota Final (Média)")] }),
                      new TableCell({ children: [new Paragraph(getFinalGrade(originalItem?.funcionario) || "N/A")] }),
                    ],
                  }),
                ],
              }),

              new Paragraph({
                text: "Documento oficial gerado autonomamente pelo sistema IPM360°.",
                alignment: AlignmentType.CENTER,
                spacing: { before: 800 },
              }),
            ],
          }],
        });

        const blob = await Packer.toBlob(document);
        saveAs(blob, `${report.title.replace(/\s+/g, '_')}.docx`);
      }
    } catch (error) {
      console.error("Erro no download:", error);
      alert("Erro ao processar o arquivo.");
    } finally {
      setIsDownloading(false);
      setShowFormatOptions(null);
    }
  };

  const handleCreateReport = () => {
    setIsDownloading(true);
    setTimeout(() => {
      // Simulação de geração baseada no form
      const simulatedReport = {
        title: `Relatório de ${createForm.tipo}`,
        id: Math.floor(Math.random() * 9000) + 1000,
        date: new Date().toLocaleDateString('pt-BR'),
        category: createForm.departamento !== 'Todos' ? createForm.departamento : 'Geral'
      };
      handleDownload(simulatedReport, createForm.formato);
      setView('list');
    }, 2000);
  };

  const ReportPreviewModal = ({ report, onClose }) => {
    if (!report) return null;

    // Buscar o item original do histórico para exibir detalhes reais
    const originalItem = history.find(h => h.id === report.id);

    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.previewModal} onClick={e => e.stopPropagation()}>
          <div className={styles.previewHeader}>
            <div className={styles.previewTitleWrapper}>
              <div className={`${styles.previewIcon} ${report.type === 'pdf' ? styles.pdf : styles.excel}`}>
                {report.type === 'pdf' ? <FaFilePdf /> : <FaFileExcel />}
              </div>
              <div>
                <h2 className={styles.modalTitle}>Pré-visualização do Relatório</h2>
                <p className={styles.modalSubtitle}>{report.title}</p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose}><FaTimes /></button>
          </div>

          <div className={styles.previewContent}>
            <div className={styles.previewA4}>
              <div className={styles.a4Header}>
                <div className={styles.a4Logo}>IPM360°</div>
                <div className={styles.a4DocType}>RELATÓRIO DE {report.type.toUpperCase()}</div>
              </div>

              <div className={styles.a4DetailGrid}>
                <div className={styles.a4Field}>
                  <label>Funcidionário</label>
                  <span>{originalItem?.funcionario}</span>
                </div>
                <div className={styles.a4Field}>
                  <label>Departamento</label>
                  <span>{report.category}</span>
                </div>
                <div className={styles.a4Field}>
                  <label>Data de Emissão</label>
                  <span>{report.date}</span>
                </div>
                <div className={styles.a4Field}>
                  <label>Cód. Relatório</label>
                  <span>#REL-{report.id}-{new Date().getFullYear()}</span>
                </div>
              </div>

              <div className={styles.a4Body}>
                <h4>Resumo da Atividade</h4>
                <p>Este documento certifica a realização do evento <strong>{originalItem?.evento}</strong> no sistema IPM360°. Abaixo encontram-se os detalhes registrados no período.</p>

                <table className={styles.a4Table}>
                  <thead>
                    <tr>
                      <th>Campo</th>
                      <th>Descrição/Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Tipo de Evento</td>
                      <td>{originalItem?.tipo.toUpperCase()}</td>
                    </tr>
                    <tr>
                      <td>Nota Final (Média)</td>
                      <td><strong>{getFinalGrade(originalItem?.funcionario)}</strong></td>
                    </tr>
                    <tr>
                      <td>Resultado Quantitativo</td>
                      <td>{originalItem?.resultadoQuantitativo}</td>
                    </tr>
                    <tr>
                      <td>Resultado Qualitativo</td>
                      <td>{originalItem?.resultadoQualitativo}</td>
                    </tr>
                  </tbody>
                </table>

                {originalItem?.criterios && originalItem.criterios.length > 0 && (
                  <div className={styles.a4Criterias}>
                    <h4>Critérios Avaliados</h4>
                    <div className={styles.criteriaPills}>
                      {originalItem.criterios.map((c, i) => (
                        <div key={i} className={styles.a4Pill}>
                          {c.nome}: <strong>{c.nota}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.a4Footer}>
                <div className={styles.a4Signature}>
                  <div className={styles.line}></div>
                  <span>Assinatura Digital IPM360°</span>
                </div>
                <p>Este relatório foi gerado automaticamente e possui validade jurídica interna.</p>
              </div>
            </div>
          </div>

          <div className={styles.previewFooter}>
            <button className={styles.btnSecondary} onClick={onClose}>Fechar</button>
            <button className={styles.btnPrint} onClick={() => window.print()}>
              <FaPrint /> Imprimir
            </button>
            <button className={styles.btnPrimary} onClick={() => { handleDownload(report); onClose(); }}>
              <FaDownload /> Baixar Agora
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (view === 'create') {
    return (
      <div className="page-container">
        <div className={styles.header}>
          <div>
            <div className={styles.breadcrumb}>
              <button onClick={() => setView('list')} className={styles.backLink}>
                <FaArrowLeft /> Voltar para Relatórios
              </button>
            </div>
            <h1 className={styles.pageTitle} style={{ marginTop: 10 }}>Gerar Novo Relatório</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Configure os parâmetros para extração de dados.</p>
          </div>
        </div>

        <div className={styles.createFormContainer}>
          <div className={styles.formGrid}>
            <div className={styles.formSection}>
              <label>Tipo de Relatório</label>
              <select
                className={styles.selectInput}
                value={createForm.tipo}
                onChange={(e) => setCreateForm({ ...createForm, tipo: e.target.value })}
              >
                <option>Desempenho Geral</option>
                <option>Financeiro e Custos</option>
                <option>Absenteísmo e Faltas</option>
                <option>Histórico de Eventos</option>
                <option>Distribuição por Cargos</option>
              </select>
            </div>

            <div className={styles.formSection}>
              <label>Departamento</label>
              <select
                className={styles.selectInput}
                value={createForm.departamento}
                onChange={(e) => setCreateForm({ ...createForm, departamento: e.target.value, funcionario: 'Todos' })}
              >
                <option value="Todos">Todos os Departamentos</option>
                {departments.map(d => <option key={d.id} value={d.nome}>{d.nome}</option>)}
              </select>
            </div>

            <div className={styles.formSection}>
              <label>Funcionário Específico</label>
              <select
                className={styles.selectInput}
                value={createForm.funcionario}
                onChange={(e) => setCreateForm({ ...createForm, funcionario: e.target.value })}
              >
                <option value="Todos">Todos os Funcionários</option>
                {employees
                  .filter(e => createForm.departamento === 'Todos' || e.dept === createForm.departamento)
                  .map(e => <option key={e.id} value={e.nome}>{e.nome}</option>)
                }
              </select>
            </div>

            <div className={styles.formSection}>
              <label>Período Inicial</label>
              <input
                type="date"
                className={styles.dateInput}
                value={createForm.dataInicio}
                onChange={(e) => setCreateForm({ ...createForm, dataInicio: e.target.value })}
              />
            </div>

            <div className={styles.formSection}>
              <label>Período Final</label>
              <input
                type="date"
                className={styles.dateInput}
                value={createForm.dataFim}
                onChange={(e) => setCreateForm({ ...createForm, dataFim: e.target.value })}
              />
            </div>

            <div className={styles.formSection}>
              <label>Formato de Saída</label>
              <div className={styles.formatSelector}>
                <button
                  className={`${styles.formatBtn} ${createForm.formato === 'pdf' ? styles.activeFormat : ''}`}
                  onClick={() => setCreateForm({ ...createForm, formato: 'pdf' })}
                >
                  <FaFilePdf /> PDF
                </button>
                <button
                  className={`${styles.formatBtn} ${createForm.formato === 'excel' ? styles.activeFormat : ''}`}
                  onClick={() => setCreateForm({ ...createForm, formato: 'excel' })}
                >
                  <FaFileExcel /> Excel
                </button>
                <button
                  className={`${styles.formatBtn} ${createForm.formato === 'word' ? styles.activeFormat : ''}`}
                  onClick={() => setCreateForm({ ...createForm, formato: 'word' })}
                >
                  <FaFilePdf style={{ color: '#2b5797' }} /> Word
                </button>
              </div>
            </div>
          </div>

          <button className={styles.btnGenerateLarge} onClick={handleCreateReport}>
            <FaCheckCircle /> Processar e Gerar Relatório
          </button>
        </div>
      </div>
    );
  }

  if (!hasPermission('relatorios', 'Acessar')) {
    return (
      <div className="page-container">
        <div className="card-modern" style={{ textAlign: 'center', padding: '50px' }}>
          <h2 style={{ color: '#ef4444' }}>Acesso Negado</h2>
          <p>Você não tem permissão para acessar a central de relatórios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Central de Relatórios</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gere, visualize e exporte dados estratégicos.</p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnGenerate} onClick={() => setView('create')}>
            <FaCloudDownloadAlt /> Gerar Novo Relatório
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}><FaFilePdf /></div>
          <div className={styles.kpiInfo}>
            <span>Total Gerados</span>
            <strong>{totalGerados}</strong>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#f0fdf4', color: '#22c55e' }}><FaCloudDownloadAlt /></div>
          <div className={styles.kpiInfo}>
            <span>No Período (Mês)</span>
            <strong>{downloadsMes}</strong>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#fff7ed', color: '#f97316' }}><FaChartBar /></div>
          <div className={styles.kpiInfo}>
            <span>Top Departamento</span>
            <strong style={{ fontSize: '14px' }}>{maisAcessado}</strong>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className={styles.toolbar}>
        <div className={styles.categoryTabs}>
          {categories.map(cat => (
            <button
              key={cat.name}
              className={`${styles.tabBtn} ${selectedCategory === cat.name ? styles.activeTab : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div className={styles.searchBox}>
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar relatório..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className={styles.reportsGrid}>
        {filteredReports.map(report => (
          <div key={report.id} className={styles.reportCard}>
            <div className={styles.cardHeader}>
              <div className={`${styles.fileIcon} ${report.type === 'pdf' ? styles.pdf : styles.excel}`}>
                {report.type === 'pdf' ? <FaFilePdf /> : <FaFileExcel />}
              </div>
              <div className={styles.cardActionGroup}>
                <button className={styles.actionIconBtn} onClick={() => setPreviewReport(report)} title="Pré-visualizar">
                  <FaEye />
                </button>
                <div className={styles.downloadDropdownWrapper}>
                  <button
                    className={styles.actionIconBtn}
                    onClick={() => setShowFormatOptions(showFormatOptions === report.id ? null : report.id)}
                    title="Baixar em formato..."
                  >
                    <FaDownload />
                  </button>
                  {showFormatOptions === report.id && (
                    <div className={styles.formatPopover}>
                      {hasPermission('relatorios', 'Exportar PDF') && (
                        <button onClick={() => handleDownload(report, 'pdf')}><FaFilePdf color="#ef4444" /> PDF</button>
                      )}
                      {hasPermission('relatorios', 'Exportar Excel') && (
                        <button onClick={() => handleDownload(report, 'excel')}><FaFileExcel color="#16a34a" /> Excel</button>
                      )}
                      <button onClick={() => handleDownload(report, 'word')}><FaFilePdf color="#2b5797" /> Word</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.cardBody}>
              <span className={styles.reportCategory}>{report.category}</span>
              <h3 className={styles.reportTitle}>{report.title}</h3>

              <div className={styles.cardFooter}>
                <span><FaCalendarAlt /> {report.date}</span>
                <span>{report.size}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewReport && (
        <ReportPreviewModal
          report={previewReport}
          onClose={() => setPreviewReport(null)}
        />
      )}

      {/* Overlay de Download */}
      {isDownloading && (
        <div className={styles.downloadOverlay}>
          <div className={styles.downloadLoader}>
            <div className={styles.spinner}></div>
            <h3>Gerando Documento...</h3>
            <p>Por favor, aguarde enquanto preparamos seu relatório.</p>
          </div>
        </div>
      )}
    </div>
  );
}
