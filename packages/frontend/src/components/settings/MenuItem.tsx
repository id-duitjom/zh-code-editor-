import type { SettingsEntry } from './settingsMenuData';

export function MenuItem({ item, select }: { item: SettingsEntry; select: () => void }) {
  return (
    <>
      {item.divider && <div role="separator" className="mx-2 my-1.5 border-t border-[#34343a]" />}
      <button type="button" role="menuitem" aria-haspopup={item.children ? 'menu' : undefined}
        onClick={select}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border-0 bg-transparent px-3 py-1.5 text-left text-sm text-inherit outline-none hover:bg-[#22394f] focus:bg-[#22394f]">
        <span>{item.label}</span>
        <span className="whitespace-nowrap text-xs text-[#a9bbcd]">{item.children ? '›' : item.shortcut}</span>
      </button>
    </>
  );
}
