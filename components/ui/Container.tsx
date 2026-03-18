/**
 * Container — système de conteneur responsive cohérent.
 *
 * Utilisation :
 *   <Container>…</Container>
 *   <Container as="section" className="py-12">…</Container>
 *
 * Largeur max : 80rem (1280px) · Padding : px-4 → sm:px-6 → lg:px-8
 */

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export default function Container({
  children,
  className = "",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`.trim()}>
      {children}
    </Tag>
  );
}
