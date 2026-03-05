import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim()) {
      navigate(`/e/${code.trim().toUpperCase()}`);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Logo */}
      <div className="w-full py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-charcoal" style={{ fontFamily: 'ClashDisplay, sans-serif' }}>
            Fete
          </h1>
        </div>

          <div className="text-center mb-8">
            <Link
              to="/org/login"
              className="text-sm text-gray-600 hover:text-charcoal font-medium transition inline-flex items-center gap-1 font-satoshi"
            >
              Organizer Login
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Organizer Link */}
        

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl text-charcoal font-semibold mb-3 font-satoshi">
Every Event Has a Story.            </h2>
            <p className="text-gray-600 text-base max-w-sm mx-auto font-satoshi">
              Join with a code
            </p>
          </motion.div>

          {/* Code Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-semibold text-charcoal mb-3 font-satoshi">
                  Enter Event Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="AB3X9K"
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-yellow focus:bg-white text-center text-3xl font-mono uppercase text-charcoal placeholder-gray-400 transition font-satoshi"
                  maxLength={10}
                  required
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-5 bg-[#FFC107] text-charcoal rounded-2xl font-bold text-lg hover:bg-opacity-90 transition font-satoshi"
              >
                Join Event
              </motion.button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center font-satoshi">
                Don't have a code? Ask your event organizer.
              </p>
            </div>
          </motion.div>

          {/* Create Event CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <Link
              to="/org/signup"
              className="text-sm text-gray-600 hover:text-charcoal transition inline-flex items-center gap-1 font-medium font-satoshi"
            >
              Create your own event
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
