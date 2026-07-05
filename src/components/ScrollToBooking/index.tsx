'use client';

import { useBooking } from '@/components/BookingModal';

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Apartment-specific Beddy widget code; falls back to the site-wide one. */
  widgetCode?: string | null;
};

/** "Book" trigger: opens the global booking modal with the given widget. */
export default function ScrollToBooking({ children, className, widgetCode }: Props) {
  const { open } = useBooking();
  return (
    <button
      type="button"
      onClick={() => open({ widgetCode, source: 'apartment' })}
      className={className}
    >
      {children}
    </button>
  );
}
