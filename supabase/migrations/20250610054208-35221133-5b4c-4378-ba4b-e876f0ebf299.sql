
-- Create storage bucket for task images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-images',
  'task-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create storage policy to allow public access for reading
CREATE POLICY "Public Access for task images" ON storage.objects
FOR SELECT USING (bucket_id = 'task-images');

-- Create storage policy to allow authenticated users to upload
CREATE POLICY "Authenticated users can upload task images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'task-images');

-- Create storage policy to allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update task images" ON storage.objects
FOR UPDATE USING (bucket_id = 'task-images');

-- Create storage policy to allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete task images" ON storage.objects
FOR DELETE USING (bucket_id = 'task-images');
