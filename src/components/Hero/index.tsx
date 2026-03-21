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
};

export { ButtonBlockFragment };

/**
 * Full-viewport hero component. Sits flush against the top of the page,
 * sliding under the fixed SiteHeader via negative margin-top.
 *
 * Double gradient overlay:
 * - Top: subtle dark veil to keep nav links readable regardless of photo content
 * - Bottom: heavier warm gradient to make title/CTA legible
 */
export default function Hero({ title, subtitle, buttons, image, children, priority }: Props) {
  return (
    <section
      className="relative flex items-end min-h-[88svh] overflow-hidden bg-dark"
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

      {/* Double gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'linear-gradient(to bottom, rgba(20,15,10,0.38) 0%, transparent 22%)',
            'linear-gradient(to top, rgba(46,40,34,0.82) 0%, rgba(46,40,34,0.12) 52%, transparent 100%)',
          ].join(', '),
        }}
      />

      {/* Content — bottom-left, mobile safe area */}
      <div
        className="relative z-10 w-full px-6 md:px-14 pb-12"
        style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-6xl mx-auto">
          <h1
            className="font-heading font-normal text-white leading-[1.08] mb-5
              text-[2.25rem] md:text-hero lg:text-[4.5rem]"
            dangerouslySetInnerHTML={{ __html: title }}
          />

          {subtitle && (
            <p className="font-body font-normal text-white/90 text-[1.125rem] md:text-[1.375rem] max-w-xl mb-8 leading-relaxed">
              {subtitle}
            </p>
          )}

          {buttons && buttons.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {buttons.map((button) => {
                const { id } = readFragment(ButtonBlockFragment, button);
                return <Button key={id} data={button} />;
              })}
            </div>
          )}

          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
