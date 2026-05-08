import { useState, useEffect, useCallback } from 'react';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const CACHE_KEY = 'news-cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export function useNews() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const fetchNews = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setArticles(data);
            setLoading(false);
            return;
          }
        }
      }

      if (!API_KEY || API_KEY === 'your_newsapi_key_here') {
        // Fallback mock data when no API key
        const mockArticles = generateMockNews();
        setArticles(mockArticles);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: mockArticles, timestamp: Date.now() })
        );
        setLoading(false);
        return;
      }

      const res = await fetch(
        `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://gnews.io/api/v4/top-headlines?category=general&lang=en&country=us&max=10&apikey=${API_KEY}`)}`
      );
      if (!res.ok) throw new Error('Failed to fetch news');
      const data = await res.json();
      const arts = data.articles || [];

      setArticles(arts);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: arts, timestamp: Date.now() })
      );
      setLoading(false);
    } catch (err) {
      console.error('News fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Filter and sort
  useEffect(() => {
    let result = [...articles];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        a =>
          (a.title && a.title.toLowerCase().includes(lower)) ||
          (a.description && a.description.toLowerCase().includes(lower)) ||
          (a.source?.name && a.source.name.toLowerCase().includes(lower))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      }
      if (sortBy === 'source') {
        return (a.source?.name || '').localeCompare(b.source?.name || '');
      }
      return 0;
    });

    setFilteredArticles(result);
  }, [articles, searchTerm, sortBy]);

  const refresh = useCallback(() => {
    fetchNews(true);
  }, [fetchNews]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    articles: filteredArticles,
    allArticles: articles,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    refresh,
    retry: () => fetchNews(true),
  };
}

function generateMockNews() {
  const sources = ['TechCrunch', 'BBC News', 'CNN', 'Reuters', 'The Verge', 'Wired', 'Ars Technica', 'Bloomberg', 'AP News', 'The Guardian'];
  const categories = ['Technology', 'Science', 'World', 'Business', 'Health'];

  return sources.map((source, i) => ({
    source: { id: source.toLowerCase().replace(/\s/g, '-'), name: source },
    author: `Author ${i + 1}`,
    title: getHeadline(i),
    description: getDescription(i),
    url: `https://example.com/article-${i + 1}`,
    image: null,
    publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
    content: `Full content for article ${i + 1}...`,
    category: categories[i % categories.length],
  }));
}

function getHeadline(i) {
  const headlines = [
    'NASA Announces New Mars Rover Mission for 2028',
    'Global Climate Summit Reaches Historic Agreement',
    'AI Breakthrough: New Model Surpasses Human Performance',
    'SpaceX Successfully Launches 60 More Starlink Satellites',
    'Quantum Computing Milestone Achieved by Research Team',
    'New Study Reveals Ocean Temperatures Rising Faster',
    'Tech Giants Report Record Q4 Earnings',
    'International Space Station Celebrates 25 Years',
    'Renewable Energy Surpasses Fossil Fuels in Europe',
    'Scientists Discover New Species in Deep Ocean Trench',
  ];
  return headlines[i] || `Breaking News Story ${i + 1}`;
}

function getDescription(i) {
  const descriptions = [
    'NASA has unveiled plans for an ambitious new Mars rover mission, set to launch in 2028 with advanced instruments for detecting signs of ancient life.',
    'World leaders have reached a groundbreaking agreement at the Global Climate Summit, pledging to reduce carbon emissions by 50% before 2035.',
    'Researchers have developed a new AI model that demonstrates unprecedented capabilities across multiple benchmark tests, surpassing human-level performance.',
    'SpaceX has successfully deployed another batch of 60 Starlink satellites, bringing the constellation closer to global internet coverage.',
    'A team of physicists has achieved a major milestone in quantum computing, demonstrating error-corrected qubits at scale for the first time.',
    'A comprehensive new study reveals that ocean temperatures are rising at an accelerated rate, with implications for marine ecosystems worldwide.',
    'Major technology companies have reported record-breaking earnings for Q4, driven by strong demand for cloud services and AI products.',
    'The International Space Station marks its 25th anniversary of continuous human habitation, having hosted over 270 astronauts from 21 countries.',
    'For the first time, renewable energy sources have generated more electricity than fossil fuels across the European Union.',
    'Marine biologists have discovered several previously unknown species during a deep-sea expedition to one of the ocean\'s most remote trenches.',
  ];
  return descriptions[i] || `Description for news story ${i + 1}.`;
}
