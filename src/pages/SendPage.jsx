// src/pages/SendPage.jsx
import { useState } from 'react';
import axios from 'axios';

export default function SendPage() {
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');

  const send = async () => {
    try {
      await axios.post('http://localhost:3001/api/whatsapp/send', {
        number,
        message
      });
      setFeedback('✅ Mensagem enviada!');
    } catch {
      setFeedback('❌ Erro ao enviar');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Enviar Mensagem</h2>
      <input
        value={number}
        onChange={e => setNumber(e.target.value)}
        placeholder="Número com DDD"
      />
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Mensagem"
      />
      <button onClick={send}>Enviar</button>
      <p>{feedback}</p>
    </div>
  );
}
