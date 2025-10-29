'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DataEntryForm from '@/app/components/DataEntryForm';
import DashboardComponent from '@/app/components/Dashboard';
import AIInsights from '@/app/components/AIInsights';
import ExportReport from '@/app/components/ExportReport';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'entry' | 'analytics' | 'insights' | 'export'>('entry');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleDataSaved = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">💚 Health Tracker</h1>
            <p className="text-gray-600">Welcome, {user.name}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'entry', label: '📝 Quick Entry', icon: '📝' },
            { id: 'analytics', label: '📊 Analytics', icon: '📊' },
            { id: 'insights', label: '🤖 AI Insights', icon: '🤖' },
            { id: 'export', label: '📥 Export', icon: '📥' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {activeTab === 'entry' && (
            <DataEntryForm userId={user.id} onSuccess={handleDataSaved} />
          )}

          {activeTab === 'analytics' && (
            <DashboardComponent userId={user.id} refreshTrigger={refreshTrigger} />
          )}

          {activeTab === 'insights' && (
            <AIInsights userId={user.id} refreshTrigger={refreshTrigger} />
          )}

          {activeTab === 'export' && (
            <ExportReport userId={user.id} userName={user.name} />
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 text-sm">Last Updated</p>
            <p className="text-2xl font-bold text-indigo-600">
              {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 text-sm">User</p>
            <p className="text-2xl font-bold text-indigo-600">{user.name}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 text-sm">Member Since</p>
            <p className="text-2xl font-bold text-indigo-600">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

