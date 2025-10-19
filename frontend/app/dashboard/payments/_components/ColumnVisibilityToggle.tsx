'use client'

import { useState } from 'react'
import { Columns3, Check } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AnimatePresence, motion } from 'framer-motion'

interface ColumnConfig {
  id: string
  label: string
  visible: boolean
}

interface ColumnVisibilityToggleProps {
  columns: ColumnConfig[]
  onToggle: (columnId: string) => void
  onReset: () => void
}

export function ColumnVisibilityToggle({ columns, onToggle, onReset }: ColumnVisibilityToggleProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex h-10 items-center gap-2 rounded-md border-2 border-border bg-card px-4 font-mono text-sm font-medium shadow-sm transition-all hover:border-brand/30 hover:bg-brand/5 cursor-pointer"
        >
          <Columns3 className="h-4 w-4" />
          Columns
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[240px] rounded-2xl border-2 border-border bg-card p-0 shadow-lg"
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-mono text-sm font-medium">Toggle columns</h3>
          </div>

          {/* Column List */}
          <div className="space-y-1 p-3">
            {columns.map((column) => (
              <button
                key={column.id}
                onClick={() => onToggle(column.id)}
                className={`
                  group flex w-full cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-2.5 text-left transition-all
                  ${
                    column.visible
                      ? 'border-brand bg-brand/10 text-brand shadow-sm'
                      : 'border-border bg-transparent hover:border-brand/30 hover:bg-muted/20'
                  }
                `}
              >
                <span className="flex-1 font-mono text-sm font-medium">{column.label}</span>
                <div
                  className={`
                    flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all
                    ${
                      column.visible
                        ? 'border-brand bg-brand'
                        : 'border-muted-foreground/30 bg-transparent group-hover:border-brand/50'
                    }
                  `}
                >
                  <AnimatePresence>
                    {column.visible && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            ))}
          </div>

          {/* Footer - Reset Button */}
          <div className="border-t border-border px-4 py-3">
            <button
              onClick={onReset}
              className="w-full cursor-pointer rounded-lg border-2 border-border bg-transparent px-3 py-2 font-mono text-sm font-medium transition-all hover:border-brand hover:bg-brand/10 hover:text-brand"
            >
              Reset to default
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
