import React, { useId, useState, createContext } from 'react'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (id: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

export interface TabsProps {
  defaultTab?: string
  children: React.ReactNode
}

export interface TabProps {
  label: string
  children: React.ReactNode
}

export function Tabs({ defaultTab, children }: TabsProps) {
  // Extract tab labels from children
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<TabProps> =>
      React.isValidElement(child) && (child.type as any).displayName === 'Tab'
  )

  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.props.label || '')
  const tabsId = useId()

  const selectFromKeyboard = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = tabs.length - 1
    else return

    event.preventDefault()
    setActiveTab(tabs[nextIndex].props.label)
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    buttons?.[nextIndex]?.focus()
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="dw-tabs">
        {/* Tab buttons */}
        <div
          className="dw-tabs-list"
          role="tablist"
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.props.label
            const tabId = `${tabsId}-tab-${index}`
            const panelId = `${tabsId}-panel-${index}`
            return (
              <button
                type="button"
                key={tab.props.label}
                onClick={() => setActiveTab(tab.props.label)}
                onKeyDown={(event) => selectFromKeyboard(event, index)}
                className={`dw-tabs-trigger${isActive ? ' active' : ''}`}
                role="tab"
                id={tabId}
                aria-controls={panelId}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
              >
                {tab.props.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="dw-tabs-content">
          {tabs.map((tab, index) => (
            <div
              key={tab.props.label}
              role="tabpanel"
              id={`${tabsId}-panel-${index}`}
              aria-labelledby={`${tabsId}-tab-${index}`}
              hidden={activeTab !== tab.props.label}
            >
              {tab.props.children}
            </div>
          ))}
        </div>
      </div>
    </TabsContext.Provider>
  )
}

export function Tab({ children }: TabProps) {
  return <>{children}</>
}

Tab.displayName = 'Tab'

export default Tabs
