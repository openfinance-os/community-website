/**
 * Minimal tabs: a [role=tablist] whose [role=tab] buttons name their panel in
 * aria-controls. Click or arrow keys select; unselected panels get `hidden`.
 * Panels are server-rendered, so the first one reads fine before this runs.
 */
export function initTabs(root: ParentNode = document) {
  for (const list of root.querySelectorAll<HTMLElement>('[role="tablist"]')) {
    if (list.dataset.tabsReady) continue;
    list.dataset.tabsReady = 'true';
    const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];

    const select = (tab: HTMLButtonElement, focus = false) => {
      for (const other of tabs) {
        const selected = other === tab;
        other.setAttribute('aria-selected', String(selected));
        other.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(other.getAttribute('aria-controls') ?? '');
        if (panel) panel.hidden = !selected;
      }
      if (focus) tab.focus();
    };

    for (const [index, tab] of tabs.entries()) {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (event) => {
        const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        let next = -1;
        if (step) next = (index + step + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next < 0) return;
        event.preventDefault();
        select(tabs[next], true);
      });
    }
  }
}
