import type { ItemTypeDefinition } from '@datocms/cma-client';

type EnvironmentSettings = {
  locales: 'en' | 'it';
};

export type Apartment = ItemTypeDefinition<
  EnvironmentSettings,
  '2726',
  {
    notes: {
      type: 'json';
    };
    beddy_id: {
      type: 'string';
    };
    name: {
      type: 'string';
    };
    featured_slideshow: {
      type: 'gallery';
    };
    cin: {
      type: 'string';
    };
    featured_image: {
      type: 'file';
    };
    district: {
      type: 'link';
    };
    description: {
      type: 'text';
      localized: true;
    };
    wwl_gallery: {
      type: 'links';
    };
    sleeps: {
      type: 'integer';
    };
    property_id: {
      type: 'string';
    };
    claim: {
      type: 'string';
      localized: true;
    };
    category: {
      type: 'link';
    };
    house_badge: {
      type: 'link';
    };
    bedrooms: {
      type: 'integer';
    };
    ape: {
      type: 'string';
    };
    amenities: {
      type: 'links';
    };
    home_truth: {
      type: 'rich_text';
      blocks: Truth;
      localized: true;
    };
    bathrooms: {
      type: 'integer';
    };
    acacia_reward: {
      type: 'boolean';
    };
    price: {
      type: 'string';
    };
    info_detail: {
      type: 'rich_text';
      blocks: InfoText | InfoAddress;
      localized: true;
    };
    comforts: {
      type: 'links';
    };
    seo: {
      type: 'seo';
      localized: true;
    };
    slug: {
      type: 'slug';
    };
  }
>;
export const Apartment = {
  ID: '2726',
  REF: { type: 'item_type', id: '2726' },
} as const;

export type GalleryImage = ItemTypeDefinition<
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
export const GalleryImage = {
  ID: '2729',
  REF: { type: 'item_type', id: '2729' },
} as const;

export type District = ItemTypeDefinition<
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
export const District = {
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
    answer_structured: {
      type: 'structured_text';
      localized: true;
    };
    services: {
      type: 'links';
    };
    posts: {
      type: 'links';
    };
    slug: {
      type: 'slug';
      localized: true;
    };
    position: {
      type: 'integer';
    };
    parent_id: {
      type: 'string';
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
    beddy_id: {
      type: 'string';
    };
    highlights_header: {
      type: 'single_block';
      blocks: SectionHeader;
      localized: true;
    };
    moods_header: {
      type: 'single_block';
      blocks: SectionHeader;
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
    title: {
      type: 'text';
      localized: true;
    };
    highlighted_apartments: {
      type: 'links';
    };
    moods_title: {
      type: 'string';
      localized: true;
    };
    subtitle: {
      type: 'text';
      localized: true;
    };
    buttons: {
      type: 'rich_text';
      blocks: ButtonBlock;
    };
    claim: {
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

export type IndexApartment = ItemTypeDefinition<
  EnvironmentSettings,
  '2970',
  {
    seo: {
      type: 'seo';
      localized: true;
    };
    title: {
      type: 'string';
      localized: true;
    };
    intro: {
      type: 'text';
      localized: true;
    };
    slug: {
      type: 'slug';
      localized: true;
    };
    subtitle: {
      type: 'text';
      localized: true;
    };
    featured_image: {
      type: 'file';
    };
    sections: {
      type: 'rich_text';
      blocks: HeroBlock;
    };
  }
>;
export const IndexApartment = {
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

export type Essential = ItemTypeDefinition<
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
export const Essential = {
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

export type Amenity = ItemTypeDefinition<
  EnvironmentSettings,
  '114485',
  {
    name: {
      type: 'string';
      localized: true;
    };
    icon: {
      type: 'string';
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
export const Amenity = {
  ID: '114485',
  REF: { type: 'item_type', id: '114485' },
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

export type FooterMenuBlock = ItemTypeDefinition<
  EnvironmentSettings,
  'ATeUuoQZRh-fBh5SQfEtTw',
  {
    widget_label: {
      type: 'string';
    };
    nav_links: {
      type: 'rich_text';
      blocks: MenuItem | MenuExternalItem;
    };
  }
>;
export const FooterMenuBlock = {
  ID: 'ATeUuoQZRh-fBh5SQfEtTw',
  REF: { type: 'item_type', id: 'ATeUuoQZRh-fBh5SQfEtTw' },
} as const;

export type VideoBlock = ItemTypeDefinition<
  EnvironmentSettings,
  'A0cNQOy5SuONmoLpo8x6bg',
  {
    asset: {
      type: 'file';
    };
  }
>;
export const VideoBlock = {
  ID: 'A0cNQOy5SuONmoLpo8x6bg',
  REF: { type: 'item_type', id: 'A0cNQOy5SuONmoLpo8x6bg' },
} as const;

export type ButtonBlock = ItemTypeDefinition<
  EnvironmentSettings,
  'D6Mq0lExTdaSzsqpy02N0g',
  {
    button: {
      type: 'json';
    };
  }
>;
export const ButtonBlock = {
  ID: 'D6Mq0lExTdaSzsqpy02N0g',
  REF: { type: 'item_type', id: 'D6Mq0lExTdaSzsqpy02N0g' },
} as const;

export type ImageBlock = ItemTypeDefinition<
  EnvironmentSettings,
  'GEcAJMbwRta4jX1Kfz1kLQ',
  {
    asset: {
      type: 'file';
    };
  }
>;
export const ImageBlock = {
  ID: 'GEcAJMbwRta4jX1Kfz1kLQ',
  REF: { type: 'item_type', id: 'GEcAJMbwRta4jX1Kfz1kLQ' },
} as const;

export type MenuDropdown = ItemTypeDefinition<
  EnvironmentSettings,
  'JQeKJz2cRJ6tXjeGw9dQTw',
  {
    static_label: {
      type: 'string';
    };
    pages: {
      type: 'rich_text';
      blocks: MenuItem;
    };
  }
>;
export const MenuDropdown = {
  ID: 'JQeKJz2cRJ6tXjeGw9dQTw',
  REF: { type: 'item_type', id: 'JQeKJz2cRJ6tXjeGw9dQTw' },
} as const;

export type MenuItem = ItemTypeDefinition<
  EnvironmentSettings,
  'QvVizRpcSBioYs3t8o5vDQ',
  {
    label: {
      type: 'string';
    };
    page: {
      type: 'link';
    };
  }
>;
export const MenuItem = {
  ID: 'QvVizRpcSBioYs3t8o5vDQ',
  REF: { type: 'item_type', id: 'QvVizRpcSBioYs3t8o5vDQ' },
} as const;

export type HeroBlock = ItemTypeDefinition<
  EnvironmentSettings,
  'R3X0bbNgQ0-6m1e4ydu9QA',
  {
    hero_header: {
      type: 'single_block';
      blocks: SectionHeader;
    };
    hero_image: {
      type: 'file';
    };
    buttons: {
      type: 'rich_text';
      blocks: ButtonBlock;
    };
  }
>;
export const HeroBlock = {
  ID: 'R3X0bbNgQ0-6m1e4ydu9QA',
  REF: { type: 'item_type', id: 'R3X0bbNgQ0-6m1e4ydu9QA' },
} as const;

export type Translation = ItemTypeDefinition<
  EnvironmentSettings,
  'SEhOnKQrTeqJFN2XzZZBOg',
  {
    key: {
      type: 'string';
    };
    value: {
      type: 'string';
      localized: true;
    };
  }
>;
export const Translation = {
  ID: 'SEhOnKQrTeqJFN2XzZZBOg',
  REF: { type: 'item_type', id: 'SEhOnKQrTeqJFN2XzZZBOg' },
} as const;

export type MenuExternalItem = ItemTypeDefinition<
  EnvironmentSettings,
  'S-IlPzGxRNy5H1eByC2yXQ',
  {
    label: {
      type: 'string';
    };
    url: {
      type: 'string';
    };
  }
>;
export const MenuExternalItem = {
  ID: 'S-IlPzGxRNy5H1eByC2yXQ',
  REF: { type: 'item_type', id: 'S-IlPzGxRNy5H1eByC2yXQ' },
} as const;

export type Page = ItemTypeDefinition<
  EnvironmentSettings,
  'U_D3IZZUTcOj76Aaxqk73g',
  {
    slug: {
      type: 'slug';
      localized: true;
    };
    seo_settings_social: {
      type: 'seo';
      localized: true;
    };
    title: {
      type: 'string';
      localized: true;
    };
    sections: {
      type: 'rich_text';
      blocks: HeroBlock;
      localized: true;
    };
    structured_text: {
      type: 'structured_text';
      blocks: VideoBlock | ImageBlock | ImageGalleryBlock;
      localized: true;
    };
  }
>;
export const Page = {
  ID: 'U_D3IZZUTcOj76Aaxqk73g',
  REF: { type: 'item_type', id: 'U_D3IZZUTcOj76Aaxqk73g' },
} as const;

export type ImageGalleryBlock = ItemTypeDefinition<
  EnvironmentSettings,
  'VKlYOF--Q0ap0Ca4rsYkqA',
  {
    assets: {
      type: 'gallery';
    };
  }
>;
export const ImageGalleryBlock = {
  ID: 'VKlYOF--Q0ap0Ca4rsYkqA',
  REF: { type: 'item_type', id: 'VKlYOF--Q0ap0Ca4rsYkqA' },
} as const;

export type SocialLink = ItemTypeDefinition<
  EnvironmentSettings,
  'WiMHjAJsQqmSl0NMPGkSeA',
  {
    platform: {
      type: 'string';
    };
    url: {
      type: 'string';
    };
    icon_name: {
      type: 'string';
    };
  }
>;
export const SocialLink = {
  ID: 'WiMHjAJsQqmSl0NMPGkSeA',
  REF: { type: 'item_type', id: 'WiMHjAJsQqmSl0NMPGkSeA' },
} as const;

export type App = ItemTypeDefinition<
  EnvironmentSettings,
  'c6zF9LTeRrSc71p8FnBSYQ',
  {
    callout_background: {
      type: 'color';
    };
    footer_text: {
      type: 'structured_text';
    };
    nav_items: {
      type: 'rich_text';
      blocks: MenuDropdown | MenuItem | MenuExternalItem;
      localized: true;
    };
    callout_text: {
      type: 'text';
      localized: true;
    };
    footer_links: {
      type: 'rich_text';
      blocks: FooterMenuBlock;
      localized: true;
    };
    social_links: {
      type: 'rich_text';
      blocks: SocialLink;
    };
    legal_text: {
      type: 'structured_text';
      localized: true;
    };
  }
>;
export const App = {
  ID: 'c6zF9LTeRrSc71p8FnBSYQ',
  REF: { type: 'item_type', id: 'c6zF9LTeRrSc71p8FnBSYQ' },
} as const;

export type HouseBadge = ItemTypeDefinition<
  EnvironmentSettings,
  'dLjNwl31TXeXlDIyRuc3IA',
  {
    label: {
      type: 'string';
      localized: true;
    };
  }
>;
export const HouseBadge = {
  ID: 'dLjNwl31TXeXlDIyRuc3IA',
  REF: { type: 'item_type', id: 'dLjNwl31TXeXlDIyRuc3IA' },
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

export type SectionHeader = ItemTypeDefinition<
  EnvironmentSettings,
  'fohy5eWKQ8-3vZFwvn_r0w',
  {
    label: {
      type: 'string';
    };
    title: {
      type: 'text';
    };
    subtitle: {
      type: 'string';
    };
  }
>;
export const SectionHeader = {
  ID: 'fohy5eWKQ8-3vZFwvn_r0w',
  REF: { type: 'item_type', id: 'fohy5eWKQ8-3vZFwvn_r0w' },
} as const;

export type AnyBlock =
  | Truth
  | InfoText
  | InfoAddress
  | FooterMenuBlock
  | VideoBlock
  | ButtonBlock
  | ImageBlock
  | MenuDropdown
  | MenuItem
  | HeroBlock
  | MenuExternalItem
  | ImageGalleryBlock
  | SocialLink
  | SectionHeader;
export type AnyModel =
  | Apartment
  | GalleryImage
  | District
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
  | IndexApartment
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
  | Essential
  | Amenity
  | InfoLabel
  | Translation
  | Page
  | App
  | HouseBadge
  | Comfort;
export type AnyBlockOrModel = AnyBlock | AnyModel;
