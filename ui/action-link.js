import { icon } from '../vendor/lucide/icons.js';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

/** Native link with the shared atlas surface and a finite CSS hover sweep. */
export function actionLink(href, label, iconName, { external = false, className = '', document = false } = {}) {
  return `<a class="action-link relative isolate overflow-hidden ${escape(className)}" href="${escape(href)}"${external ? ` target="_blank" rel="noopener" aria-label="${escape(label)}（新标签页）"` : ''}${document ? ' data-document-link' : ''}><span class="action-link-glare absolute inset-0 z-0 pointer-events-none" aria-hidden="true"></span><span class="action-link-content relative z-10">${icon(iconName)}<span>${escape(label)}</span></span></a>`;
}
