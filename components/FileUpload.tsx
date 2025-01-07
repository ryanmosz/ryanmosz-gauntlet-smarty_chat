import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, X } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button variant="outline" size="icon" asChild>
          <span>
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Attach file</span>
          </span>
        </Button>
      </label>
      {selectedFile && (
        <div className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-md">
          <span className="text-sm truncate max-w-[150px]">{selectedFile.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-2"
            onClick={handleRemoveFile}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      )}
    </div>
  )
}

