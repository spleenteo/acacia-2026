'use client';

type Props = {
  name: string;
  className?: string;
};

/**
 * In-page anchor to the apartment's district section (#district). Scrolls in JS
 * (preventDefault) so the URL — and the apartment slug — is never touched, like
 * the hero pill. Client component so it can be used inside the server-rendered
 * InfoDetail without making that file `'use client'` (which would break the
 * gql.tada fragments it exports).
 */
export default function DistrictAnchor({ name, className }: Props) {
  return (
    <a
      href="#district"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById('district')?.scrollIntoView({ behavior: 'smooth' });
      }}
      className={className}
    >
      {name}
    </a>
  );
}
