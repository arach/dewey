
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
    <div className="dw-api-table">
      {title && (
        <div className="dw-api-table-title">
          {title}
        </div>
      )}
      <div className="dw-api-table-scroll">
        <table aria-label={title ?? 'API properties'}>
          <thead>
            <tr>
              <th scope="col">
                Property
              </th>
              <th scope="col">
                Type
              </th>
              <th scope="col">
                Default
              </th>
              <th scope="col">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.map((prop) => (
              <tr key={prop.name}>
                <td>
                  <code className="dw-api-table-name">
                    {prop.name}
                  </code>
                  {prop.required && (
                    <span className="dw-api-table-required">
                      required
                    </span>
                  )}
                </td>
                <td>
                  <code className="dw-api-table-type">
                    {prop.type}
                  </code>
                </td>
                <td className="dw-api-table-default">
                  {prop.default ? (
                    <code>
                      {prop.default}
                    </code>
                  ) : (
                    <span>—</span>
                  )}
                </td>
                <td className="dw-api-table-description">
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
