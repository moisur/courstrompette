import React from 'react'

interface FileUploadProps {
  onFileUpload: (xmlContent: string) => void
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        onFileUpload(content)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="mb-4">
      <label htmlFor="musicxml-upload" className="block text-sm font-medium text-gray-700 mb-2">
        Upload MusicXML File
      </label>
      <input
        type="file"
        id="musicxml-upload"
        accept=".xml,.musicxml"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
    </div>
  )
}

