import React from 'react';

export interface OutingCoverHeaderProps {
  cover_image_url?: string | null;
  cover_image_thumb_url?: string | null;
  cover_image_alt?: string | null;
  cover_photographer_name?: string | null;
  cover_photographer_url?: string | null;
  category?: string;
  area?: string;
  className?: string;
  aspect?: 'card' | 'banner';
}

export function OutingCoverHeader({
  cover_image_url,
  cover_image_alt,
  cover_photographer_name,
  cover_photographer_url,
  category,
  area,
  className = '',
  aspect = 'card',
}: OutingCoverHeaderProps) {
  const isBanner = aspect === 'banner';
  const containerHeightClass = isBanner ? 'h-44 sm:h-52' : 'h-36 sm:h-40';

  // If no cover image exists, render themed placeholder / category color block without stock photo
  if (!cover_image_url) {
    return (
      <div
        className={`relative ${containerHeightClass} w-full overflow-hidden rounded-[20px] bg-gradient-to-br from-[#1b3829] via-[#0f241a] to-[#07130e] border border-white/15 p-4 flex flex-col justify-between shadow-inner ${className}`}
      >
        <div className="flex items-center justify-between">
          {(area || category) && (
            <div className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white/90 uppercase tracking-widest border border-white/20 backdrop-blur-md">
              {area || 'Singapore'} {category ? `· ${category}` : ''}
            </div>
          )}
        </div>
        <div className="text-[12px] font-medium text-white/50 italic">
          No cover photo assigned
        </div>
      </div>
    );
  }

  // Ensure UTM parameters are appended per Unsplash API licensing terms
  const photographerUrl = cover_photographer_url
    ? cover_photographer_url.includes('utm_source=')
      ? cover_photographer_url
      : `${cover_photographer_url}${cover_photographer_url.includes('?') ? '&' : '?'}utm_source=soul_tribe&utm_medium=referral`
    : null;

  const unsplashHomeUrl = 'https://unsplash.com/?utm_source=soul_tribe&utm_medium=referral';

  return (
    <div
      className={`relative ${containerHeightClass} w-full overflow-hidden rounded-[20px] bg-black/60 border border-white/15 shadow-md ${className}`}
    >
      <img
        src={cover_image_url}
        alt={cover_image_alt || 'Outing cover image'}
        className="h-full w-full object-cover opacity-90 transition-transform duration-300 hover:scale-105"
      />

      {(area || category) && (
        <div className="absolute top-3 left-3 rounded-full bg-black/75 px-3 py-1 text-[10.5px] font-bold text-white uppercase backdrop-blur-md border border-white/20 z-10">
          {area || 'Singapore'} {category ? `· ${category}` : ''}
        </div>
      )}

      {/* Mandatory Unsplash Attribution Credit Line (only if Unsplash photographer metadata exists) */}
      {cover_photographer_name && photographerUrl && (
        <div className="absolute bottom-2 right-2.5 z-10 rounded-md bg-black/75 px-2.5 py-1 text-[10px] font-medium text-white/80 backdrop-blur-md border border-white/15 shadow-sm">
          Photo by{' '}
          <a
            href={photographerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-white font-semibold hover:text-amber-200"
          >
            {cover_photographer_name}
          </a>{' '}
          on{' '}
          <a
            href={unsplashHomeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-white font-semibold hover:text-amber-200"
          >
            Unsplash
          </a>
        </div>
      )}
    </div>
  );
}
