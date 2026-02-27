import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  const getHeaders = (contentType = 'application/json') => {
    const token = localStorage.getItem('ipm360_token');
    const headers = {};
    if (contentType) headers['Content-Type'] = contentType;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const getApiUrl = (endpoint) => {
    const host = window.location.hostname;
    let port = window.location.port;
    if (port === '5173') port = '8000';
    const portStr = port ? `:${port}` : '';
    return `http://${host}${portStr}${endpoint}`;
  };

  const [employees, setEmployees] = useState([]);
  const [history, setHistory] = useState([]);
  const [departments, setDepartments] = useState([]);

  const fetchData = async () => {
    try {
      // 1. Fetch Employees
      const empRes = await fetch(getApiUrl('/api/funcionarios'), { headers: getHeaders(null) });
      if (empRes.ok) {
        const data = await empRes.json();
        if (Array.isArray(data)) {
          setEmployees(data.map(e => ({
            id: e.id_funcionario,
            nome: e.nome_completo,
            bi: e.bi,
            nascimento: e.data_nascimento,
            endereco: e.endereco,
            telefone: e.telefone,
            email: e.email,
            dept: e.dept_nome,
            num_agente: e.num_agente,
            cargo: e.cargo_nome,
            admissao: e.data_admissao,
            sexo: e.genero,
            estadoCivil: e.estado_civil,
            status: e.status_funcionario,
            foto: e.img_path
          })));
        } else {
          console.warn("API de funcionários não retornou uma lista:", data);
          setEmployees([]);
        }
      }

      // 2. Fetch History (Evaluations)
      const histRes = await fetch(getApiUrl('/api/evaluations/history'), { headers: getHeaders(null) });
      if (histRes.ok) {
        const historyData = await histRes.json();
        setHistory(Array.isArray(historyData) ? historyData : []);
      }

      // 3. Fetch Departments
      const deptRes = await fetch(getApiUrl('/api/departments'), { headers: getHeaders(null) });
      if (deptRes.ok) {
        const raw = await deptRes.json();
        setDepartments(raw.map(d => ({
          id: d.id,
          nome: d.nome,
          head: d.head || '',
          color: d.color || 'blue',
          icon: d.icon || 'tie',
          seccoes: (d.secções || d.seccoes || []).map(s =>
            typeof s === 'string' ? { id: null, nome: s } : { id: s.id, nome: s.nome }
          )
        })));
      }

    } catch (e) {
      console.error("Erro ao carregar dados do servidor:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const addEmployee = async (newEmployee) => {
    try {
      const response = await fetch(getApiUrl('/api/funcionarios'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          nome_completo: newEmployee.nome,
          email: newEmployee.email,
          telefone: newEmployee.telefone,
          id_cargo: newEmployee.cargoId || 1,
          genero: newEmployee.sexo,
          endereco: newEmployee.endereco,
          bi: newEmployee.bi,
          data_nascimento: newEmployee.nascimento,
          estado_civil: newEmployee.estadoCivil,
          data_admissao: newEmployee.dataAdmissao,
          num_agente: newEmployee.num_agente,
          status_funcionario: newEmployee.status,
          foto: newEmployee.foto,
          username: newEmployee.username,
          password: newEmployee.password
        })
      });

      if (response.ok) {
        await fetchData();
        return { success: true };
      } else {
        const err = await response.json();
        return { success: false, message: err.error || err.detail || 'Erro desconhecido' };
      }
    } catch (e) {
      console.error("Erro ao cadastrar funcionário:", e);
      return { success: false, message: "Erro de conexão com o servidor" };
    }
  };

  const updateEmployee = async (id, updatedData) => {
    try {
      const response = await fetch(getApiUrl(`/api/funcionarios/${id}`), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          nome_completo: updatedData.nome,
          email: updatedData.email,
          telefone: updatedData.telefone,
          id_cargo: updatedData.cargoId || 1,
          genero: updatedData.sexo,
          endereco: updatedData.endereco,
          bi: updatedData.bi,
          data_nascimento: updatedData.nascimento,
          estado_civil: updatedData.estadoCivil,
          data_admissao: updatedData.dataAdmissao,
          num_agente: updatedData.num_agente,
          status_funcionario: updatedData.status,
          foto: updatedData.foto
        })
      });
      if (response.ok) {
        await fetchData();
        return { success: true };
      }
      const err = await response.json();
      return { success: false, message: err.error || err.detail || 'Erro ao atualizar' };
    } catch (e) {
      console.error("Erro ao atualizar funcionário:", e);
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const removeEmployee = async (id) => {
    try {
      const response = await fetch(getApiUrl(`/api/funcionarios/${id}`), {
        method: 'DELETE',
        headers: getHeaders(null)
      });
      if (response.ok) {
        await fetchData();
        return { success: true };
      }
    } catch (e) {
      console.error("Erro ao remover funcionário:", e);
    }
  };

  const clearAllEmployees = async () => {
    if (window.confirm('Tem certeza que deseja apagar TODOS os funcionários do sistema?')) {
        try {
            // No backend, poderíamos ter uma rota DELETE massiva.
            // Para segurança, vamos apagar um por um ou avisar.
            alert('Funcionalidade de limpeza massiva requer privilégios de super-admin no banco de dados.');
        } catch (e) {
            console.error("Erro ao limpar funcionários:", e);
        }
    }
  };

  const addDepartment = async (dept) => {
    try {
      const response = await fetch(getApiUrl('/api/departments'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          nome: dept.nome,
          head: dept.head || '',
          color: dept.color || 'blue',
          icon: dept.icon || 'tie',
          seccoes: dept.seccoes || []
        })
      });
      if (response.ok) {
        await fetchData();
        return { success: true };
      } else {
        const err = await response.json();
        return { success: false, message: err.error || 'Erro ao cadastrar' };
      }
    } catch (e) {
      console.error("Erro ao cadastrar departamento:", e);
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const updateDepartment = async (id, updatedData) => {
    try {
      const response = await fetch(getApiUrl(`/api/departments/${id}`), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          nome: updatedData.nome,
          head: updatedData.head || '',
          color: updatedData.color || 'blue',
          icon: updatedData.icon || 'tie',
          seccoes: updatedData.seccoes || []
        })
      });
      if (response.ok) {
        await fetchData();
        return { success: true };
      } else {
        const err = await response.json();
        return { success: false, message: err.error || 'Erro ao atualizar' };
      }
    } catch (e) {
      console.error("Erro ao atualizar departamento:", e);
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const removeDepartment = async (id) => {
    try {
      const response = await fetch(getApiUrl(`/api/departments/${id}`), {
        method: 'DELETE',
        headers: getHeaders(null)
      });
      if (response.ok) {
        await fetchData();
        return { success: true };
      }
    } catch (e) {
      console.error("Erro ao remover departamento:", e);
    }
  };

  const addHistoryEvent = async (event) => {
    if (event.tipo === 'avaliacao') {
      try {
        const response = await fetch(getApiUrl('/api/evaluations/submit'), {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            id_funcionario: event.funcionarioId,
            ...event.notas
          })
        });
        if (response.ok) {
          await fetchData();
          return { success: true };
        }
      } catch (e) {
        console.error("Erro ao submeter avaliação:", e);
      }
    }
    const id = history.length > 0 ? Math.max(...history.map(h => h.id)) + 1 : 1;
    setHistory(prev => [{ ...event, id }, ...prev]);
  };

  const clearHistory = (silent = false) => {
    if (silent || window.confirm('Tem certeza que deseja apagar TODO o histórico de eventos?')) {
      setHistory([]);
      localStorage.removeItem('ipm360_history');
      if (!silent) alert('Histórico de eventos limpo!');
    }
  };


  return (
    <EmployeeContext.Provider value={{
      employees, addEmployee, updateEmployee, removeEmployee, clearAllEmployees,
      history, addHistoryEvent, clearHistory,
      departments, addDepartment, updateDepartment, removeDepartment
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};
