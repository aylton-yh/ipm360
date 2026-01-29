import React, { useEffect, useState } from 'react';
import styles from './CardInfo.module.css';

const texto =
  "Cadastrar os funcionários no sistema IPM360º oferece diversas vantagens. Você garante maior controle sobre os dados, organiza informações importantes como BI, cargo e secção, além de permitir um acesso rápido aos perfis. O histórico de admissões, movimentações e avaliações torna-se automatizado. Também melhora a gestão de desempenho e facilita a geração de relatórios estratégicos.";

export default function CardInfo() {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < texto.length) {
      const timer = setTimeout(() => {
        setText((prev) => prev + texto[index]);
        setIndex(index + 1);
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [index]);

  return (
    <div className={styles.card}>
      <h3>📋 Vantagens do Cadastro</h3>
      <p>{text}</p>
    </div>
  );
}
