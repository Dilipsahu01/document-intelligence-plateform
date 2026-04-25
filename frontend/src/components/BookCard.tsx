import { Book } from '@/types/book';
import Link from 'next/link';

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.id}`} className="group h-full">
      <div className="flex flex-col p-5 bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 h-full">
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-zinc-900 line-clamp-2 group-hover:text-blue-600 transition-colors" title={book.title}>
          {book.title}
        </h3>
        
        {/* Author & Availability */}
        <div className="mt-2 flex justify-between items-center text-xs font-medium">
          <p className="text-zinc-500 line-clamp-1 mr-2">by {book.author}</p>
          <span className="text-emerald-600 whitespace-nowrap bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            {book.availability || 'In Stock'}
          </span>
        </div>

        {/* Clean Numerical Rating & Price */}
        <div className="flex justify-between items-center mt-5 mb-5">
          <div className="flex items-center bg-zinc-100 px-2.5 py-1 rounded-md text-sm font-bold text-zinc-700 border border-zinc-200">
             ⭐ {book.rating ? book.rating.toFixed(1) : "0.0"} <span className="text-zinc-400 font-normal ml-1">/ 5</span>
          </div>
          <div className="font-mono text-zinc-900 font-bold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            {book.price || 'Free'}
          </div>
        </div>

        {/* Badges / AI Insights */}
        <div className="mt-auto flex flex-wrap gap-2">
          {book.genre && (
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-zinc-100 text-zinc-600 rounded-md border border-zinc-200">
              {book.genre}
            </span>
          )}
          {book.sentiment && (
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
              {book.sentiment}
            </span>
          )}
        </div>
        
      </div>
    </Link>
  );
}
