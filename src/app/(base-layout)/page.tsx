import { executeQuery } from '@/lib/datocms/executeQuery';
import { graphql } from '@/lib/datocms/graphql';
import ResponsiveImage, {
  ResponsiveImageFragment,
} from '@/components/ResponsiveImage';

const query = graphql(
  `
    query HomeQuery {
      allApartments(first: 100) {
        id
        name
        slug
        featuredImage {
          responsiveImage(imgixParams: { w: 600, h: 400, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
      }
    }
  `,
  [ResponsiveImageFragment],
);

export const metadata = {
  title: 'Apartments | Acacia',
};

export default async function Page() {
  const { allApartments } = await executeQuery(query);

  return (
    <>
      <h1>Apartments</h1>
      <div className="apartments-grid">
        {allApartments.map((apartment) => (
          <div key={apartment.id} className="apartment-card">
            {apartment.featuredImage.responsiveImage && (
              <ResponsiveImage data={apartment.featuredImage.responsiveImage} />
            )}
            <h2>{apartment.name}</h2>
          </div>
        ))}
      </div>
    </>
  );
}
