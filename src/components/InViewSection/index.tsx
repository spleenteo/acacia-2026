'use client';

import { useInView } from '@/hooks/useInView';

type Props = {
  children: React.ReactNode;
  as?: 'section' | 'div';
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Thin wrapper that adds the `in-view` class when the element scrolls into the viewport.
 * Used to trigger CSS-only marker highlight animations on heading <em> elements.
 */
export default function InViewSection({ children, as: Tag = 'div', className, style }: Props) {
  const ref = useInView<HTMLElement>();

  return (
    // @ts-expect-error — Tag is a valid HTML element string
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
