// Escape user-supplied text before inlining into HTML email bodies.
// Skipping this lets anyone send a contact form with <script>/<img> tags
// that render in our inbox — phishing bait or a broken layout, either way bad.
export function escapeHtml(value: unknown): string {
  if (value == null) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
