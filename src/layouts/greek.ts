import { Layout } from './types';

export const greek: Layout = {
  name: 'greek',
  displayName: "Ελληνικά",
  scriptRange: [{ from: 0x370, to: 0x3ff }],
  klidWindows: '00000408',
  default: [
    "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} ; ς ε ρ τ υ θ ι ο π [ ] \\",
    "{lock} α σ δ φ γ η ξ κ λ ΄ ' {enter}",
    "{shift} < ζ χ ψ ω β ν μ , . / {shift}",
    ".com @ {space}",
  ],
};
