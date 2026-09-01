// Shared page-enter transition — motion-safe so it's skipped entirely under
// prefers-reduced-motion rather than just running faster.
export const pageEnter = 'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 duration-300 ease-out'
