'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { getInitials, getAvatarColor } from "@/lib/utils"
import { ArrowLeft } from 'lucide-react'

export default function AccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [avatar, setAvatar] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarChanged, setAvatarChanged] = useState(false)
  const [userId, setUserId] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setDisplayName(user.name)
      setNewDisplayName(user.name)
      setEmail(user.email)
      setAvatar(user.avatar || null)
      setUserId(user.id || user.email)
    } else {
      router.push('/')
    }
  }, [router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
        setAvatarChanged(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDisplayName(e.target.value)
  }

  const saveDisplayName = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      user.name = newDisplayName
      localStorage.setItem('user', JSON.stringify(user))
      setDisplayName(newDisplayName)
      window.dispatchEvent(new CustomEvent('displayNameUpdated', { detail: { userId: user.id, name: newDisplayName } }))
      toast({
        title: "Success",
        description: "Display name updated successfully.",
      })
    }
  }

  const saveAvatar = () => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      user.avatar = avatar
      user.name = displayName // Update the name here as well
      localStorage.setItem('user', JSON.stringify(user))
      setAvatarChanged(false)
      window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: { userId: user.id, avatar, name: displayName } }))
      toast({
        title: "Success",
        description: "Avatar and display name updated successfully.",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      localStorage.removeItem('user')
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      })
      router.push('/')
    }
  }

  return (
    <div className="container mx-auto py-10 bg-background text-foreground">
      <div className="mb-6">
        <Link href="/chat" className="inline-flex items-center text-sm text-primary hover:text-primary/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Chat
        </Link>
      </div>
      <Card className="max-w-2xl mx-auto bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account settings and set email preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              {avatar ? (
                <AvatarImage src={avatar} alt="User avatar" />
              ) : (
                <AvatarFallback className={getAvatarColor(userId)}>
                  {getInitials(displayName)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-2">
              <Label htmlFor="avatar-upload" className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80">
                Change Avatar
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {avatarChanged && (
                <Button onClick={saveAvatar} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Save Avatar
                </Button>
              )}
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <div className="flex space-x-2">
              <Input
                id="display-name"
                value={newDisplayName}
                onChange={handleDisplayNameChange}
                placeholder="Enter your display name"
                className="bg-background text-foreground"
              />
              <Button onClick={saveDisplayName} className="bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              readOnly
              className="bg-background text-foreground"
            />
          </div>

          <Separator className="bg-border" />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Password</h3>
            <p className="text-sm text-muted-foreground">
              Change your password to keep your account secure.
            </p>
            <Link href="/change-password">
              <Button variant="outline" className="bg-background text-foreground hover:bg-muted">Change Password</Button>
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleLogout} className="bg-background text-foreground hover:bg-muted">Log Out</Button>
          <Button variant="destructive" onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Account</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

