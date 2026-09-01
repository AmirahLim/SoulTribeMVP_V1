'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@soul-tribe/ui';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PersonDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('PersonDetail error caught:', error);
  }, [error]);

  return (
    <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-xl">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="mt-4 text-[24px] font-extrabold text-white">Unable to Load Profile</h1>
      <p className="mt-2 text-[14px] text-white/75 max-w-[340px] leading-relaxed">
        We encountered a temporary issue rendering this member profile.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => reset()}>
          <RefreshCw className="mr-1.5 h-4 w-4" /> Try Again
        </Button>
        <Link href="/people">
          <Button variant="primary" size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Return to People
          </Button>
        </Link>
      </div>
    </div>
  );
}
