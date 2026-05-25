import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ImageUploaderProps {
  currentImageUrl: string;
  onImageUploaded: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
  showUrlInput?: boolean;
  deleteOldImage?: boolean;
}

// Helper function to extract path from URL
function getStoragePathFromUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    // Extract the path after /media/ in the URL
    const mediaPath = url.split('/media/')[1];
    if (!mediaPath) return null;
    
    return decodeURIComponent(mediaPath);
  } catch (error) {
    console.error('Error extracting storage path:', error);
    return null;
  }
}

export function ImageUploader({
  currentImageUrl,
  onImageUploaded,
  folder = "general",
  label = "Image",
  className = "",
  showUrlInput = true,
  deleteOldImage = true,
}: ImageUploaderProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("media").getPublicUrl(filePath);

      if (data) {
        // If we should delete the old image, and there's an existing image URL
        if (deleteOldImage && currentImageUrl) {
          const oldImagePath = getStoragePathFromUrl(currentImageUrl);
          
          if (oldImagePath) {
            // Try to delete the old image (don't wait for it)
            supabase.storage
              .from("media")
              .remove([oldImagePath])
              .then(({ error }) => {
                if (error) {
                  console.error('Error deleting old image:', error);
                }
              });
          }
        }
        
        // Update with new image URL
        onImageUploaded(data.publicUrl);
        toast({
          title: "Image uploaded",
          description: "Your image was uploaded successfully.",
        });
      }
    } catch (err: any) {
      console.error("Error uploading image:", err);
      toast({
        title: "Upload failed",
        description: err.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      {/* {currentImageUrl && (
        <div className="mb-3">
          <img
            src={currentImageUrl}
            alt={label}
            className="h-48 w-full object-cover rounded-md"
          />
        </div>
      )} */}
      
      <div className={`grid ${showUrlInput ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {/* {showUrlInput && (
          <Input
            value={currentImageUrl}
            onChange={(e) => onImageUploaded(e.target.value)}
            placeholder="Image URL"
          />
        )} */}
        
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          {isUploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
        </div>
      </div>
      
      {currentImageUrl && (
        <div className="mt-3 relative group">
          <img
            src={currentImageUrl}
            alt={label}
            className="h-48 w-full object-cover rounded-md"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
            <span className="text-white text-sm">Current image</span>
          </div>
        </div>
      )}
    </div>
  );
} 