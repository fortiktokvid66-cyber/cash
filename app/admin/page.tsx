'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const ADMIN_PASSWORD = 'adminsubodh'; // Simple hardcoded password

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [requests, setRequests] = useState<any[]>([]);
  const [qrcodes, setQRCodes] = useState<any[]>([]);

  // Login handler
  function handleLogin() {
    if (passwordInput === ADMIN_PASSWORD) setLoggedIn(true);
    else alert('Incorrect password!');
  }

  // Fetch Freeplay requests and QR codes
  useEffect(() => {
    if (!loggedIn) return;

    async function fetchRequests() {
      const { data, error } = await supabase
        .from('freeplay_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return alert(error.message);
      setRequests(data);
    }

    async function fetchQRCodes() {
      const { data, error } = await supabase.from('payment_qrcodes').select('*');
      if (error) return alert(error.message);
      setQRCodes(data);
    }

    fetchRequests();
    fetchQRCodes();
  }, [loggedIn]);

  // Mark freeplay request as loaded
  const markAsLoaded = async (id: string) => {
    const { error } = await supabase
      .from('freeplay_requests')
      .update({ loaded: true })
      .eq('id', id);
    if (error) return alert(error.message);

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, loaded: true } : r))
    );
  };

  // Upload new QR code
  async function addQRCode(method: string, qrUrl: string) {
    const { data, error } = await supabase.from('payment_qrcodes').insert({ method, qr_url: qrUrl }).select();
    if (error) return alert(error.message);
    setQRCodes([...qrcodes, ...data]);
    alert('QR code added!');
  }

  if (!loggedIn) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Admin Login</h1>
        <input
          type="password"
          placeholder="Enter password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      {/* Freeplay Requests */}
      <section style={{ marginBottom: 40 }}>
        <h2>Freeplay Requests</h2>
        {requests.length === 0 ? (
          <p>No requests yet</p>
        ) : (
          <table border={1} cellPadding={5} cellSpacing={0}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Game</th>
                <th>Game Username</th>
                <th>Task Completed</th>
                <th>Loaded</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.user_id}</td>
                  <td>{r.game_name}</td>
                  <td>{r.game_username}</td>
                  <td>{r.task_completed ? 'Yes' : 'No'}</td>
                  <td>{r.loaded ? 'Yes' : 'No'}</td>
                  <td>
                    {!r.loaded && (
                      <button
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: 5,
                          cursor: 'pointer'
                        }}
                        onClick={() => markAsLoaded(r.id)}
                      >
                        Mark as Loaded
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* QR Codes */}
      <section>
        <h2>Payment QR Codes</h2>

        <div>
          {qrcodes.length === 0 ? (
            <p>No QR codes uploaded yet</p>
          ) : (
            qrcodes.map((qr) => (
              <div key={qr.id} style={{ marginBottom: 10 }}>
                <strong>{qr.method.toUpperCase()}:</strong>{' '}
                <img src={qr.qr_url} alt={qr.method} width={100} style={{ marginLeft: 10, marginRight: 10 }} />
                <button
                  style={{
                    background: 'red',
                    color: 'white',
                    padding: '3px 8px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={async () => {
                    if (!qr.id) return alert('QR code id not found');
                    if (!confirm('Are you sure you want to delete this QR code?')) return;

                    const { error } = await supabase.from('payment_qrcodes').delete().eq('id', qr.id);
                    if (error) return alert(error.message);

                    setQRCodes(qrcodes.filter((q) => q.id !== qr.id));
                    alert('QR code deleted!');
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 20 }}>
          <h3>Add New QR Code</h3>
          <select id="methodSelect">
            <option value="cashapp">CashApp</option>
            <option value="paypal">PayPal</option>
            <option value="chime">Chime</option>
          </select>
          <input id="qrUrlInput" placeholder="Enter QR image URL" style={{ marginLeft: 10 }} />
          <button
            style={{ marginLeft: 10 }}
            onClick={() => {
              const method = (document.getElementById('methodSelect') as HTMLSelectElement).value;
              const qrUrl = (document.getElementById('qrUrlInput') as HTMLInputElement).value;
              addQRCode(method, qrUrl);
            }}
          >
            Add QR Code
          </button>
        </div>
      </section>
    </div>
  );
}
