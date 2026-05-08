import {
  Search,
  RefreshCw,
  ExternalLink,
  Calendar,
  User,
  Newspaper,
  ArrowUpDown,
  Clock,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SkeletonCard } from './Skeleton';
import { ErrorBoundaryUI } from './ErrorBoundary';

export default function NewsSection({ newsData }) {
  const { theme } = useTheme();
  const {
    articles,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    refresh,
    retry,
  } = newsData;

  if (error) {
    return (
      <section id="news-section" className="animate-fade-in">
        <SectionHeader theme={theme} />
        <ErrorBoundaryUI message={error} onRetry={retry} />
      </section>
    );
  }

  return (
    <section id="news-section" className="space-y-4 animate-fade-in">
      <SectionHeader theme={theme} />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-400'
            }`}
          />
          <input
            id="news-search"
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all outline-none ${
              theme === 'dark'
                ? 'bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30'
                : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 shadow-sm'
            }`}
            aria-label="Search news articles"
          />
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          <div className="relative">
            <ArrowUpDown
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-400'
              }`}
            />
            <select
              id="news-sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className={`pl-10 pr-8 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all outline-none appearance-none ${
                theme === 'dark'
                  ? 'bg-slate-800 border border-slate-700 text-white focus:border-primary-500'
                  : 'bg-white border border-slate-200 text-slate-900 focus:border-primary-500 shadow-sm'
              }`}
              aria-label="Sort articles"
            >
              <option value="date">By Date</option>
              <option value="source">By Source</option>
            </select>
          </div>

          <button
            id="news-refresh"
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Refresh news"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`rounded-xl border ${
                theme === 'dark'
                  ? 'border-slate-700/50 bg-slate-800/40'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div
          className={`text-center py-12 rounded-xl border ${
            theme === 'dark'
              ? 'border-slate-700/50 bg-slate-800/40 text-slate-400'
              : 'border-slate-200 bg-white text-slate-500'
          }`}
        >
          <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No articles found</p>
          <p className="text-sm mt-1 opacity-60">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article, i) => (
            <ArticleCard key={i} article={article} theme={theme} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

function ArticleCard({ article, theme, index }) {
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const time = article.publishedAt
    ? new Date(article.publishedAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <article
      className={`group rounded-xl border overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg animate-fade-in ${
        theme === 'dark'
          ? 'border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-600/50'
          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm'
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Image */}
      {article.urlToImage && (
        <div className="h-40 overflow-hidden">
          <img
            src={article.urlToImage}
            alt={article.title || 'Article image'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Colored top bar when no image */}
      {!article.urlToImage && (
        <div
          className="h-2 rounded-t-xl"
          style={{
            background: `linear-gradient(90deg, hsl(${(index * 37) % 360}, 70%, 55%), hsl(${((index * 37) + 30) % 360}, 70%, 55%))`,
          }}
        />
      )}

      <div className="p-4 space-y-3">
        {/* Source & Date */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              theme === 'dark'
                ? 'bg-primary-500/15 text-primary-400'
                : 'bg-primary-50 text-primary-700'
            }`}
          >
            <Newspaper className="w-3 h-3" />
            {article.source?.name || 'Unknown'}
          </span>
          <div
            className={`flex items-center gap-1 text-xs ${
              theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <Clock className="w-3 h-3" />
            {time}
          </div>
        </div>

        {/* Title */}
        <h3
          className={`text-sm font-bold leading-snug line-clamp-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}
        >
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p
            className={`text-xs leading-relaxed line-clamp-3 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {article.description}
          </p>
        )}

        {/* Meta & Link */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/20">
          <div className="flex items-center gap-3">
            {article.author && (
              <span
                className={`flex items-center gap-1 text-xs ${
                  theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                <User className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{article.author}</span>
              </span>
            )}
            <span
              className={`flex items-center gap-1 text-xs ${
                theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {date}
            </span>
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-400 transition-colors"
            aria-label={`Read more: ${article.title}`}
          >
            Read More
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </article>
  );
}

function SectionHeader({ theme }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
        <Newspaper className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2
          className={`text-lg font-bold ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}
        >
          News Dashboard
        </h2>
        <p
          className={`text-xs ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Top headlines • 15-min cache
        </p>
      </div>
    </div>
  );
}
