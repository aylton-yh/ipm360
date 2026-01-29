import React from 'react';
import estilo from './EmployeeCard.module.css';
import style from './Graficos.module.css';

const EmployeeCard = ({ employee }) => {
  return (
    <div className={style.container}>
    <div className={estilo.card}>
      <div className={estilo.photoWrapper}>
        <img src={employee.photo} alt={employee.name} />
      </div>
      <div className={estilo.info}>
        <h3>{employee.name}</h3>
        <p>Departamento: {employee.department}</p>
        <p>Cargo: {employee.position}</p>
        <p>Status: {employee.status}</p>
      </div>
    </div>
    </div>
  );
};

export default EmployeeCard;
