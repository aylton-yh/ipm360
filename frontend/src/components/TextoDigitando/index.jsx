import { useState, useEffect } from 'react';
import styles from './TextoDigitando.module.css';

export default function TextoDigitando() {
  const frases = [
    "SEJA BEM-VINDO AO IPM-360º",
    "SEU SISTEMA DE AVALIAÇÃO DE DESEMPENHO!",
    "GERENCIE OS DADOS DA AVALIAÇÃO COM FACILIDADE",
    "CONTROLE OS ACESSOS E PERMISSÕES",
    "VISUALIZE RELATÓRIOS POR COMPLETO"
  ];
  const [indexFrase, setIndexFrase] = useState(0);
  const [textoVisivel, setTextoVisivel] = useState('');
  const [caractere, setCaractere] = useState(0);

  useEffect(() => {
    const fraseAtual = frases[indexFrase];
    if (caractere < fraseAtual.length) {
      const typing = setTimeout(() => {
        setTextoVisivel(prev => prev + fraseAtual[caractere]);
        setCaractere(c => c + 1);
      }, 100);
      return () => clearTimeout(typing);
    } else {
      const espera = setTimeout(() => {
        setCaractere(0);
        setTextoVisivel('');
        setIndexFrase((prev) => (prev + 1) % frases.length);
      }, 3000);
      return () => clearTimeout(espera);
    }
  }, [caractere, indexFrase]);

  return (
    <h2 className={styles.digitando}>{textoVisivel}</h2>
  );
}
