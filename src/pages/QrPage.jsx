import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

export default function QrPage() {
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState('Carregando...');
  const [loadingInit, setLoadingInit] = useState(false);
  const [loadingDisconnect, setLoadingDisconnect] = useState(false);
  const [loadingReconnect, setLoadingReconnect] = useState(false);
  const [response, setResponse] = useState(null);

  const clientId = 'whats-track-1';
  const API_URL = 'http://localhost:3001/api/whatsapp';

  // Ações POST genéricas
  const callAction = async (endpoint, setLoading) => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${API_URL}/${endpoint}`, { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setResponse({ type: 'success', message: data.message || 'Ação executada' });
      } else {
        setResponse({ type: 'error', message: data.error || 'Erro na ação' });
      }
    } catch (err) {
      setResponse({ type: 'error', message: `Erro ao chamar /${endpoint}` });
    } finally {
      setLoading(false);
    }
  };

  const handleInit = () => callAction('init', setLoadingInit);
  const handleDisconnect = () => callAction('disconnect', setLoadingDisconnect);
  const handleReconnect = () => callAction('reconnect', setLoadingReconnect);

  // Fetch inicial: status + QR
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: statusData } = await supabase
          .from('whatsapp_status')
          .select('status')
          .eq('client_id', clientId)
          .maybeSingle();

        if (statusData?.status) {
          setStatus(statusData.status);
        }

        const { data: qrData } = await supabase
          .from('qr_codes')
          .select('code_base64')
          .eq('client_id', clientId)
          .maybeSingle();

        if (qrData?.code_base64) {
          setQr(qrData.code_base64);
        }
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err.message);
        setStatus('Erro ao carregar');
      }
    };

    fetchInitialData();

    // Realtime para status
    const statusChannel = supabase
      .channel('realtime:whatsapp_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_status',
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          setStatus(payload.new.status);
        }
      )
      .subscribe();

    // Realtime para QR
    const qrChannel = supabase
      .channel('realtime:qr_codes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'qr_codes',
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          setQr(payload.new.code_base64);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(statusChannel);
      supabase.removeChannel(qrChannel);
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Conexão com o WhatsApp</h2>
      <p><strong>Status:</strong> {status}</p>

      {status !== 'ready' && qr && (
        <>
          <p>Escaneie o QR Code abaixo com o WhatsApp Web:</p>
          <img src={qr} alt="QR Code" style={{ width: 280, marginTop: 10 }} />
        </>
      )}

      {status === 'ready' && (
        <p style={{ color: 'green', fontWeight: 'bold', marginTop: 20 }}>
          ✅ WhatsApp conectado com sucesso!
        </p>
      )}

      {/* Botões condicionais */}
      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        {status !== 'ready' && (
          <button onClick={handleInit} disabled={loadingInit}>
            {loadingInit ? 'Iniciando...' : 'Gerar QR Code'}
          </button>
        )}

        {status === 'ready' && (
          <>
            <button onClick={handleDisconnect} disabled={loadingDisconnect}>
              {loadingDisconnect ? 'Desconectando...' : 'Desconectar'}
            </button>

            <button onClick={handleReconnect} disabled={loadingReconnect}>
              {loadingReconnect ? 'Reconectando...' : 'Reconectar'}
            </button>
          </>
        )}
      </div>

      {response && (
        <p style={{ marginTop: 15, color: response.type === 'success' ? 'green' : 'red' }}>
          {response.message}
        </p>
      )}
    </div>
  );
}
