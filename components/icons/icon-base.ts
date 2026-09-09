// components/icons/icon-base.ts
//
// Shared visual grammar for every icon in components/icons/*: 32x32 canvas, 1.75
// stroke, teal-800 outline with a single copper-500 accent shape per icon. Pulled out
// of DepartmentIcons.tsx so QuickActionIcons.tsx can use the exact same constants
// rather than a second, easy-to-drift copy of them.

export const iconBase = {
  viewBox: '0 0 32 32',
  fill: 'none',
  'aria-hidden': true,
  focusable: false,
} as const

export const iconStroke = {
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const iconAccentFill = 'var(--icon-accent, #D68060)'
