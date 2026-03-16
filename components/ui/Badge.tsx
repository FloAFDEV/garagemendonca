import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "orange" | "green" | "blue" | "gray" | "red";
  className?: string;
}

const variants = {
  orange: "bg-brand-100 text-brand-700",
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  gray: "bg-dark-100 text-dark-600",
  red: "bg-red-100 text-red-700",
};

export default function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span className={clsx("badge", variants[variant], className)}>
      {children}
    </span>
  );
}
