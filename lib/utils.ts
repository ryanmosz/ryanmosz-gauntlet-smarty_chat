import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const vibrantColors = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-fuchsia-500', 'bg-emerald-500'
]

let availableColors = [...vibrantColors]

function getNextColor(): string {
  if (availableColors.length === 0) {
    availableColors = [...vibrantColors]
  }
  const colorIndex = Math.floor(Math.random() * availableColors.length)
  return availableColors.splice(colorIndex, 1)[0]
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getAvatarColor(userId: string): string {
  let avatarColors = JSON.parse(localStorage.getItem('avatarColors') || '{}')
  
  if (!avatarColors[userId]) {
    avatarColors[userId] = getNextColor()
    localStorage.setItem('avatarColors', JSON.stringify(avatarColors))
  }
  
  return avatarColors[userId]
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

