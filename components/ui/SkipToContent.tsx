export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-[9999]
        bg-brand-500 text-white
        font-semibold text-sm
        px-5 py-3 rounded-lg
        shadow-brand
        focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-500
        transition-all
      "
    >
      Aller au contenu principal
    </a>
  );
}
