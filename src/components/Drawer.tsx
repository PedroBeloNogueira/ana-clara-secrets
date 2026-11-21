import { useEffect, useRef, type ReactNode } from 'react'

export default function Drawer({ open, close, label, left, className = '', children }: {
  open: boolean; close: () => void; label: string; left?: boolean; className?: string; children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!open || !dialog) return
    dialog.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { dialog.close(); document.body.style.overflow = overflow }
  }, [open])
  return <dialog ref={ref} aria-label={label} className={'drawer ' + (left ? 'left ' : '') + className}
    onCancel={event => { event.preventDefault(); close() }}
    onClick={event => { if (event.target === ref.current) {
      const rect = ref.current.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close()
    } }}>{children}</dialog>
}