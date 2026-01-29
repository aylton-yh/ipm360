import React, { useEffect, useState } from 'react';
import style from './CardSuporte.module.css';

const texto =
  "O Nosso sistema visa melhorar o estado e a realização das avaliações nas organizações, ela integra critérios de avaliações, Feedbacks diversificados, Paineis de Medição de Productividade, Relatórios por secão e etc.";

export default function CardSuporte() {
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
    <div className={style.card}>
      <h3>Bem-vindo ao IPM360º</h3>
      <p>{text}</p>
    </div>
  );
}
