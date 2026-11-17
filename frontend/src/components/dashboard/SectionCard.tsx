import type { ReactNode } from 'react'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SectionCardProps {
  title: string
  action?: ReactNode
  children: ReactNode
}

export function SectionCard({ title, action, children }: SectionCardProps) {
  return (
    <Card className="rounded-3xl border border-orange-100/80 bg-white shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden">
      <CardHeader className="flex-row items-center justify-between border-b border-orange-100/50 bg-[#FDF8F3] px-6 py-4">
        <CardTitle className="font-display text-lg font-black tracking-tight text-slate-900">{title}</CardTitle>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  )
}
