/** Copies the current file; changing files or destroying cancels stale feedback. */
export function mountCopyButton(button, { notify, write = text => navigator.clipboard.writeText(text) }) {
  const label = button.querySelector('[data-copy-label]');
  let source = '', revision = 0, timer;
  function idle() {
    button.dataset.state = 'idle'; label.textContent = '复制源码'; button.disabled = !source;
  }
  async function copy() {
    if (!source || button.disabled) return;
    const version = revision, text = source;
    button.disabled = true;
    try {
      await write(text);
      if (version !== revision) return;
      button.dataset.state = 'copied'; label.textContent = '已复制'; button.disabled = false;
      clearTimeout(timer); timer = setTimeout(idle, 1800);
    } catch {
      if (version !== revision) return;
      idle(); notify('复制失败，请选中源码手动复制。');
    }
  }
  button.addEventListener('click', copy);
  idle();
  return {
    setSource(text) { revision++; clearTimeout(timer); source = text; idle(); },
    destroy() { revision++; clearTimeout(timer); button.removeEventListener('click', copy); },
  };
}
