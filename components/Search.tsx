'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export function Search() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically call your search API
    console.log('Searching for:', searchTerm)
    setSearchResults([
      'Result 1 containing ' + searchTerm,
      'Result 2 containing ' + searchTerm,
      'Result 3 containing ' + searchTerm,
    ])
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Search</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter search term..."
            />
            <Button type="submit">Search</Button>
          </div>
        </form>
        <ScrollArea className="h-[200px]">
          {searchResults.map((result, index) => (
            <div key={index} className="p-2 hover:bg-gray-100">
              {result}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

