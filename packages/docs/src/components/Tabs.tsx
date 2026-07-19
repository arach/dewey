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
                key={tab.props.label}
                onClick={() => setActiveTab(tab.props.label)}
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
