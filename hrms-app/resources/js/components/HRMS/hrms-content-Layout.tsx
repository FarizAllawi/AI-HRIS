import React from 'react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';

interface ContentLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  createTitle?: string;
  onCreateNew?: () => void;
}

export default function HRMSContentLayout(props: ContentLayoutProps) {
  // When server-side rendering, we only render the layout on the client...
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <div className="flex flex-col lg:flex-row lg:space-x-12">
        <div className="flex-1">
          {/* Header Content */}
          {props.title !== '' && (
            <div className="flex flex-col items-center justify-between py-6 md:flex-row md:py-0">
              <div className="w-full md:w-1/2">
                <Heading
                  title={props?.title || ''}
                  description={props?.description}
                />
              </div>

              {props.createTitle !== '' && props.createTitle !== undefined && (
                <div className="flex w-full md:w-1/2 md:place-content-end">
                  <Button
                    onClick={props.onCreateNew}
                    className="cursor-pointer gap-2"
                  >
                    <IconPlus className="h-4 w-4" />
                    {props.createTitle}
                  </Button>
                </div>
              )}
            </div>
          )}

          <section className="space-y-12">
            <div className="space-y-6">{props.children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
