
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { spaceAppsService, SpaceApp, CreateSpaceApp } from '@/services/spaceAppsService';
import { Plus, Edit, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSpaceAppsManagement = () => {
  const [apps, setApps] = useState<SpaceApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<SpaceApp | null>(null);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateSpaceApp>({
    name: '',
    description: '',
    image_url: '',
    app_url: '',
    category: '',
    is_active: true
  });

  const { toast } = useToast();

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      setLoading(true);
      console.log('Loading apps...');
      const appsData = await spaceAppsService.getAllApps();
      console.log('Apps loaded:', appsData);
      setApps(appsData);
    } catch (error: any) {
      console.error('Error loading apps:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحميل التطبيقات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.app_url) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Submitting form:', { editingApp, formData });
      
      if (editingApp) {
        await spaceAppsService.updateApp(editingApp.id, formData);
        console.log('App updated successfully');
        
        toast({
          title: "تم التحديث",
          description: "تم تحديث التطبيق بنجاح"
        });
      } else {
        await spaceAppsService.createApp(formData);
        console.log('App created successfully');
        
        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء التطبيق بنجاح"
        });
      }
      
      // Reload apps from database to ensure proper sync
      await loadApps();
      resetForm();
    } catch (error: any) {
      console.error('Error saving app:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في حفظ التطبيق",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (app: SpaceApp) => {
    console.log('Editing app:', app);
    setEditingApp(app);
    setFormData({
      name: app.name,
      description: app.description,
      image_url: app.image_url,
      app_url: app.app_url,
      category: app.category,
      is_active: app.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التطبيق؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }

    try {
      setDeletingAppId(id);
      console.log('Starting deletion process for app ID:', id);
      console.log('Current apps count before deletion:', apps.length);
      
      // Remove from UI immediately for better UX
      const appToDelete = apps.find(app => app.id === id);
      const originalApps = [...apps];
      setApps(prevApps => prevApps.filter(app => app.id !== id));
      console.log('App removed from UI, new count:', apps.length - 1);
      
      try {
        // Attempt to delete from database
        await spaceAppsService.deleteApp(id);
        console.log('App successfully deleted from database');
        
        // Force reload to ensure consistency
        console.log('Reloading apps to verify deletion...');
        await loadApps();
        
        toast({
          title: "تم الحذف",
          description: `تم حذف التطبيق "${appToDelete?.name}" بنجاح`
        });
      } catch (dbError: any) {
        // Restore original state if deletion failed
        console.error('Database deletion failed, restoring UI state:', dbError);
        setApps(originalApps);
        
        toast({
          title: "خطأ في الحذف",
          description: dbError.message || "فشل في حذف التطبيق من قاعدة البيانات",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Unexpected error during deletion:', error);
      toast({
        title: "خطأ غير متوقع",
        description: error.message || "حدث خطأ غير متوقع أثناء الحذف",
        variant: "destructive"
      });
    } finally {
      setDeletingAppId(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      console.log('Toggling status for app:', id, 'current status:', currentStatus);
      
      const updatedApp = await spaceAppsService.toggleAppStatus(id, !currentStatus);
      console.log('Status toggled:', updatedApp);
      
      // Update the apps state with the updated app
      setApps(prevApps => prevApps.map(app => 
        app.id === id ? updatedApp : app
      ));
      
      toast({
        title: "تم التحديث",
        description: `تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} التطبيق`
      });
    } catch (error: any) {
      console.error('Error toggling app status:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث حالة التطبيق",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      app_url: '',
      category: '',
      is_active: true
    });
    setEditingApp(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">إدارة Space Apps</h2>
          <p className="text-gray-400">إضافة وإدارة التطبيقات</p>
        </div>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            إضافة تطبيق جديد
          </Button>
        )}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-black/40 border border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">
                  {editingApp ? 'تعديل التطبيق' : 'إضافة تطبيق جديد'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">اسم التطبيق *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-black/30 border-white/20 text-white"
                        placeholder="أدخل اسم التطبيق"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-white">الفئة</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="bg-black/30 border-white/20 text-white"
                        placeholder="أدخل فئة التطبيق"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">الوصف</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="bg-black/30 border-white/20 text-white"
                      placeholder="أدخل وصف التطبيق"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url" className="text-white">رابط الصورة</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      className="bg-black/30 border-white/20 text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="app_url" className="text-white">رابط التطبيق *</Label>
                    <Input
                      id="app_url"
                      type="url"
                      value={formData.app_url}
                      onChange={(e) => setFormData({...formData, app_url: e.target.value})}
                      className="bg-black/30 border-white/20 text-white"
                      placeholder="https://example.com/app"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                    />
                    <Label htmlFor="is_active" className="text-white">
                      تطبيق نشط
                    </Label>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      {editingApp ? 'تحديث' : 'إضافة'}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apps List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full"
            />
          </div>
        ) : apps.length === 0 ? (
          <Card className="bg-black/40 border border-white/10 backdrop-blur-xl">
            <CardContent className="py-8 text-center">
              <div className="text-4xl mb-4">📱</div>
              <p className="text-gray-400">لا توجد تطبيقات حالياً</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {apps.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full"
              >
                <Card className="bg-black/40 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {app.image_url && (
                          <img 
                            src={app.image_url} 
                            alt={app.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                            {app.category && (
                              <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                                {app.category}
                              </Badge>
                            )}
                            <Badge 
                              variant={app.is_active ? "default" : "secondary"}
                              className={app.is_active ? "bg-green-600/20 text-green-300" : "bg-gray-600/20 text-gray-400"}
                            >
                              {app.is_active ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </div>
                          {app.description && (
                            <p className="text-gray-400 text-sm">{app.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(app.app_url, '_blank')}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(app.id, app.is_active)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          {app.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(app)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(app.id)}
                          disabled={deletingAppId === app.id}
                          className="border-red-400/20 text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                        >
                          {deletingAppId === app.id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"
                            />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSpaceAppsManagement;
