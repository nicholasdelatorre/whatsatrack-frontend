import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

export default function QrPage() {
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState('Carregando...');

  useEffect(() => {
    const clientId = 'whats-track-1';

    // Função para buscar o status e QR Code atuais
    const fetchInitialData = async () => {
      try {
        // Buscar status atual
        const { data: statusData, error: statusError } = await supabase
          .from('whatsapp_status')
          .select('status')
          .eq('client_id', clientId)
          .maybeSingle();

        if (statusError) throw statusError;
        if (statusData?.status) setStatus(statusData.status);

        // Buscar QR Code atual
        const { data: qrData, error: qrError } = await supabase
          .from('qr_codes')
          .select('code_base64')
          .eq('client_id', clientId)
          .maybeSingle();

        if (qrError) throw qrError;
        if (qrData?.code_base64) setQr(qrData.code_base64);
      } catch (error) {
        console.error('Erro ao buscar dados iniciais:', error.message);
        setStatus('Erro ao carregar dados.');
      }
    };

    fetchInitialData();

    // Canal Realtime para atualizações de status
    const statusChannel = supabase
      .channel('realtime:whatsapp_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_status',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          setStatus(payload.new.status);
        }
      )
      .subscribe();

    // Canal Realtime para atualizações de QR Code
    const qrChannel = supabase
      .channel('realtime:qr_codes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'qr_codes',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          setQr(payload.new.code_base64);
        }
      )
      .subscribe();

    // Cleanup dos canais ao desmontar o componente
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
    </div>
  );
}
