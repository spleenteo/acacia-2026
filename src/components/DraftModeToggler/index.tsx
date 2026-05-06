'use client';

import { useTranslations } from 'next-intl';

type Props = {
  draftModeEnabled: boolean;
};

export default function DraftModeToggler({ draftModeEnabled }: Props) {
  const t = useTranslations('draftMode');

  async function handleClick() {
    let response: Response;

    if (draftModeEnabled) {
      response = await fetch('/api/draft-mode/disable');
    } else {
      const token = prompt(t('tokenPrompt'));
      if (!token) {
        return;
      }

      response = await fetch(`/api/draft-mode/enable?token=${token}`);
    }

    if (!response.ok) {
      alert(t('error'));
      return;
    }

    document.location.reload();
  }

  if (draftModeEnabled) {
    return (
      <button type="button" onClick={handleClick} data-tooltip={t('tooltipDisable')}>
        {t('disable')}
      </button>
    );
  }

  return (
    <button type="button" onClick={handleClick} data-tooltip={t('tooltipEnable')}>
      {t('enable')}
    </button>
  );
}
