'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function FreeplayPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedGame, setSelectedGame] = useState('');
  const [gameUsername, setGameUsername] = useState('');
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'loaded'>('none');

  const referralMessage = "Hey friend, I have found this amazing casino you might want to try: https://casino.com !!!";

  const games = [
    'MILKY WAY 🌌', 'CASINO ROYALE 🎲', 'VEGAS SWEEPS 🎰',
    'PANDA MASTER 🐼', 'VBLINK 🔗', 'JUWA 🐉',
    'Orion stars ✨', 'FIRE KIRIN 🔥', 'GAME VAULT 🏰', 'RIVER SWEEPS 🌊'
  ];

  // Check user session & task status
  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login');
        return;
      }
      setUser(data.session.user);

      const { data: request } = await supabase
        .from('freeplay_requests')
        .select('*')
        .eq('user_id', data.session.user.id)
        .limit(1)
        .maybeSingle();

      if (request) setRequestStatus(request.loaded ? 'loaded' : 'pending');
    }

    fetchUser();
  }, [router]);

  const handleDoTask = async () => {
    if (!selectedGame || !gameUsername) return alert('Select a game and enter username');

    const { error } = await supabase
      .from('freeplay_requests')
      .insert({
        user_id: user.id,
        game_name: selectedGame,
        game_username: gameUsername,
        task_completed: true,
        loaded: false
      });

    if (error) return alert('Failed to save task: ' + error.message);

    setRequestStatus('pending');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralMessage);
    alert('Referral message copied!');
  };

  // Task Pending View
  if (requestStatus === 'pending') {
    return (
      <div style={{ padding: 50, textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', color: '#FF5722' }}>Task Pending</h1>

        <button
          onClick={handleCopy}
          style={{
            marginTop: 30,
            padding: '15px 30px',
            fontSize: '1.2rem',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          Copy Referral Message
        </button>

        <p style={{ marginTop: 20, fontSize: 16 }}>
          Submit screenshot via Drift chat or contact us on Facebook.
        </p>

        <div style={{ marginTop: 30 }}>
          <button
            style={{
              padding: '12px 20px',
              fontSize: 16,
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer'
            }}
          >
            Contact Admin / Submit Screenshot
          </button>
        </div>

        <h2 style={{ marginTop: 50, color: '#FF5722' }}>Freeplay Redeem Rules:</h2>
        <p style={{ fontSize: 18 }}>Make 50 → Take $25</p>
      </div>
    );
  }

  // Loaded View (after admin approval)
  if (requestStatus === 'loaded') {
    return (
      <div style={{ padding: 50, textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', color: '#4caf50' }}>Thank You for Playing!</h1>
        <p style={{ marginTop: 20, fontSize: 18 }}>
          You can get 150% first deposit bonus right away. <br/>
          Join Drift or Facebook page to keep playing.
        </p>
        <button
            style={{
              padding: '12px 20px',
              fontSize: 16,
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer'
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
    cursor: 'pointer'
  }}
  onClick={() => window.location.href = "https://www.facebook.com/profile.php?id=61561430649793"}
>
  Facebook
</button>

      </div>
    );
  }

  // Freeplay selection UI (no request yet)
  return (
    <div style={{ padding: 20 }}>
      <h1>Freeplay</h1>

      <h3>Available Games:</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        {games.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGame(g)}
            style={{
              padding: '10px 15px',
              fontSize: 14,
              backgroundColor: selectedGame === g ? '#2196f3' : '#ccc',
              color: selectedGame === g ? 'white' : 'black',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer'
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {selectedGame && (
        <>
          <input
            type="text"
            placeholder="Enter your game username"
            value={gameUsername}
            onChange={(e) => setGameUsername(e.target.value)}
            style={{ padding: 10, fontSize: 16, marginBottom: 15, width: '100%' }}
          />

          <button
            onClick={handleDoTask}
            style={{
              padding: '12px 20px',
              fontSize: 16,
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer'
            }}
          >
            Do Task
          </button>

          <p style={{ marginTop: 15, fontSize: 14, color: '#555' }}>
            Task: Copy the referral message and share with 5 friends. Submit screenshot via Drift chat or Facebook.
          </p>
        </>
      )}
    </div>
  );
}
