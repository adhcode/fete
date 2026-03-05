import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { auth } from '../lib/auth';

interface EventWithCount {
  id: string;
  code: string;
  name: string;
  date: string | null;
  venue: string | null;
  createdAt: string;
  template: {
    id: string;
    name: string;
  } | null;
  _count: {
    photos: number;
  };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const organizer = auth.getOrganizer();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/org/login');
      return;
    }
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await api.getMyEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    auth.clearToken();
    navigate('/org/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fete Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {organizer?.name || organizer?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="mb-8 flex gap-4">
          <Link
            to="/org/events/new"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-600 transition"
          >
            + Create Event
          </Link>
          <Link
            to="/org/templates/new"
            className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition"
          >
            + Create Template
          </Link>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Events</h2>
          </div>

          {events.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 mb-4">No events yet</p>
              <Link
                to="/org/events/new"
                className="inline-block px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
              >
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {events.map((event) => (
                <div key={event.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {event.code}
                        </span>
                        {event.venue && <span>📍 {event.venue}</span>}
                        {event.date && (
                          <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                        )}
                        <span>📸 {event._count.photos} photos</span>
                        {event.template && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                            {event.template.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/e/${event.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition font-medium"
                      >
                        Open Guest Link
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
