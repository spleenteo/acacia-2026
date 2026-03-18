import { graphql } from '@/lib/datocms/graphql';
import { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import { GalleryImageFragment } from '@/components/ImageGallery/fragment';
import { AmenityFragment } from '@/components/AmenitiesList';
import { ComfortFragment } from '@/components/ComfortsList';
import { InfoTextFragment, InfoAddressFragment } from '@/components/InfoDetail';
import { FeaturedSlideshowFragment } from '@/components/WhatWeLove/fragment';
import { TruthFragment } from '@/components/HomeTruths';

export const apartmentDetailQuery = graphql(
  `
    query ApartmentDetailQuery($locale: SiteLocale!, $slug: String!) {
      apartment(locale: $locale, filter: { slug: { eq: $slug } }) {
        id
        name
        slug
        claim(locale: $locale)
        description(locale: $locale, markdown: true)
        highlight(locale: $locale)
        bedrooms
        bathrooms
        sleeps
        beddyId
        price
        cin
        acaciaReward
        homeTruth(locale: $locale) {
          ...TruthFragment
        }
        featuredSlideshow {
          ...FeaturedSlideshowFragment
        }
        featuredImage {
          responsiveImage(imgixParams: { w: 1400, h: 600, fit: crop }) {
            ...ResponsiveImageFragment
          }
        }
        category {
          id
          name(locale: $locale)
        }
        district {
          name
          slug
          abstract(locale: $locale, markdown: true)
          description(locale: $locale, markdown: true)
          gallery {
            image {
              responsiveImage(imgixParams: { w: 600, h: 400, fit: crop }) {
                ...ResponsiveImageFragment
              }
            }
          }
        }
        gallery {
          ...GalleryImageFragment
        }
        amenities {
          ...AmenityFragment
        }
        comforts {
          ...ComfortFragment
        }
        infoDetail(locale: $locale) {
          __typename
          ... on InfoTextRecord {
            ...InfoTextFragment
          }
          ... on InfoAddressRecord {
            ...InfoAddressFragment
          }
        }
      }
    }
  `,
  [
    ResponsiveImageFragment,
    GalleryImageFragment,
    AmenityFragment,
    ComfortFragment,
    InfoTextFragment,
    InfoAddressFragment,
    FeaturedSlideshowFragment,
    TruthFragment,
  ],
);
