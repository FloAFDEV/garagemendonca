import clsx from "clsx";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  centered = false,
  light = false,
}: SectionHeaderProps) {
  return (
    <div className={clsx("mb-12", centered && "text-center")}>
      {eyebrow && (
        <span className="inline-block text-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">
          {eyebrow}
        </span>
      )}
      <h2
        className={clsx(
          "section-title",
          light && "text-white"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={clsx(
            "section-subtitle mt-4",
            centered && "mx-auto",
            light ? "text-dark-300" : "text-dark-500"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
