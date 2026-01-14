import React, { useState, createContext } from 'react'

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

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="my-5">
        {/* Tab buttons */}
        <div
          className="flex gap-1 p-1 rounded-lg"
          style={{ background: 'rgba(0, 0, 0, 0.05)' }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.props.label
            return (
              <button
                key={tab.props.label}
                onClick={() => setActiveTab(tab.props.label)}
                className="px-4 py-2 rounded-md text-[13px] font-medium transition-all"
                style={{
                  background: isActive ? 'white' : 'transparent',
                  color: isActive ? '#101518' : '#5c676c',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {tab.props.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="mt-3">
          {tabs.map((tab) => (
            <div
              key={tab.props.label}
              style={{ display: activeTab === tab.props.label ? 'block' : 'none' }}
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
