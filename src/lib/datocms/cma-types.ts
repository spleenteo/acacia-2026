import type { ItemTypeDefinition } from '@datocms/cma-client';

type EnvironmentSettings = {
  locales: 'en' | 'it';
};

export type Apartment = ItemTypeDefinition<
  EnvironmentSettings,
  '2726',
  {
    published: {
      type: 'boolean';
    };
    beddy_id: {
      type: 'string';
    };
    property_id: {
      type: 'string';
    };
    name: {
      type: 'string';
    };
    kigo_id: {
      type: 'string';
    };
    highlight: {
      type: 'string';
      localized: true;
    };
    description: {
      type: 'text';
      localized: true;
    };
    featured_slideshow: {
      type: 'gallery';
    };
    ups: {
      type: 'links';
    };
    kigo_slug: {
      type: 'string';
    };
    gallery: {
      type: 'links';
    };
    box_image: {
      type: 'file';
    };
    category: {
      type: 'link';
    };
    cin: {
      type: 'string';
    };
    claim: {
      type: 'string';
      localized: true;
    };
    cuddles: {
      type: 'links';
    };
    district: {
      type: 'link';
    };
    featured_image: {
      type: 'file';
    };
    home_truth: {
      type: 'rich_text';
      blocks: Truth;
      localized: true;
    };
    sleeps: {
      type: 'integer';
    };
    acacia_reward: {
      type: 'boolean';
    };
    bedrooms: {
      type: 'integer';
    };
    bathrooms: {
      type: 'integer';
    };
    price: {
      type: 'string';
    };
    info_detail: {
      type: 'rich_text';
      blocks: InfoText | InfoAddress;
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
    slug: {
      type: 'slug';
    };
    notes: {
      type: 'json';
    };
    position: {
      type: 'integer';
    };
  }
>;
export const Apartment = {
  ID: '2726',
  REF: { type: 'item_type', id: '2726' },
} as const;

export type GalleryImages = ItemTypeDefinition<
  EnvironmentSettings,
  '2729',
  {
    image: {
      type: 'file';
    };
    description: {
      type: 'text';
      localized: true;
    };
  }
>;
export const GalleryImages = {
  ID: '2729',
  REF: { type: 'item_type', id: '2729' },
} as const;

export type Districts = ItemTypeDefinition<
  EnvironmentSettings,
  '2735',
  {
    name: {
      type: 'string';
    };
    slug: {
      type: 'slug';
    };
    abstract: {
      type: 'text';
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
    description: {
      type: 'text';
      localized: true;
    };
    gallery: {
      type: 'links';
    };
    position: {
      type: 'integer';
    };
  }
>;
export const Districts = {
  ID: '2735',
  REF: { type: 'item_type', id: '2735' },
} as const;

export type Service = ItemTypeDefinition<
  EnvironmentSettings,
  '2736',
  {
    published: {
      type: 'boolean';
    };
    name: {
      type: 'string';
      localized: true;
    };
    abstract: {
      type: 'text';
      localized: true;
    };
    description: {
      type: 'text';
      localized: true;
    };
    featured_image: {
      type: 'file';
    };
    price: {
      type: 'string';
    };
    highlight: {
      type: 'string';
      localized: true;
    };
    category: {
      type: 'link';
    };
    gallery: {
      type: 'links';
    };
    slug: {
      type: 'slug';
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
    trekksoft_id: {
      type: 'integer';
    };
    shop_item: {
      type: 'boolean';
    };
    position: {
      type: 'integer';
    };
  }
>;
export const Service = {
  ID: '2736',
  REF: { type: 'item_type', id: '2736' },
} as const;

export type ServiceCategories = ItemTypeDefinition<
  EnvironmentSettings,
  '2737',
  {
    name: {
      type: 'string';
      localized: true;
    };
    slug: {
      type: 'slug';
      localized: true;
    };
    position: {
      type: 'integer';
    };
  }
>;
export const ServiceCategories = {
  ID: '2737',
  REF: { type: 'item_type', id: '2737' },
} as const;

export type Mood = ItemTypeDefinition<
  EnvironmentSettings,
  '2738',
  {
    name: {
      type: 'string';
      localized: true;
    };
    claim: {
      type: 'string';
      localized: true;
    };
    published: {
      type: 'boolean';
    };
    image: {
      type: 'file';
    };
    description: {
      type: 'text';
      localized: true;
    };
    slug: {
      type: 'slug';
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
    boxes: {
      type: 'links';
    };
    position: {
      type: 'integer';
    };
  }
>;
export const Mood = {
  ID: '2738',
  REF: { type: 'item_type', id: '2738' },
} as const;

export type Post = ItemTypeDefinition<
  EnvironmentSettings,
  '2762',
  {
    published: {
      type: 'boolean';
    };
    title: {
      type: 'string';
    };
    slug: {
      type: 'slug';
    };
    language: {
      type: 'string';
    };
    category: {
      type: 'link';
    };
    featured_image: {
      type: 'file';
    };
    abstract: {
      type: 'text';
    };
    content: {
      type: 'links';
    };
    cta: {
      type: 'link';
    };
    related_posts: {
      type: 'links';
    };
    related_apartments: {
      type: 'links';
    };
    related_services: {
      type: 'links';
    };
    related_districts: {
      type: 'links';
    };
    published_at: {
      type: 'date';
    };
    sticky: {
      type: 'boolean';
    };
    seo: {
      type: 'seo';
    };
  }
>;
export const Post = {
  ID: '2762',
  REF: { type: 'item_type', id: '2762' },
} as const;

export type BlogCategory = ItemTypeDefinition<
  EnvironmentSettings,
  '2763',
  {
    name: {
      type: 'string';
    };
    slug: {
      type: 'slug';
    };
    position: {
      type: 'integer';
    };
  }
>;
export const BlogCategory = {
  ID: '2763',
  REF: { type: 'item_type', id: '2763' },
} as const;

export type Paragraph = ItemTypeDefinition<
  EnvironmentSettings,
  '2764',
  {
    body: {
      type: 'text';
    };
    position: {
      type: 'integer';
    };
  }
>;
export const Paragraph = {
  ID: '2764',
  REF: { type: 'item_type', id: '2764' },
} as const;

export type Image = ItemTypeDefinition<
  EnvironmentSettings,
  '2765',
  {
    image: {
      type: 'file';
    };
    description: {
      type: 'string';
      localized: true;
    };
    url: {
      type: 'string';
      localized: true;
    };
    position: {
      type: 'integer';
    };
  }
>;
export const Image = {
  ID: '2765',
  REF: { type: 'item_type', id: '2765' },
} as const;

export type Faq = ItemTypeDefinition<
  EnvironmentSettings,
  '2803',
  {
    question: {
      type: 'string';
      localized: true;
    };
    answer: {
      type: 'text';
      localized: true;
    };
    services: {
      type: 'links';
    };
    posts: {
      type: 'links';
    };
    position: {
      type: 'integer';
    };
  }
>;
export const Faq = {
  ID: '2803',
  REF: { type: 'item_type', id: '2803' },
} as const;

export type Guestbook = ItemTypeDefinition<
  EnvironmentSettings,
  '2804',
  {
    published: {
      type: 'boolean';
    };
    name: {
      type: 'string';
    };
    title: {
      type: 'string';
    };
    quote: {
      type: 'text';
    };
    channel: {
      type: 'string';
    };
    date: {
      type: 'date';
    };
    apartment: {
      type: 'link';
    };
    service: {
      type: 'link';
    };
  }
>;
export const Guestbook = {
  ID: '2804',
  REF: { type: 'item_type', id: '2804' },
} as const;

export type HomePage = ItemTypeDefinition<
  EnvironmentSettings,
  '2831',
  {
    cta_image: {
      type: 'file';
    };
    title: {
      type: 'string';
      localized: true;
    };
    cta_text: {
      type: 'text';
      localized: true;
    };
    promo_title: {
      type: 'string';
      localized: true;
    };
    cta_label: {
      type: 'string';
      localized: true;
    };
    promo: {
      type: 'rich_text';
      blocks: PromoApartment;
      localized: true;
    };
    cta_link: {
      type: 'link';
    };
    moods_title: {
      type: 'string';
      localized: true;
    };
    moods: {
      type: 'links';
    };
    stay_text: {
      type: 'text';
      localized: true;
    };
    do_text: {
      type: 'text';
      localized: true;
    };
    claim: {
      type: 'string';
      localized: true;
    };
    beddy_id: {
      type: 'string';
    };
    seo: {
      type: 'seo';
      localized: true;
    };
  }
>;
export const HomePage = {
  ID: '2831',
  REF: { type: 'item_type', id: '2831' },
} as const;

export type PageMoods = ItemTypeDefinition<
  EnvironmentSettings,
  '2835',
  {
    title: {
      type: 'string';
      localized: true;
    };
    subtitle: {
      type: 'string';
      localized: true;
    };
    description: {
      type: 'text';
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
  }
>;
export const PageMoods = {
  ID: '2835',
  REF: { type: 'item_type', id: '2835' },
} as const;

export type MoodItems = ItemTypeDefinition<
  EnvironmentSettings,
  '2903',
  {
    name: {
      type: 'string';
    };
    label: {
      type: 'string';
      localized: true;
    };
    object: {
      type: 'links';
    };
    image: {
      type: 'file';
    };
    description: {
      type: 'text';
      localized: true;
    };
    url: {
      type: 'string';
      localized: true;
    };
    position: {
      type: 'integer';
    };
  }
>;
export const MoodItems = {
  ID: '2903',
  REF: { type: 'item_type', id: '2903' },
} as const;

export type CallToAction = ItemTypeDefinition<
  EnvironmentSettings,
  '2905',
  {
    label: {
      type: 'string';
      localized: true;
    };
    url: {
      type: 'string';
      localized: true;
    };
  }
>;
export const CallToAction = {
  ID: '2905',
  REF: { type: 'item_type', id: '2905' },
} as const;

export type PageApartments = ItemTypeDefinition<
  EnvironmentSettings,
  '2970',
  {
    title: {
      type: 'string';
      localized: true;
    };
    subtitle: {
      type: 'string';
      localized: true;
    };
    featured_image: {
      type: 'file';
    };
    intro: {
      type: 'text';
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
  }
>;
export const PageApartments = {
  ID: '2970',
  REF: { type: 'item_type', id: '2970' },
} as const;

export type ApartmentCategory = ItemTypeDefinition<
  EnvironmentSettings,
  '2971',
  {
    name: {
      type: 'string';
      localized: true;
    };
    slug: {
      type: 'slug';
    };
    position: {
      type: 'integer';
    };
  }
>;
export const ApartmentCategory = {
  ID: '2971',
  REF: { type: 'item_type', id: '2971' },
} as const;

export type PageServices = ItemTypeDefinition<
  EnvironmentSettings,
  '2973',
  {
    title: {
      type: 'string';
      localized: true;
    };
    subtitle: {
      type: 'string';
      localized: true;
    };
    featured_image: {
      type: 'file';
    };
    intro: {
      type: 'text';
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
  }
>;
export const PageServices = {
  ID: '2973',
  REF: { type: 'item_type', id: '2973' },
} as const;

export type PageBlog = ItemTypeDefinition<
  EnvironmentSettings,
  '2983',
  {
    title: {
      type: 'string';
      localized: true;
    };
    subtitle: {
      type: 'string';
      localized: true;
    };
    featured_image: {
      type: 'file';
    };
    intro: {
      type: 'text';
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
  }
>;
export const PageBlog = {
  ID: '2983',
  REF: { type: 'item_type', id: '2983' },
} as const;

export type PageDistricts = ItemTypeDefinition<
  EnvironmentSettings,
  '3036',
  {
    title: {
      type: 'string';
      localized: true;
    };
    subtitle: {
      type: 'string';
      localized: true;
    };
    description: {
      type: 'text';
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
  }
>;
export const PageDistricts = {
  ID: '3036',
  REF: { type: 'item_type', id: '3036' },
} as const;

export type PageAcacialife = ItemTypeDefinition<
  EnvironmentSettings,
  '3125',
  {
    title: {
      type: 'string';
      localized: true;
    };
    subtitle: {
      type: 'string';
      localized: true;
    };
    description: {
      type: 'text';
      localized: true;
    };
    featured_image: {
      type: 'file';
    };
    cta: {
      type: 'link';
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
    boxes: {
      type: 'links';
    };
  }
>;
export const PageAcacialife = {
  ID: '3125',
  REF: { type: 'item_type', id: '3125' },
} as const;

export type PageGuestbook = ItemTypeDefinition<
  EnvironmentSettings,
  '3289',
  {
    title: {
      type: 'string';
      localized: true;
    };
    subtitle: {
      type: 'string';
      localized: true;
    };
    featured_image: {
      type: 'file';
    };
    intro: {
      type: 'text';
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
  }
>;
export const PageGuestbook = {
  ID: '3289',
  REF: { type: 'item_type', id: '3289' },
} as const;

export type Offer = ItemTypeDefinition<
  EnvironmentSettings,
  '3389',
  {
    published: {
      type: 'boolean';
    };
    title: {
      type: 'string';
      localized: true;
    };
    featured_image: {
      type: 'file';
    };
    abstract: {
      type: 'text';
      localized: true;
    };
    terms: {
      type: 'text';
      localized: true;
    };
    validity: {
      type: 'string';
      localized: true;
    };
    cta: {
      type: 'link';
      localized: true;
    };
    position: {
      type: 'integer';
    };
  }
>;
export const Offer = {
  ID: '3389',
  REF: { type: 'item_type', id: '3389' },
} as const;

export type PageOffers = ItemTypeDefinition<
  EnvironmentSettings,
  '3392',
  {
    title: {
      type: 'string';
      localized: true;
    };
    subtitle: {
      type: 'string';
      localized: true;
    };
    intro: {
      type: 'text';
      localized: true;
    };
    featured_image: {
      type: 'file';
    };
    seo: {
      type: 'seo';
      localized: true;
    };
  }
>;
export const PageOffers = {
  ID: '3392',
  REF: { type: 'item_type', id: '3392' },
} as const;

export type GuestPost = ItemTypeDefinition<
  EnvironmentSettings,
  '3578',
  {
    text: {
      type: 'text';
    };
    guest_name: {
      type: 'string';
    };
    url: {
      type: 'string';
    };
  }
>;
export const GuestPost = {
  ID: '3578',
  REF: { type: 'item_type', id: '3578' },
} as const;

export type Tip = ItemTypeDefinition<
  EnvironmentSettings,
  '3599',
  {
    published: {
      type: 'boolean';
      localized: true;
    };
    title: {
      type: 'string';
      localized: true;
    };
    featured_image: {
      type: 'file';
    };
    description: {
      type: 'text';
      localized: true;
    };
    url: {
      type: 'string';
      localized: true;
    };
    expiry_date: {
      type: 'date';
    };
  }
>;
export const Tip = {
  ID: '3599',
  REF: { type: 'item_type', id: '3599' },
} as const;

export type PageFaq = ItemTypeDefinition<
  EnvironmentSettings,
  '3706',
  {
    title: {
      type: 'string';
      localized: true;
    };
    subtitle: {
      type: 'string';
      localized: true;
    };
    intro: {
      type: 'text';
      localized: true;
    };
    featured_image: {
      type: 'file';
    };
    seo: {
      type: 'seo';
      localized: true;
    };
  }
>;
export const PageFaq = {
  ID: '3706',
  REF: { type: 'item_type', id: '3706' },
} as const;

export type PageEvent = ItemTypeDefinition<
  EnvironmentSettings,
  '16694',
  {
    title: {
      type: 'string';
      localized: true;
    };
    subtitle: {
      type: 'string';
      localized: true;
    };
    intro: {
      type: 'text';
      localized: true;
    };
    featured_image: {
      type: 'file';
    };
    seo: {
      type: 'seo';
      localized: true;
    };
  }
>;
export const PageEvent = {
  ID: '16694',
  REF: { type: 'item_type', id: '16694' },
} as const;

export type Redirect = ItemTypeDefinition<
  EnvironmentSettings,
  '66155',
  {
    original_url: {
      type: 'string';
    };
    destination_url: {
      type: 'string';
    };
    codice_redirect: {
      type: 'string';
    };
  }
>;
export const Redirect = {
  ID: '66155',
  REF: { type: 'item_type', id: '66155' },
} as const;

export type Cuddle = ItemTypeDefinition<
  EnvironmentSettings,
  '110157',
  {
    name: {
      type: 'string';
      localized: true;
    };
    url: {
      type: 'string';
      localized: true;
    };
    icon: {
      type: 'string';
    };
    position: {
      type: 'integer';
    };
  }
>;
export const Cuddle = {
  ID: '110157',
  REF: { type: 'item_type', id: '110157' },
} as const;

export type Truth = ItemTypeDefinition<
  EnvironmentSettings,
  '110472',
  {
    body: {
      type: 'text';
    };
  }
>;
export const Truth = {
  ID: '110472',
  REF: { type: 'item_type', id: '110472' },
} as const;

export type Up = ItemTypeDefinition<
  EnvironmentSettings,
  '114485',
  {
    name: {
      type: 'string';
      localized: true;
    };
    url: {
      type: 'string';
      localized: true;
    };
    icon: {
      type: 'string';
    };
    position: {
      type: 'integer';
    };
  }
>;
export const Up = {
  ID: '114485',
  REF: { type: 'item_type', id: '114485' },
} as const;

export type PromoApartment = ItemTypeDefinition<
  EnvironmentSettings,
  '182898',
  {
    apartment: {
      type: 'link';
    };
    foto: {
      type: 'file';
    };
    description: {
      type: 'string';
    };
  }
>;
export const PromoApartment = {
  ID: '182898',
  REF: { type: 'item_type', id: '182898' },
} as const;

export type InfoLabel = ItemTypeDefinition<
  EnvironmentSettings,
  '326819',
  {
    name: {
      type: 'string';
      localized: true;
    };
  }
>;
export const InfoLabel = {
  ID: '326819',
  REF: { type: 'item_type', id: '326819' },
} as const;

export type InfoText = ItemTypeDefinition<
  EnvironmentSettings,
  '326825',
  {
    details_label: {
      type: 'link';
    };
    text: {
      type: 'string';
    };
  }
>;
export const InfoText = {
  ID: '326825',
  REF: { type: 'item_type', id: '326825' },
} as const;

export type InfoAddress = ItemTypeDefinition<
  EnvironmentSettings,
  '326828',
  {
    details_label: {
      type: 'link';
    };
    address_map: {
      type: 'lat_lon';
    };
    address_text: {
      type: 'string';
    };
  }
>;
export const InfoAddress = {
  ID: '326828',
  REF: { type: 'item_type', id: '326828' },
} as const;

export type TestModelPrimary = ItemTypeDefinition<
  EnvironmentSettings,
  'Ct9bxD2dQsWwkGjtN98moA',
  {}
>;
export const TestModelPrimary = {
  ID: 'Ct9bxD2dQsWwkGjtN98moA',
  REF: { type: 'item_type', id: 'Ct9bxD2dQsWwkGjtN98moA' },
} as const;

export type Comfort = ItemTypeDefinition<
  EnvironmentSettings,
  'dX-XZIRRRqKPsbO3gBn0rA',
  {
    name: {
      type: 'string';
      localized: true;
    };
    url: {
      type: 'string';
      localized: true;
    };
    icon: {
      type: 'string';
    };
    position: {
      type: 'integer';
    };
  }
>;
export const Comfort = {
  ID: 'dX-XZIRRRqKPsbO3gBn0rA',
  REF: { type: 'item_type', id: 'dX-XZIRRRqKPsbO3gBn0rA' },
} as const;

export type AnyBlock = Truth | PromoApartment | InfoText | InfoAddress;
export type AnyModel =
  | Apartment
  | GalleryImages
  | Districts
  | Service
  | ServiceCategories
  | Mood
  | Post
  | BlogCategory
  | Paragraph
  | Image
  | Faq
  | Guestbook
  | HomePage
  | PageMoods
  | MoodItems
  | CallToAction
  | PageApartments
  | ApartmentCategory
  | PageServices
  | PageBlog
  | PageDistricts
  | PageAcacialife
  | PageGuestbook
  | Offer
  | PageOffers
  | GuestPost
  | Tip
  | PageFaq
  | PageEvent
  | Redirect
  | Cuddle
  | Up
  | InfoLabel
  | TestModelPrimary
  | Comfort;
export type AnyBlockOrModel = AnyBlock | AnyModel;
