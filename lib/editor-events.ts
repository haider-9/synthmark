export const EDITOR_EVENTS = {
  save: "synthmark:editor-save",
  complete: "synthmark:editor-complete",
  copyForNxus: "synthmark:editor-copy-for-nxus",
  extractFromNxus: "synthmark:editor-extract-from-nxus",
  importFromNxus: "synthmark:editor-import-from-nxus",
} as const;

export function dispatchEditorEvent(eventName: string) {
  window.dispatchEvent(new Event(eventName));
}
