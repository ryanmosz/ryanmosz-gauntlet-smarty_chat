import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Smile, MessageSquare, Paperclip } from 'lucide-react'
import { getInitials, getAvatarColor } from "@/lib/utils"

interface MessageProps {
  sender: string
  senderId: string
  content: string
  timestamp: string
  avatar?: string
  file?: {
    name: string
    url: string
  }
}

export function Message({ sender, senderId, content, timestamp, avatar, file }: MessageProps) {
  const [reactions, setReactions] = useState<{ [key: string]: number }>({})
  const [showThread, setShowThread] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState(avatar)
  const [currentSender, setCurrentSender] = useState(sender)

  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      const { userId, avatar: newAvatar, name: newName } = event.detail
      if (userId === senderId) {
        setCurrentAvatar(newAvatar)
        setCurrentSender(newName)
      }
    }

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener)

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener)
    }
  }, [senderId])

  const addReaction = (emoji: string) => {
    setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }))
  }

  return (
    <div className="mb-4 bg-card rounded-lg p-3">
      <div className="flex items-center mb-1">
        <Avatar className="h-8 w-8 mr-2">
          {currentAvatar && currentAvatar.startsWith('http') ? (
            <AvatarImage src={currentAvatar} alt={sender} />
          ) : (
            <AvatarFallback className={getAvatarColor(senderId)}>
              {getInitials(sender)}
            </AvatarFallback>
          )}
        </Avatar>
        <span className="font-bold text-foreground">{currentSender}</span>
        <span className="text-sm text-muted-foreground ml-2">{timestamp}</span>
      </div>
      <p className="mb-2 text-foreground whitespace-pre-wrap">{content}</p>
      {file && (
        <div className="mb-2 flex items-center bg-muted text-muted-foreground px-3 py-2 rounded-md">
          <Paperclip className="h-4 w-4 mr-2" />
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm underline">
            {file.name}
          </a>
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="bg-muted hover:bg-muted/80 text-foreground">
              <Smile className="h-4 w-4 mr-1" />
              React
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-popover">
            <div className="grid grid-cols-6 gap-2">
              {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                <button
                  key={emoji}
                  className="text-2xl hover:bg-muted rounded p-1"
                  onClick={() => addReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="sm" onClick={() => setShowThread(!showThread)} className="bg-muted hover:bg-muted/80 text-foreground">
          <MessageSquare className="h-4 w-4 mr-1" />
          Thread
        </Button>
      </div>
      {Object.entries(reactions).length > 0 && (
        <div className="mt-2 flex space-x-2">
          {Object.entries(reactions).map(([emoji, count]) => (
            <span key={emoji} className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-sm">
              {emoji} {count}
            </span>
          ))}
        </div>
      )}
      {showThread && (
        <div className="mt-2 pl-4 border-l-2 border-muted">
          <p className="text-sm text-muted-foreground">Thread replies will appear here</p>
        </div>
      )}
    </div>
  )
}

