"use client"

import { useState, useEffect } from 'react'
import { DashboardCard } from "@/components/dashboard-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { placeholderImages } from "@/lib/placeholder-images"
import { Camera, Edit, Save, User, MapPin, Wheat, Milestone } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const farmerData = {
    name: "Suresh Patel",
    email: "suresh.p@example.com",
    phone: "9876543210",
    location: "Nashik, Maharashtra",
    farmSize: "15 Acres",
    memberSince: "2021",
    avatarId: "avatar-1",
};

export default function FarmerProfilePage() {
    const { toast } = useToast()
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(farmerData.name);
    const userAvatar = placeholderImages.find(p => p.id === farmerData.avatarId);
    
    const handleSave = () => {
        setIsEditing(false);
        // Here you would typically call an API to save the data
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved.",
        });
    }

    return (
        <DashboardCard
            title="My Profile"
            description="View and manage your personal and farm details."
        >
            <div className="space-y-8">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Avatar className="h-24 w-24 border-2 border-primary">
                            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={farmerData.name} />}
                            <AvatarFallback>{farmerData.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button size="icon" variant="outline" className="absolute bottom-0 right-0 h-8 w-8 rounded-full" onClick={() => toast({title: "Coming Soon", description: "You'll be able to change your profile picture soon."})}>
                            <Camera className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex-1">
                        {isEditing ? (
                            <Input value={name} onChange={(e) => setName(e.target.value)} className="text-2xl font-bold" />
                        ) : (
                            <h2 className="text-2xl font-bold">{name}</h2>
                        )}
                        <p className="text-muted-foreground">{farmerData.email}</p>
                    </div>
                     <div>
                        {isEditing ? (
                             <Button onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4" /> Save
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField icon={MapPin} label="Location" value={farmerData.location} />
                    <InfoField icon={Wheat} label="Farm Size" value={farmerData.farmSize} />
                    <InfoField icon={User} label="Phone Number" value={farmerData.phone} />
                    <InfoField icon={Milestone} label="Member Since" value={farmerData.memberSince} />
                </div>
            </div>
        </DashboardCard>
    )
}


function InfoField({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-muted rounded-full p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
