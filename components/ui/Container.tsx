/**
 * Container — système de conteneur responsive cohérent.
 *
 * Utilisation :
 *   <Container>…</Container>
 *   <Container as="section" className="py-12">…</Container>
 *
 * Largeur max : 80rem (1280px) · Padding : px-4 → sm:px-6 → lg:px-8
 */
import type { ComponentPropsWithoutRef, ElementType } from "react";

type ContainerOwnProps<T extends ElementType = "div"> = {
  /** Balise HTML ou composant React à rendre (défaut : "div") */
  as?: T;
  className?: string;
  children?: React.ReactNode;
};

type ContainerProps<T extends ElementType = "div"> = ContainerOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ContainerOwnProps<T>>;

export default function Container<T extends ElementType = "div">({
  as,
  children,
  className = "",
  ...rest
}: ContainerProps<T>) {
  const Tag = as ?? "div";
  return (
    <Tag
      className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}
