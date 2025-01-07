'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Message } from "@/components/Message"
import { Search } from "@/components/Search"
import { UserPresence } from "@/components/UserPresence"
import { FileUpload } from "@/components/FileUpload"
import EmojiPicker from 'emoji-picker-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Smile } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from 'next/link'
import { getInitials, getAvatarColor } from "@/lib/utils"

// Mock data
const channels = [
  { id: 1, name: 'General' },
  { id: 2, name: 'Random' },
]

const directMessages = [
  { id: 'user1', name: 'Alice', status: 'online' },
  { id: 'user2', name: 'Bob', status: 'offline' },
]

const createInitialChannelMessages = (currentUserName: string) => [
  { id: 1, sender: 'Alice', senderId: 'user1', content: 'Hello, everyone!', timestamp: '10:00 AM' },
  { id: 2, sender: 'Bob', senderId: 'user2', content: 'Hi Alice, how are you?', timestamp: '10:05 AM' },
  { id: 3, sender: currentUserName, senderId: '', content: 'Hey all, glad to be here!', timestamp: '10:10 AM' },
]

const createMockDMMessages = (currentUserName: string) => ({
  'user1': [
    { id: 1, sender: 'Alice', senderId: 'user1', content: 'Hey, how are you?', timestamp: '11:00 AM' },
    { id: 2, sender: currentUserName, senderId: '', content: 'I\'m doing great, thanks! How about you?', timestamp: '11:05 AM' },
  ],
  'user2': [
    { id: 1, sender: 'Bob', senderId: 'user2', content: 'Did you finish the report?', timestamp: '09:30 AM' },
    { id: 2, sender: currentUserName, senderId: '', content: 'Yes, I\'ll send it over in a few minutes.', timestamp: '09:35 AM' },
  ],
})

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState({ type: 'channel', id: 1, name: 'General', status: '' })
  const [message, setMessage] = useState('')
  const [channelMessages, setChannelMessages] = useState<any[]>([])
  const [dmMessages, setDmMessages] = useState<any>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentUser, setCurrentUser] = useState({ id: '', name: '', email: '', avatar: null as string | null })
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser({
        id: user.id || user.email, // Use email as fallback userId
        name: user.name,
        email: user.email,
        avatar: user.avatar
      })
      setChannelMessages(createInitialChannelMessages(user.name))
      setDmMessages(createMockDMMessages(user.name))
    } else {
      router.push('/')
    }
  }, [router])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() || selectedFile) {
      const newMessage = {
        id: Date.now(),
        sender: currentUser.name,
        senderId: currentUser.id,
        content: message,
        timestamp: new Date().toLocaleTimeString(),
        avatar: currentUser.avatar,
        file: selectedFile ? {
          name: selectedFile.name,
          url: URL.createObjectURL(selectedFile)
        } : undefined
      }

      if (activeChat.type === 'channel') {
        setChannelMessages([...channelMessages, newMessage])
      } else {
        setDmMessages(prevState => ({
          ...prevState,
          [activeChat.id]: [...(prevState[activeChat.id] || []), newMessage]
        }))
      }

      setMessage('')
      setSelectedFile(null)
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleChatSelect = (type: 'channel' | 'dm', id: number | string, name: string, status: string = '') => {
    setActiveChat({ type, id, name, status })
  }

  const handleEmojiSelect = (emojiObject: any) => {
    setMessage(prevMessage => prevMessage + emojiObject.emoji)
  }

  const activeMessages = activeChat.type === 'channel' 
    ? channelMessages 
    : dmMessages[activeChat.id] || []

  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      const { userId, avatar, name } = event.detail
      if (userId === currentUser.id) {
        setCurrentUser(prevUser => ({ ...prevUser, avatar, name }))
      }
      // Update avatars and names in channel messages
      setChannelMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.senderId === userId ? { ...msg, avatar, sender: name } : msg
        )
      )
      // Update avatars and names in DM messages
      setDmMessages(prevDmMessages => {
        const updatedDmMessages = { ...prevDmMessages }
        Object.keys(updatedDmMessages).forEach(dmId => {
          updatedDmMessages[dmId] = updatedDmMessages[dmId].map(msg => 
            msg.senderId === userId ? { ...msg, avatar, sender: name } : msg
          )
        })
        return updatedDmMessages
      })
    }

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener)

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener)
    }
  }, [currentUser.id])

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-64 bg-card p-4 border-r border-border">
        <Tabs defaultValue="channels" className="h-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="channels" className="text-foreground">Channels</TabsTrigger>
            <TabsTrigger value="dms" className="text-foreground">DMs</TabsTrigger>
          </TabsList>
          <TabsContent value="channels" className="h-[calc(100%-40px)]">
            <ScrollArea className="h-full">
              {channels.map((channel) => (
                <div 
                  key={channel.id} 
                  className={`py-2 px-3 cursor-pointer rounded-lg mb-1 ${activeChat.type === 'channel' && activeChat.id === channel.id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                  onClick={() => handleChatSelect('channel', channel.id, channel.name)}
                >
                  # {channel.name}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="dms" className="h-[calc(100%-40px)]">
            <ScrollArea className="h-full">
              {directMessages.map((dm) => (
                <div
                  key={dm.id}
                  className={`flex items-center py-2 px-3 cursor-pointer rounded-lg mb-1 ${activeChat.type === 'dm' && activeChat.id === dm.id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                  onClick={() => handleChatSelect('dm', dm.id, dm.name, dm.status)}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className={getAvatarColor(dm.id)}>
                      {getInitials(dm.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{dm.name}</span>
                  <div className={`w-2 h-2 rounded-full ml-auto ${dm.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex-1 flex flex-col bg-background">
        <div className="bg-card p-4 shadow flex justify-between items-center">
          <h1 className="text-xl font-bold text-foreground">
            {activeChat.type === 'channel' ? `# ${activeChat.name}` : (
              <div className="flex items-center">
                <span>{activeChat.name}</span>
                <div className={`w-2 h-2 rounded-full ml-2 ${activeChat.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              </div>
            )}
          </h1>
          <div className="flex items-center space-x-2">
            <Search />
            <UserPresence />
            <Link href="/account">
              <Avatar className="h-8 w-8 cursor-pointer">
                {currentUser.avatar ? (
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                ) : (
                  <AvatarFallback className={getAvatarColor(currentUser.id)}>
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </Link>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          {activeMessages.map((msg) => (
            <Message
              key={msg.id}
              sender={msg.sender}
              senderId={msg.senderId || currentUser.id}
              content={msg.content}
              timestamp={msg.timestamp}
              file={msg.file}
              avatar={msg.avatar}
            />
          ))}
        </ScrollArea>
        <Separator className="bg-border" />
        <form onSubmit={sendMessage} className="p-4 bg-card">
          <div className="flex items-center space-x-2">
            <FileUpload onFileSelect={handleFileSelect} />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="bg-background hover:bg-muted text-foreground">
                  <Smile className="h-4 w-4" />
                  <span className="sr-only">Add emoji</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </PopoverContent>
            </Popover>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-background text-foreground placeholder-muted-foreground"
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Send</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

