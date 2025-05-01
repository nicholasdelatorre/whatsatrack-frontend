import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

export default function ReceivedMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const clientId = 'whats-track-1';

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('client_id', clientId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar mensagens:', error.message);
      } else {
        setMessages(data || []);
      }

      setLoading(false);
    };

    fetchMessages();

    const channel = supabase
      .channel('realtime:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          setMessages(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📨 Mensagens Recebidas</h2>

      {loading && <p>Carregando mensagens...</p>}

      {!loading && messages.length === 0 && (
        <p>Nenhuma mensagem recebida ainda.</p>
      )}

      {!loading && messages.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {messages.map((msg) => (
            <li key={msg.id} style={{ marginBottom: 15, padding: 10, border: '1px solid #ddd', borderRadius: 8 }}>
              <p><strong>De:</strong> {msg.from_number}</p>
              <p><strong>Mensagem:</strong> {msg.body}</p>
              <p style={{ fontSize: 12, color: '#666' }}>
                {new Date(msg.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
