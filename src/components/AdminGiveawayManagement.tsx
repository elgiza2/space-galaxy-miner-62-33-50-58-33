
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Gift, Plus, Edit, Trash2, Users, Clock, Upload, X, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { giveawayImageService } from '@/services/giveawayImageService';

interface GiveawayEvent {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  event_number: number;
  item_name: string;
  item_id?: string;
  max_participants?: number;
  current_participants: number;
  participation_fee: number;
  is_free: boolean;
  status: 'active' | 'finished' | 'cancelled';
  end_time?: string;
  created_at: string;
}

const AdminGiveawayManagement = () => {
  const [giveaways, setGiveaways] = useState<GiveawayEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGiveaway, setEditingGiveaway] = useState<GiveawayEvent | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    event_number: 1,
    item_name: '',
    item_id: '',
    max_participants: '',
    participation_fee: 0,
    is_free: true,
    status: 'active' as 'active' | 'finished' | 'cancelled',
    end_time: ''
  });

  useEffect(() => {
    loadGiveaways();
  }, []);

  const loadGiveaways = async () => {
    try {
      const { data, error } = await supabase
        .from('giveaway_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading giveaways:', error);
        return;
      }

      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'active' | 'finished' | 'cancelled'
      }));

      setGiveaways(typedData);
    } catch (error) {
      console.error('Error loading giveaways:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      event_number: Math.max(...giveaways.map(g => g.event_number), 0) + 1,
      item_name: '',
      item_id: '',
      max_participants: '',
      participation_fee: 0,
      is_free: true,
      status: 'active',
      end_time: ''
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await giveawayImageService.uploadGiveawayImage(file);
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      toast({
        title: "Success",
        description: "Image uploaded successfully!"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('giveaway_events')
        .insert({
          title: formData.title,
          description: formData.description,
          image_url: formData.image_url || null,
          event_number: formData.event_number,
          item_name: formData.item_name,
          item_id: formData.item_id || null,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
          participation_fee: formData.is_free ? 0 : formData.participation_fee,
          is_free: formData.is_free,
          status: formData.status,
          end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null
        });

      if (error) {
        console.error('Error creating giveaway:', error);
        toast({
          title: "Error",
          description: "Failed to create giveaway",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Giveaway created successfully"
      });

      setIsCreating(false);
      resetForm();
      loadGiveaways();
    } catch (error) {
      console.error('Error creating giveaway:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingGiveaway) return;

    try {
      const { error } = await supabase
        .from('giveaway_events')
        .update({
          title: formData.title,
          description: formData.description,
          image_url: formData.image_url || null,
          event_number: formData.event_number,
          item_name: formData.item_name,
          item_id: formData.item_id || null,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
          participation_fee: formData.is_free ? 0 : formData.participation_fee,
          is_free: formData.is_free,
          status: formData.status,
          end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingGiveaway.id);

      if (error) {
        console.error('Error updating giveaway:', error);
        toast({
          title: "Error",
          description: "Failed to update giveaway",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Giveaway updated successfully"
      });

      setEditingGiveaway(null);
      resetForm();
      loadGiveaways();
    } catch (error) {
      console.error('Error updating giveaway:', error);
    }
  };

  const handleDelete = async (giveaway: GiveawayEvent) => {
    if (!confirm(`Are you sure you want to delete "${giveaway.title}"?`)) return;

    try {
      // Delete image if exists
      if (giveaway.image_url) {
        try {
          await giveawayImageService.deleteGiveawayImage(giveaway.image_url);
        } catch (imageError) {
          console.error('Error deleting image:', imageError);
        }
      }

      const { error } = await supabase
        .from('giveaway_events')
        .delete()
        .eq('id', giveaway.id);

      if (error) {
        console.error('Error deleting giveaway:', error);
        toast({
          title: "Error",
          description: "Failed to delete giveaway",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Giveaway deleted successfully"
      });

      loadGiveaways();
    } catch (error) {
      console.error('Error deleting giveaway:', error);
    }
  };

  const handleEdit = (giveaway: GiveawayEvent) => {
    setEditingGiveaway(giveaway);
    setFormData({
      title: giveaway.title,
      description: giveaway.description,
      image_url: giveaway.image_url || '',
      event_number: giveaway.event_number,
      item_name: giveaway.item_name,
      item_id: giveaway.item_id || '',
      max_participants: giveaway.max_participants?.toString() || '',
      participation_fee: giveaway.participation_fee,
      is_free: giveaway.is_free,
      status: giveaway.status,
      end_time: giveaway.end_time ? new Date(giveaway.end_time).toISOString().slice(0, 16) : ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'finished':
        return <Badge className="bg-gray-500 text-white">Finished</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  const ImageUploadSection = () => (
    <div className="space-y-3">
      <Label htmlFor="image_upload">Event Image</Label>
      <div className="flex flex-col gap-3">
        {formData.image_url ? (
          <div className="relative">
            <img
              src={formData.image_url}
              alt="Event preview"
              className="w-full h-32 object-cover rounded-lg border-2 border-gray-600"
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2">
            <Image className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-400">No image selected</span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
        <p className="text-gray-400">Loading giveaways...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Gift className="w-6 h-6" />
          Giveaway Management
        </h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Giveaway
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Giveaway</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <ImageUploadSection />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Giveaway #56"
                  />
                </div>
                <div>
                  <Label htmlFor="event_number">Event Number</Label>
                  <Input
                    id="event_number"
                    type="number"
                    value={formData.event_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_number: parseInt(e.target.value) || 1 }))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                  placeholder="Amazing prize description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item_name">Item Name</Label>
                  <Input
                    id="item_name"
                    value={formData.item_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, item_name: e.target.value }))}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Vintage Cigar"
                  />
                </div>
                <div>
                  <Label htmlFor="item_id">Item ID (Optional)</Label>
                  <Input
                    id="item_id"
                    value={formData.item_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, item_id: e.target.value }))}
                    className="bg-gray-800 border-gray-600"
                    placeholder="13234"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_participants">Max Participants (Optional)</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time (Optional)</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_free"
                    checked={formData.is_free}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free: checked }))}
                  />
                  <Label htmlFor="is_free">Free Entry</Label>
                </div>
                {!formData.is_free && (
                  <div>
                    <Label htmlFor="participation_fee">Entry Fee (TON)</Label>
                    <Input
                      id="participation_fee"
                      type="number"
                      step="0.01"
                      value={formData.participation_fee}
                      onChange={(e) => setFormData(prev => ({ ...prev, participation_fee: parseFloat(e.target.value) || 0 }))}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'finished' | 'cancelled') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="finished">Finished</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
                  Create Giveaway
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingGiveaway} onOpenChange={() => setEditingGiveaway(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Giveaway</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <ImageUploadSection />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_title">Title</Label>
                <Input
                  id="edit_title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="edit_event_number">Event Number</Label>
                <Input
                  id="edit_event_number"
                  type="number"
                  value={formData.event_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_number: parseInt(e.target.value) || 1 }))}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-gray-800 border-gray-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_item_name">Item Name</Label>
                <Input
                  id="edit_item_name"
                  value={formData.item_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, item_name: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="edit_item_id">Item ID (Optional)</Label>
                <Input
                  id="edit_item_id"
                  value={formData.item_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, item_id: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_max_participants">Max Participants (Optional)</Label>
                <Input
                  id="edit_max_participants"
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="edit_end_time">End Time (Optional)</Label>
                <Input
                  id="edit_end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_free"
                  checked={formData.is_free}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free: checked }))}
                />
                <Label htmlFor="edit_is_free">Free Entry</Label>
              </div>
              {!formData.is_free && (
                <div>
                  <Label htmlFor="edit_participation_fee">Entry Fee (TON)</Label>
                  <Input
                    id="edit_participation_fee"
                    type="number"
                    step="0.01"
                    value={formData.participation_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, participation_fee: parseFloat(e.target.value) || 0 }))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="edit_status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'finished' | 'cancelled') => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" onClick={() => setEditingGiveaway(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} className="bg-purple-600 hover:bg-purple-700">
                Update Giveaway
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Giveaways List */}
      <div className="space-y-4">
        {giveaways.map((giveaway) => (
          <Card key={giveaway.id} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  {giveaway.image_url && (
                    <img
                      src={giveaway.image_url}
                      alt={giveaway.item_name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {giveaway.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">
                      {giveaway.description}
                    </p>
                    <div className="text-sm text-gray-500">
                      Prize: {giveaway.item_name} {giveaway.item_id && `#${giveaway.item_id}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(giveaway.status)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(giveaway)}
                    className="border-gray-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(giveaway)}
                    className="border-red-600 text-red-400 hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>
                    {giveaway.current_participants}
                    {giveaway.max_participants && ` / ${giveaway.max_participants}`} participants
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={giveaway.is_free ? 'text-green-400' : 'text-yellow-400'}>
                    {giveaway.is_free ? 'FREE' : `${giveaway.participation_fee} TON`}
                  </span>
                </div>
                {giveaway.end_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{new Date(giveaway.end_time).toLocaleString()}</span>
                  </div>
                )}
                <div className="text-gray-500">
                  Created: {new Date(giveaway.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {giveaways.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No giveaways created yet</p>
            <p className="text-gray-500 text-sm mt-2">Create your first giveaway to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGiveawayManagement;
