import { api } from '../lib/api';
import BookBrowser from '../components/BookBrowser';
import ChatSection from '../components/ChatSection';
import { Book } from '../types/book';

export default async function HomePage() {
  let books: Book[] = [];
  let error = false;

  try {
    // Fetch books directly from your Django API
    const response = await api.get('books/');
    books = response.data;
  } catch (e) {
    console.error("Backend connection failed:", e);
    error = true;
  }

  return (
    <main className="min-h-screen bg-zinc-50 pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-zinc-200 mb-12">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-black text-zinc-900 tracking-tight mb-4">
            Document <span className="text-blue-600">Intelligence</span>
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl">
            A specialized RAG-powered platform for library management, automated 
            summarization, and semantic search.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-16">
        
        {/* 1. AI CHAT SECTION (RAG) */}
        <section className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-900">Ask Your Library</h2>
            <p className="text-zinc-500 text-sm">Query your collection using local AI (LM Studio)</p>
          </div>
          <ChatSection />
        </section>

        {/* 2. COLLECTION BROWSER SECTION */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900">Your Collection</h2>
              <p className="text-zinc-500">Managing {books.length} processed documents</p>
            </div>
          </div>

          {error ? (
            <div className="p-12 bg-red-50 border border-red-100 rounded-xl text-center">
              <p className="text-red-600 font-medium">Unable to connect to Django Backend.</p>
              <p className="text-red-400 text-sm">Make sure "python manage.py runserver" is running on port 8000.</p>
            </div>
          ) : (
            <BookBrowser initialBooks={books} />
          )}
        </section>

      </div>
      
      {/* Footer */}
      <footer className="mt-20 py-10 border-t border-zinc-200 text-center">
        <p className="text-zinc-400 text-sm">Built with Next.js, Django, and ChromaDB</p>
      </footer>
    </main>
  );
}
