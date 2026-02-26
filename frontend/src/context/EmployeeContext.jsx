import React, { createContext, useState, useEffect } from 'react';

export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
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
  const [expenses, setExpenses] = useState([]);

  const fetchData = async () => {
    try {
      // 1. Fetch Employees
      const empRes = await fetch(getApiUrl('/employees'));
      if (empRes.ok) {
        const data = await empRes.json();
        setEmployees(data.map(e => ({
          id: e.id_funcionario,
          nome: e.nome_completo,
          email: e.email,
          telefone: e.telefone,
          status: e.status_funcionario === 'Activo' ? 'Ativo' : e.status_funcionario,
          cargo: e.cargo,
          foto: e.img_path
        })));
      }

      // 2. Fetch History (Evaluations)
      const histRes = await fetch(getApiUrl('/evaluations/history'));
      if (histRes.ok) {
        setHistory(await histRes.json());
      }

      // 3. Fetch Departments
      const deptRes = await fetch(getApiUrl('/departments'));
      if (deptRes.ok) {
        const raw = await deptRes.json();
        setDepartments(raw.map(d => ({
          id: d.id,
          nome: d.nome,
          head: d.head || '',
          color: d.color || 'blue',
          icon: d.icon || 'tie',
          seccoes: (d['secções'] || d.seccoes || []).map(s =>
            typeof s === 'string' ? s : s.nome_seccao
          )
        })));
      }

      // 4. Fetch Expenses
      const expRes = await fetch(getApiUrl('/expenses'));
      if (expRes.ok) {
        setExpenses(await expRes.json());
      }
    } catch (e) {
      console.error("Erro ao carregar dados do servidor:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addEmployee = async (newEmployee) => {
    try {
      const response = await fetch(getApiUrl('/employees'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_completo: newEmployee.nome,
          email: newEmployee.email,
          telefone: newEmployee.telefone,
          cargo_id: newEmployee.cargoId || 1,
          genero: newEmployee.genero,
          data_admissao: newEmployee.dataAdmissao
        })
      });

      if (response.ok) {
        await fetchData();
        return { success: true };
      } else {
        const err = await response.json();
        return { success: false, message: err.detail };
      }
    } catch (e) {
      console.error("Erro ao cadastrar funcionário:", e);
      return { success: false, message: "Erro de conexão com o servidor" };
    }
  };

  const updateEmployee = async (id, updatedData) => {
    try {
      const response = await fetch(getApiUrl(`/employees/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (response.ok) {
        await fetchData();
        return { success: true };
      }
    } catch (e) {
      console.error("Erro ao atualizar funcionário:", e);
    }
  };

  const removeEmployee = async (id) => {
    try {
      const response = await fetch(getApiUrl(`/employees/${id}`), {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchData();
        return { success: true };
      }
    } catch (e) {
      console.error("Erro ao remover funcionário:", e);
    }
  };

  const addDepartment = async (dept) => {
    try {
      const response = await fetch(getApiUrl('/departments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: dept.nome,
          head: dept.head || '',
          color: dept.color || 'blue',
          icon: dept.icon || 'tie',
          'secções': dept.seccoes || []
        })
      });
      if (response.ok) {
        await fetchData();
        return { success: true };
      } else {
        const err = await response.json();
        return { success: false, message: err.detail };
      }
    } catch (e) {
      console.error("Erro ao cadastrar departamento:", e);
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const updateDepartment = async (id, updatedData) => {
    try {
      const response = await fetch(getApiUrl(`/departments/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: updatedData.nome,
          head: updatedData.head || '',
          color: updatedData.color || 'blue',
          icon: updatedData.icon || 'tie',
          'secções': updatedData.seccoes || []
        })
      });
      if (response.ok) {
        await fetchData();
        return { success: true };
      } else {
        const err = await response.json();
        return { success: false, message: err.detail };
      }
    } catch (e) {
      console.error("Erro ao atualizar departamento:", e);
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const removeDepartment = async (id) => {
    try {
      const response = await fetch(getApiUrl(`/departments/${id}`), {
        method: 'DELETE'
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
        const response = await fetch(getApiUrl('/evaluations/submit'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

  // --- Expenses Management ---
  const addExpense = async (expenseData) => {
    try {
      const response = await fetch(getApiUrl('/expenses'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      if (response.ok) {
        await fetchData();
        return { success: true };
      }
    } catch (e) {
      console.error("Erro ao adicionar despesa:", e);
    }
    return { success: false };
  };

  const updateExpense = async (id, updatedData) => {
    try {
      const response = await fetch(getApiUrl(`/expenses/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (response.ok) {
        await fetchData();
        return { success: true };
      }
    } catch (e) {
      console.error("Erro ao atualizar despesa:", e);
    }
    return { success: false };
  };

  const removeExpense = async (id) => {
    try {
      const response = await fetch(getApiUrl(`/expenses/${id}`), {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchData();
        return { success: true };
      }
    } catch (e) {
      console.error("Erro ao remover despesa:", e);
    }
    return { success: false };
  };

  return (
    <EmployeeContext.Provider value={{
      employees, addEmployee, updateEmployee, removeEmployee,
      history, addHistoryEvent, clearHistory,
      departments, addDepartment, updateDepartment, removeDepartment,
      expenses, addExpense, updateExpense, removeExpense
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};
