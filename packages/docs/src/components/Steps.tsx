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
    <div className="dw-steps">
      {steps.map((step, index) => (
        <div key={index} className="dw-step">
          {/* Step number and line */}
          <div className="dw-step-rail">
            <div className="dw-step-number">
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className="dw-step-line" />
            )}
          </div>

          {/* Step content */}
          <div className="dw-step-content">
            <h4 className="dw-step-title">
              {step.props.title}
            </h4>
            <div className="dw-step-body">
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
