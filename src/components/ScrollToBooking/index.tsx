'use client';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function ScrollToBooking({ children, className }: Props) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('beddy-widget');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('beddy-highlight');
      setTimeout(() => el.classList.remove('beddy-highlight'), 2000);
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
