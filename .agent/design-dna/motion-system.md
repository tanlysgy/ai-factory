# AI Factory — Motion System

Source: P7A Design Review + Raycast/Cursor (counters) + Linear (quiet motion).

## Tokens

| Token | Value |
| --- | --- |
| `--ease-out` | `cubic-bezier(0.22,1,0.36,1)` |
| `--duration-fast` | 150ms (hovers, focus) |
| `--duration-enter` | 500ms (entrance) |
| `--duration-count` | 800ms (number counters) |
| `--stagger` | 60ms list stagger |

## Entrance

- Elements: `opacity: 0; transform: translateY(12px)` → visible.
- Duration 500ms, ease-out, list stagger 60ms, only first paint.
- Apply to result/hero sections; never to the nav or critical buttons.

## Hover / focus

- Buttons: translate(-2px,-2px) + hard shadow, 150ms.
- Cards/rows: background 4% ink, 150ms; shadow only if used by that design.
- Links: underline with 4px offset, 150ms.

## Counters

- Factory stats and score numbers animate 0 → value over 800ms, tabular-nums.
- Trigger in viewport; respect reduced motion.

## Reduced motion

- Wrap all transitions/animations in `@media (prefers-reduced-motion: reduce)`:
  transition-duration 0.01ms, animation none, counters jump instantly.
