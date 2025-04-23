
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
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { User, UserRound, Upload, UserCog } from 'lucide-react';
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
  const [isProfilePicDialogOpen, setIsProfilePicDialogOpen] = useState(false);
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const [editName, setEditName] = useState(userData.name);
  const [editEmail, setEditEmail] = useState(userData.email);

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
    setIsProfilePicDialogOpen(false);
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

  const handleSaveProfile = () => {
    const updatedUserData = {
      ...userData,
      name: editName,
      email: editEmail
    };
    setUserData(updatedUserData);
    saveToLocalStorage('userData', updatedUserData);
    setIsEditProfileDialogOpen(false);
    
    toast({
      title: "Perfil atualizado",
      description: "Seus dados de perfil foram atualizados com sucesso.",
    });

    // Atualiza o histórico
    updateHistory('Atualização de perfil', 'O usuário atualizou seus dados pessoais');
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
      {/* Menu do usuário */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative rounded-full h-10 w-10 p-0">
            <Avatar>
              {userData.profilePic ? (
                <AvatarImage src={userData.profilePic} alt={userData.name} />
              ) : (
                <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsEditProfileDialogOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            Editar Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsProfilePicDialogOpen(true)}>
            <UserCog className="mr-2 h-4 w-4" />
            Alterar Foto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Informações do usuário */}
      <div className="text-sm">
        <p className="font-medium">{userData.name}</p>
        <p className="text-muted-foreground text-xs">{userData.email}</p>
      </div>

      {/* Diálogo para editar foto de perfil */}
      <Dialog open={isProfilePicDialogOpen} onOpenChange={setIsProfilePicDialogOpen}>
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
              onClick={() => setIsProfilePicDialogOpen(false)}
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
      
      {/* Diálogo para editar dados do perfil */}
      <Dialog open={isEditProfileDialogOpen} onOpenChange={setIsEditProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informações pessoais abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome
              </label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProfile}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Adicionar os componentes de dropdown que estavam faltando
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
