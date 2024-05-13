'use client';

import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProviderProps } from 'next-themes/dist/types';
import React from 'react';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <TonConnectUIProvider
      manifestUrl="https://art404app.pages.dev/tonconnect-manifest.json"
      uiPreferences={{
        theme: THEME.DARK,
      }}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/art404bot/app',
      }}
    >
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </TonConnectUIProvider>
  );
}
