import { Accordion } from '@base-ui/react/accordion'
import type { NavGroup } from '../lib/nav'

type SidebarNavProps = {
  groups: NavGroup[]
  currentPath?: string
}

export function SidebarNav({ groups, currentPath }: SidebarNavProps) {
  const defaultValue = groups.map((group) => group.id)

  return (
    <Accordion.Root className="space-y-4" multiple defaultValue={defaultValue}>
      {groups.map((group) => (
        <Accordion.Item
          key={group.id}
          value={group.id}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          <Accordion.Header className="m-0">
            <Accordion.Trigger className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:text-[var(--color-accent-strong)]">
              <span>{group.title}</span>
              <span className="text-xs text-[var(--color-text-muted)]">▾</span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="border-t border-[var(--color-border)] px-3 py-2">
            <ul className="space-y-1 text-sm">
              {group.items.map((item) => {
                const isActive = currentPath === item.href

                return (
                  <li key={item.href}>
                    <a
                      className={`block rounded px-2 py-1 transition ${
                        isActive
                          ? 'bg-[rgba(240,124,79,0.1)] text-[var(--color-accent)]'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                      href={item.href}
                    >
                      {item.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
