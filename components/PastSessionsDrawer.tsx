"use client"

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { getSessions, type Session } from "@/lib/localStore"

export function PastSessionsDrawer({ mode, onOpenChange }:{ mode: Session["mode"]|null; onOpenChange: (m: Session["mode"]|null)=>void }){
  const open = !!mode
  const sessions = mode ? getSessions(mode) : []
  return (
    <Drawer open={open} onOpenChange={(o)=> onOpenChange(o? mode : null)}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="capitalize">Past {mode} sessions</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-2">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions yet—let’s start one!</p>
          ) : (
            sessions.map((s)=> (
              <div key={s.id} className="p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{new Date(s.startedAt).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Score: {s.score ?? 0} • {s.durationMin ?? 0}m</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
