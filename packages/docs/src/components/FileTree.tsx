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
  const rowClassName = `dw-file-tree-row${item.highlight ? ' is-highlighted' : ''}`

  const rowContent = (
    <>
      {isFolder ? (
        <>
          <ChevronRight
            className="dw-file-tree-chevron"
            data-open={isOpen || undefined}
            aria-hidden="true"
          />
          {isOpen ? (
            <FolderOpen className="dw-file-tree-folder" aria-hidden="true" />
          ) : (
            <Folder className="dw-file-tree-folder" aria-hidden="true" />
          )}
        </>
      ) : (
        <>
          <span className="dw-file-tree-spacer" />
          <File className="dw-file-tree-file" aria-hidden="true" />
        </>
      )}
      <span className="dw-file-tree-name">{item.name}</span>
    </>
  )

  return (
    <div>
      {isFolder ? (
        <button
          type="button"
          className={rowClassName}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          {rowContent}
        </button>
      ) : (
        <div className={rowClassName} style={{ paddingLeft: `${level * 16 + 8}px` }}>
          {rowContent}
        </div>
      )}
      {isFolder && isOpen && item.children && (
        <div role="group">
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
    <div className="dw-file-tree">
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
