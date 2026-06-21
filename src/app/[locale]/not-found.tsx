import NotFoundScene from '@/components/NotFoundScene';

// Catches `notFound()` thrown from within locale routes (e.g. a missing record).
export default function NotFound() {
  return <NotFoundScene />;
}
