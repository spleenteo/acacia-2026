import { graphql } from '@/lib/datocms/graphql';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';

export const districtDetailQuery = graphql(
  `
    query DistrictDetailQuery($locale: SiteLocale!, $slug: String!) {
      district(locale: $locale, filter: { slug: { eq: $slug } }) {
        id
        name
        slug
        abstract(locale: $locale, markdown: true)
        description(locale: $locale, markdown: true)
        gallery {
          ...GalleryImageFragment
        }
      }
    }
  `,
  [GalleryImageFragment],
);
