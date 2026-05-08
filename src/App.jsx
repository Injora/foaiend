import { Sun, Moon, Satellite, Newspaper, BarChart3, MessageCircle } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useISS } from './hooks/useISS';
import { useNews } from './hooks/useNews';
import { useChatbot } from './hooks/useChatbot';

import ISSSection from './components/ISSSection';
import NewsSection from './components/NewsSection';
import Chatbot from './components/Chatbot';
import Charts from './components/Charts';

function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const issData = useISS();
  const newsData = useNews();

  const chatData = useChatbot(
    {
      position: issData.position,
      speed: issData.speed,
      location: issData.location,
    },
    newsData.allArticles.map(a => a.title).filter(Boolean)
  );

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-surface-darker text-white' : 'bg-surface-light text-slate-900'
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl ${
          theme === 'dark'
            ? 'bg-surface-darker/80 border-slate-800'
            : 'bg-white/80 border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600">
                <Satellite className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                    Command Center
                  </span>
                </h1>
                <p
                  className={`text-[10px] font-medium -mt-0.5 ${
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  ISS • News • AI
                </p>
              </div>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'iss-section', label: 'ISS', icon: Satellite },
                { id: 'news-section', label: 'News', icon: Newspaper },
                { id: 'charts-section', label: 'Charts', icon: BarChart3 },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Chat toggle (mobile) */}
              <button
                onClick={chatData.toggleChat}
                className={`md:hidden p-2 rounded-lg transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                aria-label="Toggle chat"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              {/* Theme toggle */}
              <button
                id="theme-toggle"
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'text-amber-400 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Status indicator */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700/30">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-50" />
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <ISSSection issData={issData} />
        <NewsSection newsData={newsData} />
        <Charts speedHistory={issData.speedHistory} articles={newsData.allArticles} />
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-6 mt-8 ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className={`text-center text-xs font-medium ${
              theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Built with React + Vite • ISS data from Open Notify • News from NewsAPI •
            AI by Mistral-7B
          </p>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot chatData={chatData} />

      {/* Toast Container */}
      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}
