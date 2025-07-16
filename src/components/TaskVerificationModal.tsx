
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, ExternalLink, Share2 } from 'lucide-react';
import { taskVerificationService } from '@/services/taskVerificationService';
import { useToast } from '@/hooks/use-toast';

interface TaskVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  taskId: string;
  username: string;
  telegramId?: number;
  onVerificationComplete: () => void;
}

const TaskVerificationModal: React.FC<TaskVerificationModalProps> = ({
  isOpen,
  onClose,
  taskTitle,
  taskId,
  username,
  telegramId,
  onVerificationComplete
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const { toast } = useToast();

  const handleVerification = async () => {
    setIsVerifying(true);
    
    try {
      let verified = false;
      
      if (taskTitle.toLowerCase().includes('telegram username')) {
        // Verify Telegram username contains $SPACE
        const checkUsername = usernameInput || username;
        verified = await taskVerificationService.verifyTelegramUsername(checkUsername, telegramId);
        
        if (!verified) {
          toast({
            title: "Verification Failed",
            description: "Please make sure your username contains '$SPACE'",
            variant: "destructive"
          });
          setIsVerifying(false);
          return;
        }
      } else if (taskTitle.toLowerCase().includes('story')) {
        // Verify story sharing
        verified = await taskVerificationService.verifyStorySharing(username, telegramId);
      } else if (taskTitle.toLowerCase().includes('website') || taskTitle.toLowerCase().includes('share')) {
        // Verify website sharing
        verified = await taskVerificationService.verifyWebsiteSharing(username, telegramId);
      }
      
      if (verified) {
        toast({
          title: "Task Verified! ✅",
          description: "Your task has been completed successfully",
        });
        onVerificationComplete();
        onClose();
      } else {
        toast({
          title: "Verification Failed",
          description: "Please complete the task and try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Error",
        description: "An error occurred during verification",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const openExternalLink = () => {
    if (taskTitle.toLowerCase().includes('telegram username')) {
      window.open('https://t.me/settings', '_blank');
    } else if (taskTitle.toLowerCase().includes('story')) {
      window.open('https://t.me/share/story', '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{taskTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {taskTitle.toLowerCase().includes('telegram username') && (
            <div>
              <Label htmlFor="username" className="text-gray-300">
                Enter your Telegram username (should contain $SPACE)
              </Label>
              <Input
                id="username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="@your_username_$SPACE"
                className="bg-gray-800 border-gray-600 text-white mt-2"
              />
              <Button
                onClick={openExternalLink}
                variant="outline"
                className="mt-2 text-blue-400 border-blue-400 hover:bg-blue-400/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Telegram Settings
              </Button>
            </div>
          )}
          
          {taskTitle.toLowerCase().includes('story') && (
            <div className="text-center">
              <p className="text-gray-300 mb-4">
                Share SPACE project on your Telegram story, then click verify
              </p>
              <Button
                onClick={openExternalLink}
                variant="outline"
                className="mb-4 text-blue-400 border-blue-400 hover:bg-blue-400/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share to Story
              </Button>
            </div>
          )}
          
          {(taskTitle.toLowerCase().includes('website') || taskTitle.toLowerCase().includes('share')) && (
            <div className="text-center">
              <p className="text-gray-300 mb-4">
                Share our website link with a friend on any platform, then click verify
              </p>
              <div className="bg-gray-800 p-3 rounded-lg mb-4">
                <code className="text-sm text-green-400">
                  https://t.me/Space_memecoins_bot
                </code>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerification}
              disabled={isVerifying}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isVerifying ? (
                "Verifying..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Task
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskVerificationModal;
