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
export type Truth = ItemTypeDefinition<
  EnvironmentSettings,
  '110472',
  {
    body: {
      type: 'text';
    };
  }
>;
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
export type TestModelPrimary = ItemTypeDefinition<
  EnvironmentSettings,
  'Ct9bxD2dQsWwkGjtN98moA',
  {}
>;
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
