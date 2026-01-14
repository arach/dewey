
export interface ApiProperty {
  name: string
  type: string
  required?: boolean
  default?: string
  description: string
}

export interface ApiTableProps {
  properties: ApiProperty[]
  title?: string
}

export function ApiTable({ properties, title }: ApiTableProps) {
  return (
    <div className="my-5 overflow-hidden rounded-xl" style={{ border: '1px solid rgba(16, 21, 24, 0.1)' }}>
      {title && (
        <div
          className="px-4 py-2.5 font-semibold text-[13px]"
          style={{
            background: 'rgba(249, 250, 251, 0.8)',
            borderBottom: '1px solid rgba(16, 21, 24, 0.1)',
            color: '#374151',
          }}
        >
          {title}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(249, 250, 251, 0.5)' }}>
              <th
                className="text-left px-4 py-2.5 font-semibold"
                style={{ color: '#374151', borderBottom: '1px solid rgba(16, 21, 24, 0.1)' }}
              >
                Property
              </th>
              <th
                className="text-left px-4 py-2.5 font-semibold"
                style={{ color: '#374151', borderBottom: '1px solid rgba(16, 21, 24, 0.1)' }}
              >
                Type
              </th>
              <th
                className="text-left px-4 py-2.5 font-semibold"
                style={{ color: '#374151', borderBottom: '1px solid rgba(16, 21, 24, 0.1)' }}
              >
                Default
              </th>
              <th
                className="text-left px-4 py-2.5 font-semibold"
                style={{ color: '#374151', borderBottom: '1px solid rgba(16, 21, 24, 0.1)' }}
              >
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.map((prop, index) => (
              <tr
                key={prop.name}
                style={{
                  borderBottom: index < properties.length - 1 ? '1px solid rgba(16, 21, 24, 0.06)' : undefined,
                }}
              >
                <td className="px-4 py-2.5 align-top">
                  <code
                    className="font-mono text-[12px] px-1.5 py-0.5 rounded"
                    style={{
                      background: 'rgba(240, 124, 79, 0.1)',
                      color: '#f07c4f',
                    }}
                  >
                    {prop.name}
                  </code>
                  {prop.required && (
                    <span
                      className="ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                      }}
                    >
                      required
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 align-top">
                  <code
                    className="font-mono text-[12px] px-1.5 py-0.5 rounded"
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#6366f1',
                    }}
                  >
                    {prop.type}
                  </code>
                </td>
                <td className="px-4 py-2.5 align-top" style={{ color: '#6b7280' }}>
                  {prop.default ? (
                    <code
                      className="font-mono text-[12px] px-1.5 py-0.5 rounded"
                      style={{
                        background: 'rgba(16, 21, 24, 0.05)',
                        color: '#374151',
                      }}
                    >
                      {prop.default}
                    </code>
                  ) : (
                    <span className="text-[12px]">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5 align-top" style={{ color: '#5c676c' }}>
                  {prop.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ApiTable
