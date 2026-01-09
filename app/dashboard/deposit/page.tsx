'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

type QRCode = {
  id: string;
  method: string;
  qr_url: string;
};

export default function DepositPage() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);

  useEffect(() => {
    async function fetchQRCodes() {
      const { data, error } = await supabase
        .from<'payment_qrcodes', QRCode>('payment_qrcodes')
        .select('*');

      if (error) {
        console.error('Error fetching QR codes:', error.message);
        return;
      }

      setQRCodes(data || []);
    }

    fetchQRCodes();
  }, []);

  const methods = ['cashapp', 'paypal', 'chime'];

  return (
    <div style={{ padding: 20 }}>
      <h1>Deposit</h1>
      <div style={{ padding: 0, textAlign: 'center' }}>
        <p style={{ marginTop: 20, fontSize: 18 }}>
          You can get 150% first deposit bonus right away. <br />
          Join Drift or Facebook page to send screenshot of payment.
        </p>
        <button
          style={{
            padding: '12px 20px',
            fontSize: 16,
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
          }}
          onClick={() => {
            if (window.Drift) window.Drift.api.startInteraction();
            else alert('Drift not loaded');
          }}
        >
          Drift
        </button>
        &nbsp;
        <button
          style={{
            padding: '12px 20px',
            fontSize: 16,
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
          }}
          onClick={() =>
            window.location.href =
              'https://www.facebook.com/profile.php?id=61561430649793'
          }
        >
          Facebook
        </button>
      </div>

      {methods.map((method) => {
        const codes = qrCodes.filter(
          (qr) => qr.method.toLowerCase() === method
        );
        return (
          <div key={method} style={{ marginBottom: 30 }}>
            <h2>{method.toUpperCase()}</h2>
            {codes.length === 0 ? (
              <p>No QR codes available for {method}</p>
            ) : (
              codes.map((qr) => (
                <img
                  key={qr.id}
                  src={qr.qr_url}
                  alt={`${method} QR`}
                  width={150}
                  style={{ marginRight: 10, marginBottom: 10 }}
                />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
