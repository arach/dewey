import React from 'react'

export interface StepProps {
  title: string
  children: React.ReactNode
}

export interface StepsProps {
  children: React.ReactNode
}

export function Steps({ children }: StepsProps) {
  const steps = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<StepProps> =>
      React.isValidElement(child) && (child.type as any).displayName === 'Step'
  )

  return (
    <div className="my-6">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4 pb-6 last:pb-0">
          {/* Step number and line */}
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-semibold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #f07c4f, #f2a071)',
                color: '#1c120a',
              }}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className="w-0.5 flex-1 mt-2"
                style={{ background: 'rgba(0, 0, 0, 0.1)' }}
              />
            )}
          </div>

          {/* Step content */}
          <div className="flex-1 min-w-0 pt-1">
            <h4
              className="font-semibold text-[15px] mb-2"
              style={{ color: '#101518' }}
            >
              {step.props.title}
            </h4>
            <div className="text-[14px] leading-relaxed" style={{ color: '#5c676c' }}>
              {step.props.children}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Step({ children }: StepProps) {
  return <>{children}</>
}

Step.displayName = 'Step'

export default Steps
