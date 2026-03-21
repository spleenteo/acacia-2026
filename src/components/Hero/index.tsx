import { type FragmentOf, readFragment } from '@/lib/datocms/graphql';
import ResponsiveImage, { ResponsiveImageFragment } from '@/components/ResponsiveImage';
import Button, { ButtonBlockFragment } from '@/components/Button';

type Props = {
  /** Title HTML — can contain inline <em> for italic emphasis */
  title: string;
  subtitle?: string | null;
  buttons?: FragmentOf<typeof ButtonBlockFragment>[];
  image?: FragmentOf<typeof ResponsiveImageFragment> | null;
  /** Slot for extra content at the bottom (e.g. BeddyBar booking widget) */
  children?: React.ReactNode;
  priority?: boolean;
  /** Current locale, passed through to Button for record link resolution */
  locale?: string;
};

export { ButtonBlockFragment };

function unwrapParagraph(html: string): string {
  return html.replace(/^<p>([\s\S]*)<\/p>\n?$/, '$1');
}

/**
 * Full-viewport hero component. Sits flush against the top of the page,
 * sliding under the fixed SiteHeader via negative margin-top.
 *
 * When no background image is provided, renders a transparent hero
 * that blends with the page background.
 */
export default function Hero({
  title,
  subtitle,
  buttons,
  image,
  children,
  priority,
  locale,
}: Props) {
  const hasImage = !!image;

  return (
    <section
      className={[
        'relative flex items-center justify-center min-h-[88svh] overflow-hidden',
        hasImage ? 'bg-dark' : 'bg-surface',
      ].join(' ')}
      style={{ marginTop: 'calc(var(--header-height) * -1)' }}
    >
      {/* Background image */}
      {image && (
        <div className="absolute inset-0">
          <ResponsiveImage
            data={image}
            className="w-full h-full"
            imgStyle={{ objectFit: 'cover', width: '100%', height: '100%' }}
            priority={priority}
          />
        </div>
      )}

      {/* Gradient overlay — only when image is present */}
      {hasImage && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              'linear-gradient(to bottom, rgba(20,15,10,0.38) 0%, transparent 22%)',
              'linear-gradient(to top, rgba(46,40,34,0.82) 0%, rgba(46,40,34,0.12) 52%, transparent 100%)',
            ].join(', '),
          }}
        />
      )}

      {/* Content — centered */}
      <div
        className="relative z-10 w-full px-6 md:px-14 py-20"
        style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h1
            className={[
              'section-title font-heading font-normal leading-[1.06] mb-6',
              'text-[2.75rem] md:text-[4.5rem] lg:text-[5.5rem]',
              hasImage ? 'text-white' : 'text-dark',
            ].join(' ')}
            dangerouslySetInnerHTML={{ __html: unwrapParagraph(title) }}
          />

          {subtitle && (
            <p
              className={[
                'font-body font-normal max-w-2xl mx-auto mb-10 leading-relaxed',
                'text-[1.25rem] md:text-[1.5rem]',
                hasImage ? 'text-white/90' : 'text-muted',
              ].join(' ')}
            >
              {subtitle}
            </p>
          )}

          {buttons && buttons.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {buttons.map((button) => {
                const { id } = readFragment(ButtonBlockFragment, button);
                return <Button key={id} data={button} dark={!hasImage} locale={locale} />;
              })}
            </div>
          )}

          {children && <div className="mt-10">{children}</div>}
        </div>
      </div>
    </section>
  );
}
