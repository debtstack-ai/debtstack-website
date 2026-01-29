// app/admin/page.tsx
'use client';

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";

interface User {
  id: number;
  email: string;
  api_key?: string;
  api_key_prefix: string;
  tier: string;
  credits_remaining: number;
  credits_monthly: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminDashboard() {
  const { user, isLoaded: userLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Check admin status
  useEffect(() => {
    if (userLoaded && user) {
      checkAdminStatus();
    }
  }, [userLoaded, user]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/check');
      const data = await response.json();
      setIsAdmin(data.isAdmin);
      if (data.isAdmin) {
        fetchUsers();
      }
    } catch (err) {
      setError('Failed to verify admin status');
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
      });
      if (search) params.set('search', search);
      if (tierFilter) params.set('tier', tierFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, tierFilter]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleChangeTier = async (newTier: string) => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${encodeURIComponent(selectedUser.email)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: newTier }),
      });

      if (!response.ok) throw new Error('Failed to update tier');

      const data = await response.json();
      setUsers(users.map(u => u.email === selectedUser.email ? data.user : u));
      setShowTierModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tier');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${encodeURIComponent(selectedUser.email)}/regenerate-key`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to regenerate key');

      const data = await response.json();
      setNewApiKey(data.user.api_key);
      setUsers(users.map(u => u.email === selectedUser.email ? { ...u, api_key_prefix: data.user.api_key_prefix } : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate key');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (targetUser: User) => {
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(targetUser.email)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !targetUser.is_active }),
      });

      if (!response.ok) throw new Error('Failed to update user');

      const data = await response.json();
      setUsers(users.map(u => u.email === targetUser.email ? data.user : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  if (!userLoaded || loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please sign in to access this page</p>
          <a href="/" className="text-blue-400 hover:text-blue-300">Go to homepage</a>
        </div>
      </main>
    );
  }

  if (isAdmin === false) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Access Denied</h1>
          <p className="text-gray-400 mb-4">You don't have permission to access this page.</p>
          <a href="/" className="text-blue-400 hover:text-blue-300">Go to homepage</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/logo-transparent.png" alt="DebtStack" className="h-32 md:h-48 w-auto" />
          </a>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-purple-600 text-xs font-medium">Admin</span>
            <span className="text-gray-400 text-sm">{user.primaryEmailAddress?.emailAddress}</span>
            <a href="/dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</a>
            <a href="/" className="text-gray-400 hover:text-white text-sm">Home</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">&times;</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
            <p className="text-sm text-gray-400">Total Users</p>
            <p className="text-2xl font-bold">{pagination?.total ?? '—'}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
            <p className="text-sm text-gray-400">Free Users</p>
            <p className="text-2xl font-bold">{users.filter(u => u.tier === 'free').length}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
            <p className="text-sm text-gray-400">Pro Users</p>
            <p className="text-2xl font-bold text-blue-400">{users.filter(u => u.tier === 'pro').length}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
            <p className="text-sm text-gray-400">Business Users</p>
            <p className="text-2xl font-bold text-purple-400">{users.filter(u => u.tier === 'business').length}</p>
          </div>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <select
            value={tierFilter}
            onChange={(e) => { setTierFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Tiers</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="business">Business</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
          >
            Search
          </button>
        </form>

        {/* Users Table */}
        <div className="rounded-xl bg-gray-900/50 border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tier</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">API Key</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-sm">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        u.tier === 'business' ? 'bg-purple-600/20 text-purple-400' :
                        u.tier === 'pro' ? 'bg-blue-600/20 text-blue-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {u.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-400">
                      {u.api_key_prefix}...
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        u.is_active ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                      }`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedUser(u); setShowTierModal(true); }}
                          className="px-3 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 transition"
                        >
                          Change Tier
                        </button>
                        <button
                          onClick={() => { setSelectedUser(u); setShowKeyModal(true); setNewApiKey(null); }}
                          className="px-3 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 transition"
                        >
                          Regen Key
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`px-3 py-1 rounded text-xs transition ${
                            u.is_active
                              ? 'bg-red-600/20 hover:bg-red-600/40 text-red-400'
                              : 'bg-green-600/20 hover:bg-green-600/40 text-green-400'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-400">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Change Tier Modal */}
      {showTierModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Change Tier</h2>
            <p className="text-gray-400 mb-4">
              Update tier for <span className="text-white">{selectedUser.email}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Current tier: <span className="text-white capitalize">{selectedUser.tier}</span>
            </p>
            <div className="space-y-2 mb-6">
              {['free', 'pro', 'business'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleChangeTier(tier)}
                  disabled={actionLoading || tier === selectedUser.tier}
                  className={`w-full px-4 py-3 rounded-lg text-left transition ${
                    tier === selectedUser.tier
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : tier === 'business'
                        ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400'
                        : tier === 'pro'
                          ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400'
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <span className="capitalize font-medium">{tier}</span>
                  {tier === 'free' && <span className="text-gray-500 text-sm ml-2">25 queries/day</span>}
                  {tier === 'pro' && <span className="text-gray-500 text-sm ml-2">$49/mo - Unlimited</span>}
                  {tier === 'business' && <span className="text-gray-500 text-sm ml-2">$499/mo - Unlimited + Support</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setShowTierModal(false); setSelectedUser(null); }}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Regenerate Key Modal */}
      {showKeyModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Regenerate API Key</h2>
            <p className="text-gray-400 mb-4">
              Generate new API key for <span className="text-white">{selectedUser.email}</span>
            </p>

            {!newApiKey ? (
              <>
                <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30 text-yellow-400 mb-4">
                  Warning: This will invalidate the user's current API key immediately.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRegenerateKey}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Generating...' : 'Regenerate Key'}
                  </button>
                  <button
                    onClick={() => { setShowKeyModal(false); setSelectedUser(null); setNewApiKey(null); }}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-2">New API Key:</p>
                <code className="block px-4 py-3 rounded-lg bg-black border border-gray-700 font-mono text-sm text-green-400 break-all mb-4">
                  {newApiKey}
                </code>
                <p className="text-xs text-gray-500 mb-4">
                  Copy this key now. It won't be shown again.
                </p>
                <button
                  onClick={() => { setShowKeyModal(false); setSelectedUser(null); setNewApiKey(null); }}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
