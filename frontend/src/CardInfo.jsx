import React, { useEffect, useState } from 'react';
import style from './CardInfo.module.css';

const texto =
  "Cadastrar os funcionários no sistema IPM360º oferece diversas vantagens. Você garante maior controle sobre os dados, organiza informações importantes como BI, cargo e secção, além de permitir um acesso rápido aos perfis. O histórico de admissões, movimentações e avaliações torna-se automatizado. Também melhora a gestão de desempenho e facilita a geração de relatórios estratégicos. Ao centralizar tudo digitalmente, reduz-se a burocracia e aumenta a eficiência administrativa. A segurança dos dados também é reforçada. Isso contribui para decisões mais rápidas, baseadas em dados confiáveis. Além disso, possibilita integrar o cadastro com outros módulos como folha de pagamento ou controle de ponto. O resultado? Mais produtividade, menos papel e processos mais inteligentes.";

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
    <div className={style.card}>
      <h3>📋 Vantagens do Cadastro</h3>
      <p>{text}</p>
    </div>
  );
}
