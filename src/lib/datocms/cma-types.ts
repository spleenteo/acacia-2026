import type { ItemTypeDefinition } from '@datocms/cma-client';

type EnvironmentSettings = {
  locales: 'en' | 'it';
};

export type Apartment = ItemTypeDefinition<
  EnvironmentSettings,
  '2726',
  {
    beddy_id: {
      type: 'string';
    };
    notes: {
      type: 'json';
    };
    category: {
      type: 'link';
    };
    cin: {
      type: 'string';
    };
    name: {
      type: 'string';
    };
    description: {
      type: 'text';
      localized: true;
    };
    district: {
      type: 'link';
    };
    featured_image: {
      type: 'file';
    };
    amenities: {
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
    featured_slideshow: {
      type: 'gallery';
    };
    house_badge: {
      type: 'link';
    };
    wwl_gallery: {
      type: 'links';
    };
    home_truth: {
      type: 'rich_text';
      blocks: TruthBlock;
      localized: true;
    };
    bedrooms: {
      type: 'integer';
    };
    ape: {
      type: 'string';
    };
    acacia_reward: {
      type: 'boolean';
    };
    bathrooms: {
      type: 'integer';
    };
    price: {
      type: 'string';
    };
    info_detail: {
      type: 'rich_text';
      blocks: InfoTextBlock | InfoAddressBlock;
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
    description_old: {
      type: 'text';
      localized: true;
    };
    name: {
      type: 'string';
      localized: true;
    };
    slug: {
      type: 'slug';
      localized: true;
    };
    boxes: {
      type: 'links';
    };
    claim: {
      type: 'string';
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
    image: {
      type: 'file';
    };
    description: {
      type: 'structured_text';
      localized: true;
    };
    related_content: {
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

export type BlogCategory = ItemTypeDefinition<
  EnvironmentSettings,
  '2763',
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
    posts: {
      type: 'links';
    };
    question: {
      type: 'string';
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
    services: {
      type: 'links';
    };
    short_answer: {
      type: 'structured_text';
      blocks: VideoBlock | ImageBlock | ImageGalleryBlock | CtaBlogPostBlock;
      localized: true;
    };
    long_answer: {
      type: 'structured_text';
      blocks: VideoBlock | ImageBlock | ImageGalleryBlock | CtaBlogPostBlock;
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
      blocks: SectionHeaderBlock;
      localized: true;
    };
    moods_header: {
      type: 'single_block';
      blocks: SectionHeaderBlock;
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
    moods: {
      type: 'links';
    };
    subtitle: {
      type: 'text';
      localized: true;
    };
    buttons: {
      type: 'rich_text';
      blocks: ButtonBlock;
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

export type MoodItem = ItemTypeDefinition<
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
export const MoodItem = {
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

export type IndexAcacialife = ItemTypeDefinition<
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
    hero: {
      type: 'single_block';
      blocks: HeroIndexBlock;
      localized: true;
    };
  }
>;
export const IndexAcacialife = {
  ID: '3125',
  REF: { type: 'item_type', id: '3125' },
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

export type TruthBlock = ItemTypeDefinition<
  EnvironmentSettings,
  '110472',
  {
    body: {
      type: 'text';
    };
  }
>;
export const TruthBlock = {
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

export type InfoTextBlock = ItemTypeDefinition<
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
export const InfoTextBlock = {
  ID: '326825',
  REF: { type: 'item_type', id: '326825' },
} as const;

export type InfoAddressBlock = ItemTypeDefinition<
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
export const InfoAddressBlock = {
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
      blocks: MenuItemBlock | MenuExternalItemBlock;
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
    embedded_video: {
      type: 'video';
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

export type HeroIndexBlock = ItemTypeDefinition<
  EnvironmentSettings,
  'EYk_5XZGRsatdHYno4e7-g',
  {
    color: {
      type: 'string';
    };
    title: {
      type: 'string';
    };
    subtitle: {
      type: 'string';
    };
    featured_image: {
      type: 'file';
    };
  }
>;
export const HeroIndexBlock = {
  ID: 'EYk_5XZGRsatdHYno4e7-g',
  REF: { type: 'item_type', id: 'EYk_5XZGRsatdHYno4e7-g' },
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

export type MenuDropdownBlock = ItemTypeDefinition<
  EnvironmentSettings,
  'JQeKJz2cRJ6tXjeGw9dQTw',
  {
    static_label: {
      type: 'string';
    };
    pages: {
      type: 'rich_text';
      blocks: MenuItemBlock;
    };
  }
>;
export const MenuDropdownBlock = {
  ID: 'JQeKJz2cRJ6tXjeGw9dQTw',
  REF: { type: 'item_type', id: 'JQeKJz2cRJ6tXjeGw9dQTw' },
} as const;

export type Post = ItemTypeDefinition<
  EnvironmentSettings,
  'MbGgb5GrS4uafx00M18eJA',
  {
    slug: {
      type: 'slug';
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
    title: {
      type: 'string';
      localized: true;
    };
    abstract: {
      type: 'text';
      localized: true;
    };
    content: {
      type: 'structured_text';
      blocks:
        | VideoBlock
        | ButtonBlock
        | ImageBlock
        | ImageGalleryBlock
        | CtaBlogPostBlock
        | CtaFaqBlock;
      localized: true;
    };
    featured_image: {
      type: 'file';
    };
    category: {
      type: 'link';
    };
  }
>;
export const Post = {
  ID: 'MbGgb5GrS4uafx00M18eJA',
  REF: { type: 'item_type', id: 'MbGgb5GrS4uafx00M18eJA' },
} as const;

export type RecordBin = ItemTypeDefinition<
  EnvironmentSettings,
  'PEvhd5OVRc6mRQtWfFt8JQ',
  {
    label: {
      type: 'string';
    };
    model: {
      type: 'string';
    };
    date_of_deletion: {
      type: 'date_time';
    };
    record_body: {
      type: 'json';
    };
  }
>;
export const RecordBin = {
  ID: 'PEvhd5OVRc6mRQtWfFt8JQ',
  REF: { type: 'item_type', id: 'PEvhd5OVRc6mRQtWfFt8JQ' },
} as const;

export type MenuItemBlock = ItemTypeDefinition<
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
export const MenuItemBlock = {
  ID: 'QvVizRpcSBioYs3t8o5vDQ',
  REF: { type: 'item_type', id: 'QvVizRpcSBioYs3t8o5vDQ' },
} as const;

export type HeroBlock = ItemTypeDefinition<
  EnvironmentSettings,
  'R3X0bbNgQ0-6m1e4ydu9QA',
  {
    hero_header: {
      type: 'single_block';
      blocks: SectionHeaderBlock;
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

export type MenuExternalItemBlock = ItemTypeDefinition<
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
export const MenuExternalItemBlock = {
  ID: 'S-IlPzGxRNy5H1eByC2yXQ',
  REF: { type: 'item_type', id: 'S-IlPzGxRNy5H1eByC2yXQ' },
} as const;

export type LandingPage = ItemTypeDefinition<
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
      blocks: VideoBlock | ImageBlock | ImageGalleryBlock | CtaFaqBlock;
      localized: true;
    };
  }
>;
export const LandingPage = {
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

export type SocialLinkBlock = ItemTypeDefinition<
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
export const SocialLinkBlock = {
  ID: 'WiMHjAJsQqmSl0NMPGkSeA',
  REF: { type: 'item_type', id: 'WiMHjAJsQqmSl0NMPGkSeA' },
} as const;

export type SchemaMigration = ItemTypeDefinition<
  EnvironmentSettings,
  'YeOxxlBLR_iVo0C91KZVfw',
  {
    name: {
      type: 'string';
    };
  }
>;
export const SchemaMigration = {
  ID: 'YeOxxlBLR_iVo0C91KZVfw',
  REF: { type: 'item_type', id: 'YeOxxlBLR_iVo0C91KZVfw' },
} as const;

export type IndexPage = ItemTypeDefinition<
  EnvironmentSettings,
  'ZOa9QihDSZ2Fi8kBsrv0jg',
  {
    hero: {
      type: 'single_block';
      blocks: HeroIndexBlock;
      localized: true;
    };
    seo: {
      type: 'seo';
      localized: true;
    };
    description: {
      type: 'structured_text';
      localized: true;
    };
    slug: {
      type: 'slug';
      localized: true;
    };
  }
>;
export const IndexPage = {
  ID: 'ZOa9QihDSZ2Fi8kBsrv0jg',
  REF: { type: 'item_type', id: 'ZOa9QihDSZ2Fi8kBsrv0jg' },
} as const;

export type CtaBlogPostBlock = ItemTypeDefinition<
  EnvironmentSettings,
  'bb9IfZPPRQWgoPCDbdkdeg',
  {
    post: {
      type: 'link';
    };
  }
>;
export const CtaBlogPostBlock = {
  ID: 'bb9IfZPPRQWgoPCDbdkdeg',
  REF: { type: 'item_type', id: 'bb9IfZPPRQWgoPCDbdkdeg' },
} as const;

export type CtaFaqBlock = ItemTypeDefinition<
  EnvironmentSettings,
  'cAZ0WadJTNaKprh6welhew',
  {
    faq: {
      type: 'link';
    };
  }
>;
export const CtaFaqBlock = {
  ID: 'cAZ0WadJTNaKprh6welhew',
  REF: { type: 'item_type', id: 'cAZ0WadJTNaKprh6welhew' },
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
      blocks: MenuDropdownBlock | MenuItemBlock | MenuExternalItemBlock;
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
      blocks: SocialLinkBlock;
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

export type SectionHeaderBlock = ItemTypeDefinition<
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
export const SectionHeaderBlock = {
  ID: 'fohy5eWKQ8-3vZFwvn_r0w',
  REF: { type: 'item_type', id: 'fohy5eWKQ8-3vZFwvn_r0w' },
} as const;

export type AnyBlock =
  | TruthBlock
  | InfoTextBlock
  | InfoAddressBlock
  | FooterMenuBlock
  | VideoBlock
  | ButtonBlock
  | HeroIndexBlock
  | ImageBlock
  | MenuDropdownBlock
  | MenuItemBlock
  | HeroBlock
  | MenuExternalItemBlock
  | ImageGalleryBlock
  | SocialLinkBlock
  | CtaBlogPostBlock
  | CtaFaqBlock
  | SectionHeaderBlock;
export type AnyModel =
  | Apartment
  | GalleryImage
  | District
  | Service
  | ServiceCategories
  | Mood
  | BlogCategory
  | Paragraph
  | Image
  | Faq
  | Guestbook
  | HomePage
  | MoodItem
  | CallToAction
  | ApartmentCategory
  | IndexAcacialife
  | Tip
  | Redirect
  | Essential
  | Amenity
  | InfoLabel
  | Post
  | RecordBin
  | Translation
  | LandingPage
  | SchemaMigration
  | IndexPage
  | App
  | HouseBadge
  | Comfort;
export type AnyBlockOrModel = AnyBlock | AnyModel;
