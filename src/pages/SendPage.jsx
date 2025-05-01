import { useState } from 'react';

export default function SendMessagePage() {
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!to || !message) {
      setResponse({ type: 'error', message: 'Preencha todos os campos.' });
      return;
    }

    const formattedTo = to.endsWith('@c.us') ? to : `${to}@c.us`;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:3001/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: formattedTo, message })
      });

      const data = await res.json();

      if (res.ok) {
        setResponse({ type: 'success', message: data.message });
        setMessage('');
      } else {
        setResponse({ type: 'error', message: data.error || 'Erro ao enviar' });
      }
    } catch (err) {
      setResponse({ type: 'error', message: 'Erro de conexão com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Enviar Mensagem via WhatsApp</h2>

      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
        <input
          type="text"
          placeholder="Número (ex: 5511999999999)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />

        <textarea
          placeholder="Mensagem"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>

      {response && (
        <p style={{ marginTop: 15, color: response.type === 'success' ? 'green' : 'red' }}>
          {response.message}
        </p>
      )}
    </div>
  );
}
