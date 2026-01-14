import { useState } from 'react'
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react'

export interface FileTreeItem {
  name: string
  type?: 'file' | 'folder'
  children?: FileTreeItem[]
  highlight?: boolean
}

export interface FileTreeProps {
  items: FileTreeItem[]
  defaultExpanded?: boolean
}

interface TreeNodeProps {
  item: FileTreeItem
  level: number
  defaultExpanded: boolean
}

function TreeNode({ item, level, defaultExpanded }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded)
  const isFolder = item.type === 'folder' || (item.children && item.children.length > 0)

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        style={{
          paddingLeft: `${level * 16 + 8}px`,
          backgroundColor: item.highlight ? 'rgba(240, 124, 79, 0.1)' : undefined,
        }}
        onClick={() => isFolder && setIsOpen(!isOpen)}
      >
        {isFolder ? (
          <>
            <ChevronRight
              className="w-3.5 h-3.5 transition-transform flex-shrink-0"
              style={{
                color: '#9ca3af',
                transform: isOpen ? 'rotate(90deg)' : undefined,
              }}
            />
            {isOpen ? (
              <FolderOpen className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b' }} />
            ) : (
              <Folder className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b' }} />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <File className="w-4 h-4 flex-shrink-0" style={{ color: '#6b7280' }} />
          </>
        )}
        <span
          className="text-[13px] font-mono"
          style={{
            color: item.highlight ? '#f07c4f' : '#374151',
            fontWeight: item.highlight ? 500 : 400,
          }}
        >
          {item.name}
        </span>
      </div>
      {isFolder && isOpen && item.children && (
        <div>
          {item.children.map((child, index) => (
            <TreeNode
              key={`${child.name}-${index}`}
              item={child}
              level={level + 1}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileTree({ items, defaultExpanded = true }: FileTreeProps) {
  return (
    <div
      className="rounded-xl my-5 py-2 overflow-hidden font-mono text-sm"
      style={{
        background: 'rgba(249, 250, 251, 0.8)',
        border: '1px solid rgba(16, 21, 24, 0.1)',
      }}
    >
      {items.map((item, index) => (
        <TreeNode
          key={`${item.name}-${index}`}
          item={item}
          level={0}
          defaultExpanded={defaultExpanded}
        />
      ))}
    </div>
  )
}

export default FileTree
