interface PlatformBadgeProps {
  platform: 'github' | 'bluesky' | 'x'
  handle: string
}

const PLATFORM_CONFIG = {
  github: {
    url: (h: string) => `https://github.com/${h}`,
    label: (h: string) => h,
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  bluesky: {
    url: (h: string) => `https://bsky.app/profile/${h}`,
    label: (h: string) => `@${h}`,
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.574 6.27.581 1.81 2.813 3.268 4.904 2.86-3.522.603-6.649 2.436-2.868 8.32 8.46 3.317 12.066-.625 13.39-3.222C17.324 15.558 18 12.328 18 12.328c.794.423 1.983.698 2.81.698 1.19 0 1.575-.21 2.19-.698.55-.437 1-1.39 1-2.328 0-.862-.18-1.273-.657-1.762C22.67 7.548 20.478 6.478 18 6.478c-1.988 0-4.152 1.488-6 4.322z" />
      </svg>
    ),
  },
  x: {
    url: (h: string) => `https://x.com/${h}`,
    label: (h: string) => `@${h}`,
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
}

export function PlatformBadge({ platform, handle }: PlatformBadgeProps) {
  const config = PLATFORM_CONFIG[platform]

  return (
    <a
      href={config.url(handle)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors"
    >
      {config.icon}
      <span>{config.label(handle)}</span>
    </a>
  )
}
