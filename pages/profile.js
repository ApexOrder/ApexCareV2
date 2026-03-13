import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';

export default function Profile() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">ApexCare V2</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900">
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Agency Profile</h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-[100rem] sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-[2.5rem]">
                <div className="px-8 py-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="text-xl font-black leading-6 text-slate-900 dark:text-white">Agency Information</h3>
                  <p className="mt-1 max-w-2xl text-sm font-bold text-slate-500">Details and subscription status.</p>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800">
                  <dl>
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agency name</dt>
                      <dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">Apex Home Health</dd>
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-8 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subscription Plan</dt>
                      <dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">Professional Tier</dd>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email address</dt>
                      <dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">admin@apexcare.com</dd>
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-8 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subscription Status</dt>
                      <dd className="mt-1 text-sm font-black text-emerald-600 sm:mt-0 sm:col-span-2">Active</dd>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Next Billing Date</dt>
                      <dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">April 1, 2024</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}