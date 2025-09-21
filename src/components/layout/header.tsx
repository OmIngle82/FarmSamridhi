
"use client"

import {
  ArrowLeft,
  ArrowRight,
  Languages,
  LogOut,
  Mic,
  QrCode,
  Settings,
  User,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { placeholderImages } from "@/lib/placeholder-images"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { VoiceCommandDialog } from "@/components/voice-command-dialog"
import { useAuth } from "@/contexts/auth-context"


export function Header() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const userAvatar = placeholderImages.find(p => p.id === 'avatar-1');
  const { toast } = useToast()
  const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  }
  
  const handleLanguageChange = (value: string) => {
    let languageName = "English";
    if (value === "hi") languageName = "हिन्दी";
    if (value === "mr") languageName = "मराठी";
    toast({
      title: "Language Changed",
      description: `App language set to ${languageName}. (UI translation coming soon!)`,
    })
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="flex md:hidden" />
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.forward()}
        >
          <ArrowRight className="h-4 w-4" />
          <span className="sr-only">Go forward</span>
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-muted-foreground" />
          <Select defaultValue="en" onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
              <SelectItem value="mr">मराठी</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="ghost" size="icon" aria-label="Use Voice Command" onClick={() => setIsVoiceDialogOpen(true)}>
          <Mic className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Scan QR Code" onClick={() => router.push('/consumer')}>
          <QrCode className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {userAvatar && (
                    <AvatarImage src={userAvatar.imageUrl} alt={user?.name} data-ai-hint={userAvatar.imageHint} />
                )}
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
               <DropdownMenuItem asChild>
                <Link href="/farmer/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "Coming Soon", description: "Settings will be available soon." })}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <VoiceCommandDialog open={isVoiceDialogOpen} onOpenChange={setIsVoiceDialogOpen} />
    </header>
  )
}
