import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { MenuItem } from './MenuItem';
import { settingsMenuData, type SettingsEntry } from './settingsMenuData';
import './settingsMenu.css';

export function SettingsMenu({ onAction }: { onAction: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState<SettingsEntry>();
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const previous = useRef(0);

  function close(restoreFocus = true) {
    setOpen(false);
    setSubmenu(undefined);
    previous.current = 0;
    if (restoreFocus) trigger.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const items = menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    items?.[submenu ? 0 : previous.current]?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) close(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open, submenu]);

  const items = submenu?.children ?? settingsMenuData;
  function navigate(event: KeyboardEvent) {
    const buttons = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
    const index = buttons.findIndex(button => button === document.activeElement);
    switch (event.key) {
      case 'Escape': close(); break;
      case 'Tab': close(false); return;
      case 'ArrowLeft': if (submenu) setSubmenu(undefined); break;
      case 'ArrowRight': if (items[index]?.children) buttons[index]?.click(); break;
      case 'ArrowUp': buttons[(index - 1 + buttons.length) % buttons.length]?.focus(); break;
      case 'ArrowDown': buttons[(index + 1) % buttons.length]?.focus(); break;
      case 'Home': buttons.at(0)?.focus(); break;
      case 'End': buttons.at(-1)?.focus(); break;
      default: return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <div ref={root} className="relative" onKeyDown={open ? navigate : undefined}>
      <button ref={trigger} type="button" aria-label="Tetapan" title="Tetapan" aria-haspopup="menu"
        aria-expanded={open} onClick={() => open ? close() : setOpen(true)}>
        <span aria-hidden="true" className="text-xl">⚙</span>
      </button>
      {open && (
        <div ref={menu} role="menu" aria-label={submenu?.label ?? 'Tetapan'}
          className="zh-settings-menu absolute bottom-full left-1 z-[1000] mb-1 max-h-[85vh] w-[min(296px,calc(100vw-16px))] overflow-auto rounded-[10px] border border-[#2d2d2d] bg-[#181818] p-1.5 text-[#eceef2] shadow-[0_10px_30px_#0009]">
          {submenu && <button type="button" onClick={() => setSubmenu(undefined)} className="mb-1 px-3 text-xs text-[#a9bbcd]">‹ {submenu.label}</button>}
          {items.map((item, index) => (
            <MenuItem key={item.id} item={item} select={() => {
              if (item.children) {
                previous.current = index;
                setSubmenu(item);
              } else {
                close();
                onAction(item.id);
              }
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
