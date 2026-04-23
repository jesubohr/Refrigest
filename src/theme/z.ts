/** Z-index scale — never use arbitrary values, always reference these tokens */
export const z = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
} as const

export type ZToken = keyof typeof z
