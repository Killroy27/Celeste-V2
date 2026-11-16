// Logos officiels des stores, dans leurs vraies couleurs (seul le logo est en couleur).

export function AppleLogo({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#000000"
        d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1zM13.9 4.9c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5z"
      />
    </svg>
  );
}

export function GooglePlayLogo({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M3.6 1.6c-.3.3-.4.7-.4 1.2v18.4c0 .5.1.9.4 1.2l.1.1L13.9 12v-.2L3.7 1.5l-.1.1z" />
      <path fill="#FBBC04" d="M17.3 15.4 13.9 12v-.2l3.4-3.4.1.1 4 2.3c1.2.7 1.2 1.7 0 2.4l-4 2.3-.1-.1z" />
      <path fill="#EA4335" d="M17.4 15.3 13.9 11.9 3.6 22.4c.4.4 1 .4 1.7 0l12.1-7.1" />
      <path fill="#34A853" d="M17.4 8.5 5.3 1.6c-.7-.4-1.3-.4-1.7 0l10.3 10.3 3.5-3.4z" />
    </svg>
  );
}
