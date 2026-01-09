'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Account {
  id: string;
  user_id: string;
  game_name: string;
  game_username: string;
  game_password: string;
}

export default function AccountsPage() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameName, setGameName] = useState('');
  const [gameUsername, setGameUsername] = useState('');
  const [gamePassword, setGamePassword] = useState('');

  const games = [
    'MILKY WAY 🌌', 'CASINO ROYALE 🎲', 'VEGAS SWEEPS 🎰',
    'PANDA MASTER 🐼', 'VBLINK 🔗', 'JUWA 🐉',
    'Orion stars ✨', 'FIRE KIRIN 🔥', 'GAME VAULT 🏰', 'RIVER SWEEPS 🌊'
  ];

  // Fetch user and their accounts
  useEffect(() => {
    async function fetchUserAndAccounts() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return alert(error.message);
      setUser(user);

      if (user) {
        const { data: accountData, error: accountError } = await supabase
          .from('user_game_accounts')
          .select('*')
          .eq('user_id', user.id);

        if (accountError) return alert(accountError.message);
        setAccounts(accountData || []);
      }

      setLoading(false);
    }

    fetchUserAndAccounts();
  }, []);

  // Add new account
  async function handleAddAccount() {
    if (!gameName || !gameUsername || !gamePassword) {
      return alert('All fields are required');
    }
    if (!user) return alert('Please login first');

    const { data, error } = await supabase.from('user_game_accounts').insert({
      user_id: user.id,
      game_name: gameName,
      game_username: gameUsername,
      game_password: gamePassword
    }).select(); // <- important! `.select()` ensures data is returned

    if (error) return alert(error.message);

    if (!data || data.length === 0) return alert('Failed to add account');

    setAccounts([...accounts, data[0]]);
    setGameName('');
    setGameUsername('');
    setGamePassword('');
  }

  // Delete account
  async function handleDeleteAccount(id: string) {
    if (!confirm('Are you sure you want to delete this account?')) return;

    const { error } = await supabase.from('user_game_accounts').delete().eq('id', id);
    if (error) return alert(error.message);

    setAccounts(accounts.filter(acc => acc.id !== id));
  }

  if (loading) return <p>Loading your accounts...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>My Game Accounts</h1>

      {/* Add Account Form */}
      <div style={{ marginBottom: 30 }}>
        <h2>Add New Game Account</h2>
        <select value={gameName} onChange={e => setGameName(e.target.value)}>
          <option value="">Select Game</option>
          {games.map(game => (
            <option key={game} value={game}>{game}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Game Username"
          value={gameUsername}
          onChange={e => setGameUsername(e.target.value)}
          style={{ marginLeft: 10 }}
        />
        <input
          type="text"
          placeholder="Game Password"
          value={gamePassword}
          onChange={e => setGamePassword(e.target.value)}
          style={{ marginLeft: 10 }}
        />
        <button onClick={handleAddAccount} style={{ marginLeft: 10 }}>
          Save Account
        </button>
      </div>

      {/* Display Accounts */}
      <div>
        <h2>Saved Accounts</h2>
        {accounts.length === 0 ? (
          <p>No accounts saved yet.</p>
        ) : (
          <table border={1} cellPadding={5} cellSpacing={0}>
            <thead>
              <tr>
                <th>Game</th>
                <th>Username</th>
                <th>Password</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => (
                <tr key={acc.id}>
                  <td>{acc.game_name}</td>
                  <td>{acc.game_username}</td>
                  <td>{acc.game_password}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteAccount(acc.id)}
                      style={{ background: 'red', color: 'white', border: 'none', padding: '3px 8px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
