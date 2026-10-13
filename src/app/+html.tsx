import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import React from 'react';

/**
 * Root HTML template for Expo Router Web.
 * Configures viewport-fit=cover, theme-color, and apple-mobile-web-app-status-bar-style
 * so the status bar seamlessly blends with the app's dark theme on iPhone PWAs.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  const { bodyAttributes, bodyNodes, htmlAttributes, headNodes } = useServerDocumentContext();

  return (
    <html lang="en" {...htmlAttributes} style={{ backgroundColor: '#0B0F17' }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no, viewport-fit=cover"
        />
        <title>Sthira</title>

        {/* Seamless iOS Status Bar & PWA configuration */}
        <meta name="theme-color" content="#0B0F17" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sthira" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        <ScrollViewStyleReset />

        {headNodes}

        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                background-color: #0B0F17 !important;
                height: 100%;
                width: 100%;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
            `,
          }}
        />
      </head>
      <body {...bodyAttributes} style={{ backgroundColor: '#0B0F17' }}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
