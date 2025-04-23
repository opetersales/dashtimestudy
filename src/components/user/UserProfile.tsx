
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { User, UserRound, Upload } from 'lucide-react';
import { saveToLocalStorage, loadFromLocalStorage } from '@/services/localStorage';

interface UserData {
  name: string;
  email: string;
  profilePic: string | null;
}

const defaultProfilePics = [
  'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=150&h=150',
  'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=150&h=150',
  'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=150&h=150',
  'https://images.unsplash.com/photo-1501286353178-1ec881214838?auto=format&fit=crop&w=150&h=150',
];

export function UserProfile() {
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData>(() => 
    loadFromLocalStorage<UserData>('userData', {
      name: 'Usuário',
      email: 'usuario@exemplo.com',
      profilePic: null,
    })
  );
  const [selectedProfilePic, setSelectedProfilePic] = useState<string | null>(userData.profilePic);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSelectProfilePic = (pic: string) => {
    setSelectedProfilePic(pic);
  };

  const handleSaveProfilePic = () => {
    const updatedUserData = {
      ...userData,
      profilePic: selectedProfilePic,
    };
    setUserData(updatedUserData);
    saveToLocalStorage('userData', updatedUserData);
    setIsDialogOpen(false);
    toast({
      title: "Foto de perfil atualizada",
      description: "Sua foto de perfil foi atualizada com sucesso.",
    });

    // Atualiza o histórico
    updateHistory('Atualização de foto de perfil', 'O usuário atualizou sua foto de perfil');
  };

  const handleCustomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomImageUrl(value);
    if (value) {
      setSelectedProfilePic(value);
    }
  };

  const updateHistory = (action: string, details: string) => {
    const history = loadFromLocalStorage<any[]>('history', []);
    const newHistoryItem = {
      id: `hist-${Date.now()}`,
      name: 'Perfil de usuário',
      version: '1.0',
      date: new Date().toISOString(),
      user: userData.name,
      action: 'update',
      details,
    };
    history.unshift(newHistoryItem);
    saveToLocalStorage('history', history);
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="relative rounded-full h-10 w-10 p-0">
            <Avatar>
              {userData.profilePic ? (
                <AvatarImage src={userData.profilePic} alt={userData.name} />
              ) : (
                <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Foto de Perfil</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="default" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="default">Fotos Padrão</TabsTrigger>
              <TabsTrigger value="custom">URL Personalizada</TabsTrigger>
            </TabsList>
            <TabsContent value="default" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                {defaultProfilePics.map((pic, index) => (
                  <div 
                    key={index} 
                    className={`cursor-pointer p-2 rounded-md ${selectedProfilePic === pic ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleSelectProfilePic(pic)}
                  >
                    <Avatar className="h-20 w-20 mx-auto">
                      <AvatarImage src={pic} />
                      <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="custom" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="image-url" className="text-sm font-medium">
                  URL da Imagem
                </label>
                <div className="flex gap-2">
                  <Input
                    id="image-url"
                    placeholder="Insira a URL da imagem"
                    value={customImageUrl}
                    onChange={handleCustomImageChange}
                  />
                </div>
              </div>
              {customImageUrl && (
                <div className="mt-4 flex justify-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={customImageUrl} />
                    <AvatarFallback><UserRound /></AvatarFallback>
                  </Avatar>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveProfilePic}
              disabled={!selectedProfilePic}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="text-sm">
        <p className="font-medium">{userData.name}</p>
        <p className="text-muted-foreground text-xs">{userData.email}</p>
      </div>
    </div>
  );
}
