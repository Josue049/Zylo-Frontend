export default function HeaderClose() {
  return (
    <header className="w-full top-0 sticky bg-[#f9f6f5] z-50">
      <div className="flex items-center justify-between px-6 py-6 w-full max-w-7xl mx-auto">
        <a
          href="/"
        >
        <span className="text-2xl font-extrabold text-primary font-headline tracking-tight">
          Zylo
        </span>
        </a>

        <a
          href="/"
          className="text-on-surface-variant hover:opacity-80 transition-opacity flex items-center gap-2 font-medium"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </a>
      </div>
    </header>
  );
}
