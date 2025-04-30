import { useState } from 'react';
import QrPage from './pages/QrPage';
import SendPage from './pages/SendPage';
import ReceivedPage from './pages/ReceivedPage';

function App() {
  const [tab, setTab] = useState('qr');

  return (
    <div>
      <nav style={{ display: 'flex', gap: 10, padding: 20 }}>
        <button onClick={() => setTab('qr')}>QR Code</button>
        <button onClick={() => setTab('send')}>Enviar</button>
        <button onClick={() => setTab('received')}>Mensagens</button>
      </nav>

      {tab === 'qr' && <QrPage />}
      {tab === 'send' && <SendPage />}
      {tab === 'received' && <ReceivedPage />}
    </div>
  );
}

export default App;
