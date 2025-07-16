
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Plus } from 'lucide-react';
import { clanService } from '@/services/clanService';
import { useTelegramUser } from '@/hooks/useTelegramUser';

interface CreateClanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClanCreated: () => void;
}

const CreateClanModal = ({ isOpen, onClose, onClanCreated }: CreateClanModalProps) => {
  const [clanName, setClanName] = useState('');
  const [clanDescription, setClanDescription] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [clanImage, setClanImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { telegramUser, userProfile } = useTelegramUser();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Image Error",
          description: "Image size must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setClanImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        console.log('Image preview created for clan');
      };
      reader.readAsDataURL(file);
    }
  };

  const validateTelegramLink = (link: string): boolean => {
    if (!link.trim()) return true; // Empty link is valid
    const telegramRegex = /^https:\/\/(t\.me|telegram\.me)\/.+/;
    return telegramRegex.test(link);
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCreateClan = async () => {
    if (!clanName.trim()) {
      toast({
        title: "Clan Name Required",
        description: "Please enter a clan name",
        variant: "destructive"
      });
      return;
    }

    if (telegramLink && !validateTelegramLink(telegramLink)) {
      toast({
        title: "Invalid Telegram Link", 
        description: "Please enter a valid Telegram link (https://t.me/...)",
        variant: "destructive"
      });
      return;
    }

    if (!userProfile?.id) {
      toast({
        title: "User Profile Required",
        description: "Please ensure your profile is loaded",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      console.log('Creating clan in database...');
      
      // Convert image to base64 for storage if provided
      let imageUrl = '';
      if (clanImage) {
        try {
          imageUrl = await convertImageToBase64(clanImage);
          console.log('Image converted to base64 for clan creation');
        } catch (error) {
          console.error('Error converting image:', error);
          toast({
            title: "Image Error",
            description: "Failed to process image. Please try again.",
            variant: "destructive"
          });
          return;
        }
      }

      // Create clan in database
      const clanData = {
        name: clanName.trim(),
        description: clanDescription.trim() || undefined,
        telegram_link: telegramLink.trim() || undefined,
        image: imageUrl || undefined,
        leader_id: userProfile.id,
        leader_name: userProfile.username || telegramUser?.username || 'Unknown'
      };

      console.log('Creating clan in database with data:', {
        ...clanData,
        image: imageUrl ? '[BASE64_IMAGE]' : undefined
      });
      
      const createdClan = await clanService.createClan(clanData);
      
      if (createdClan) {
        console.log('Clan created successfully in database:', createdClan);
        
        toast({
          title: "Clan Created Successfully!",
          description: `Clan "${clanName}" has been created for FREE and saved to database. You are now the leader with 20% mining bonus!`,
          duration: 5000,
        });
        
        // Reset form
        setClanName('');
        setClanDescription('');
        setTelegramLink('');
        setClanImage(null);
        setImagePreview('');
        
        // Call the callback to refresh clan list
        onClanCreated();
        onClose();
      } else {
        throw new Error('Failed to create clan in database');
      }
    } catch (error) {
      console.error('Failed to create clan:', error);
      toast({
        title: "Clan Creation Failed",
        description: error instanceof Error ? error.message : "An error occurred while creating the clan in database. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      // Reset form when closing
      setClanName('');
      setClanDescription('');
      setTelegramLink('');
      setClanImage(null);
      setImagePreview('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isCreating ? undefined : handleClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-purple-500/20 text-white max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Create New Clan - FREE
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Clan Name */}
          <div className="space-y-2">
            <Label htmlFor="clanName" className="text-sm font-medium text-gray-300">
              Clan Name *
            </Label>
            <Input
              id="clanName"
              type="text"
              placeholder="Enter clan name..."
              value={clanName}
              onChange={(e) => setClanName(e.target.value)}
              className="bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
              maxLength={50}
              disabled={isCreating}
            />
          </div>

          {/* Clan Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-300">
              Clan Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter clan description..."
              value={clanDescription}
              onChange={(e) => setClanDescription(e.target.value)}
              className="bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400 resize-none"
              rows={3}
              maxLength={200}
              disabled={isCreating}
            />
          </div>

          {/* Telegram Link */}
          <div className="space-y-2">
            <Label htmlFor="telegramLink" className="text-sm font-medium text-gray-300">
              Telegram Channel Link
            </Label>
            <Input
              id="telegramLink"
              type="url"
              placeholder="https://t.me/your_channel"
              value={telegramLink}
              onChange={(e) => setTelegramLink(e.target.value)}
              className="bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
              disabled={isCreating}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">
              Clan Image
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="clanImage"
                disabled={isCreating}
              />
              <Label
                htmlFor="clanImage"
                className={`flex items-center gap-2 px-4 py-2 bg-white/10 border border-gray-600 rounded-lg cursor-pointer hover:bg-white/20 transition-colors ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm">
                  {clanImage ? clanImage.name : 'Choose Image'}
                </span>
              </Label>
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 rounded-lg object-cover border border-gray-600"
                />
              </div>
            )}
          </div>

          {/* Info Notice */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-sm text-green-400 text-center font-semibold">
              🎉 Create your clan completely FREE!
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              All clan members enjoy a 20% mining bonus • No hidden fees • Join instantly • Saved in real database
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleCreateClan}
              disabled={isCreating || !clanName.trim()}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create FREE'}
            </Button>
            
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isCreating}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClanModal;
