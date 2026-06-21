import NotFoundScene from '@/components/NotFoundScene';

// Root not-found: catches URLs that don't match any route at all (returns a
// real 404 status). The locale not-found handles `notFound()` from inside routes.
export default function NotFound() {
  return <NotFoundScene />;
}
