import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <h1 className="text-5xl font-black text-slate-900 tracking-tight">ApexCare V2</h1>
      <p className="mt-4 text-xl font-bold text-slate-500">Next-Gen Care Management</p>
      <div className="mt-8">
        <Link href="/login" className="rounded-xl bg-blue-600 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white border-b-4 border-blue-800 dark:border-blue-900 hover:bg-blue-700 transition-all active:scale-95">
          Log in
        </Link>
      </div>
    </div>
  );
}