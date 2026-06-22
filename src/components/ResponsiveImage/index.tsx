import { type FragmentOf, graphql, readFragment } from '@/lib/datocms/graphql';
import { type ImagePropTypes } from 'react-datocms/image';
import { SRCImage } from 'react-datocms/rsc-image';

/**
 * Let's define the GraphQL fragment needed for the component to function.
 *
 * GraphQL fragment colocation keeps queries near the components using them,
 * improving maintainability and encapsulation. Fragment composition enables
 * building complex queries from reusable parts, promoting code reuse and
 * efficiency. Together, these practices lead to more modular, maintainable, and
 * performant GraphQL implementations by allowing precise data fetching and
 * easier code management.
 *
 * Learn more: https://gql-tada.0no.co/guides/fragment-colocation
 */
export const ResponsiveImageFragment = graphql(/* GraphQL */ `
  fragment ResponsiveImageFragment on ResponsiveImage {
    # always required
    src
    srcSet
    width
    height

    # not required, but strongly suggested!
    alt
    title

    # LQIP (base64-encoded)
    base64

    # NB: 'sizes' is intentionally NOT requested. Without data.sizes (and no
    # explicit sizes prop), react-datocms (>=8.0.6) emits sizes="auto, 100vw" on
    # lazy images, letting the browser measure the real rendered width and pick
    # the smallest sufficient srcSet candidate. Browsers without sizes="auto"
    # support (Safari, older) fall back to the "100vw" part.
  }
`);

type Props = Omit<ImagePropTypes, 'data'> & {
  data: FragmentOf<typeof ResponsiveImageFragment>;
};

/**
 * This component is a wrapper for the `<SRCImage />` component provided by
 * react-datocms, optimized for use with graphql.tada. We define the necessary
 * GraphQL fragment for this component to function only once, then reuse it
 * wherever needed.
 */
export default function ResponsiveImage({ data, ...other }: Props) {
  const unmaskedData = readFragment(ResponsiveImageFragment, data);

  return <SRCImage data={unmaskedData} {...other} />;
}
