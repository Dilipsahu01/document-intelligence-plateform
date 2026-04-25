import Link from 'next/link';
import { notFound } from 'next/navigation';

// 1. Updated Interface to include Price and Availability
interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  description: string;
  summary: string;
  genre: string;
  sentiment: string;
  price?: string;
  availability?: string;
}

const API_BASE_URL = 'http://localhost:8000';

// 2. Helper Functions (Must be defined for the component to work)
async function getBookDetails(id: string): Promise<Book | null> {
  const res = await fetch(`${API_BASE_URL}/api/books/${id}/`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

async function getRecommendations(id: string): Promise<Book[]> {
  const res = await fetch(`${API_BASE_URL}/api/books/${id}/recommendations/`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

// 3. Main Page Component
export default async function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // These calls will now work because the functions are defined above
  const [book, recommendations] = await Promise.all([
    getBookDetails(id),
    getRecommendations(id),
  ]);

  if (!book) notFound();

  return (
    <main className="min-h-screen bg-white">
      {/* Header Navigation */}
      <nav className="border-b border-zinc-100 py-4 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Library
          </Link>
          <div className="text-zinc-300 font-mono text-xs">BOOK_ID: {book.id}</div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="aspect-[3/4] bg-zinc-900 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent" />
             <div className="z-10 text-center px-6">
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">Book Cover</p>
                <h4 className="text-white font-serif text-lg italic">{book.title}</h4>
             </div>
          </div>

          <div className="space-y-4 pt-4">
             {/* New Price and Stock fields displayed here */}
             <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <span className="text-zinc-400 text-sm">Price</span>
                <span className="font-bold text-zinc-900">{book.price || 'N/A'}</span>
             </div>
             <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <span className="text-zinc-400 text-sm">Stock</span>
                <span className="font-semibold text-emerald-600">{book.availability || 'Unknown'}</span>
             </div>
             <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <span className="text-zinc-400 text-sm">Genre</span>
                <span className="font-semibold text-zinc-900">{book.genre}</span>
             </div>
             <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <span className="text-zinc-400 text-sm">Analysis</span>
                <span className={`font-bold ${book.sentiment.toLowerCase().includes('positive') ? 'text-emerald-600' : 'text-zinc-600'}`}>
                  {book.sentiment}
                </span>
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <article className="lg:col-span-8 space-y-12">
          <header className="space-y-4">
            <h1 className="text-5xl font-black text-zinc-900 tracking-tight leading-none">
              {book.title}
            </h1>
            <p className="text-2xl text-zinc-400 font-light">
              by <span className="text-zinc-600 font-medium">{book.author}</span>
            </p>
          </header>

          {/* AI Insights Section */}
          <section className="bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 p-4 opacity-20">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                </svg>
             </div>
             <h3 className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                AI Generated Insight
             </h3>
             <p className="text-xl font-serif leading-relaxed italic text-zinc-200">
                {book.summary ? `"${book.summary}"` : "Processing AI summary..."}
             </p>
          </section>

          <section className="space-y-6 text-zinc-800">
             <h3 className="text-xl font-bold border-l-4 border-indigo-500 pl-4">Full Description</h3>
             <p className="text-lg leading-relaxed text-zinc-600">
               {book.description}
             </p>
          </section>

          {/* Recommendations Grid */}
          {recommendations.length > 0 && (
            <section className="pt-12 border-t border-zinc-100">
              <h3 className="text-2xl font-black mb-8 text-zinc-900 uppercase tracking-tight">Semantically Related</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {recommendations.map((rec) => (
                  <Link href={`/books/${rec.id}`} key={rec.id} className="group space-y-3">
                    <div className="aspect-[3/4] bg-zinc-50 rounded-xl group-hover:bg-zinc-100 transition-colors border border-zinc-100 shadow-sm overflow-hidden flex items-center justify-center p-4">
                       <p className="text-zinc-300 font-bold text-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">VIEW DETAILS</p>
                    </div>
                    <h4 className="font-bold text-zinc-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{rec.title}</h4>
                    <p className="text-sm text-zinc-400 uppercase tracking-widest text-[10px]">{rec.author}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </main>
  );
}
