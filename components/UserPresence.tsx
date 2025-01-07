import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Circle, Moon, Sun } from 'lucide-react'

type PresenceState = 'online' | 'away' | 'do-not-disturb'

export function UserPresence() {
  const [presence, setPresence] = useState<PresenceState>('online')

  const getPresenceIcon = (state: PresenceState) => {
    switch (state) {
      case 'online':
        return <Circle className="h-4 w-4 text-blue-500" />
      case 'away':
        return <Moon className="h-4 w-4 text-yellow-500" />
      case 'do-not-disturb':
        return <Sun className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {getPresenceIcon(presence)}
          <span className="sr-only">Set presence</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setPresence('online')}>
          <Circle className="h-4 w-4 text-blue-500 mr-2" />
          Online
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPresence('away')}>
          <Moon className="h-4 w-4 text-yellow-500 mr-2" />
          Away
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPresence('do-not-disturb')}>
          <Sun className="h-4 w-4 text-red-500 mr-2" />
          Do Not Disturb
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

