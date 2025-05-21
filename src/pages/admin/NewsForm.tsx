import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { ImageUploader } from '@/components/image-uploader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';


interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  featured_image_url: string;
  is_published: boolean;
  publish_date: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface NewsFormProps {
  article?: NewsArticle;
  onSuccess: () => void;
}

// Get the same categories used on the News page, but without the "All" option
const newsCategories = ['Match Reports', 'Team News', 'Transfer News', 'Community', 'News'];

export function NewsForm({ article, onSuccess }: NewsFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [summary, setSummary] = useState(article?.summary || '');
  const [featuredImageUrl, setFeaturedImageUrl] = useState(article?.featured_image_url || '');
  const [isPublished, setIsPublished] = useState(article?.is_published || false);
  const [publishDate, setPublishDate] = useState(article?.publish_date ? 
    format(new Date(article.publish_date), "yyyy-MM-dd'T'HH:mm") :
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );
  const [selectedCategory, setSelectedCategory] = useState(article?.tags?.[0] || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = !!article;
  
  useEffect(() => {
    // Once database is updated, this will need to change to match the new column name
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the selectedCategory instead of tags
      const articleData = {
        title,
        content,
        summary,
        featured_image_url: featuredImageUrl,
        is_published: isPublished,
        publish_date: isPublished ? publishDate : null,
        tags: selectedCategory ? [selectedCategory] : [], // Will become 'category' in DB
        updated_at: new Date().toISOString(),
        ...(isEditing ? {} : { 
          created_by: user?.id,
          created_at: new Date().toISOString()
        })
      };
      
      if (isEditing) {
        // Update existing article
        const { error } = await supabase
          .from('news')
          .update(articleData)
          .eq('id', article.id);
          
        if (error) throw error;
        
        toast({
          title: "Article updated",
          description: "The news article has been updated successfully.",
        });
      } else {
        // Create new article
        const { error } = await supabase
          .from('news')
          .insert(articleData);
          
        if (error) throw error;
        
        toast({
          title: "Article created",
          description: "The new news article has been created successfully.",
        });
      }
      
      onSuccess();
    } catch (err: any) {
      console.error('Error saving news article:', err);
      setError(err.message || 'An error occurred while saving the news article.');
    } finally {
      setIsLoading(false);
    }
  }
  
  function handleCategoryChange(category: string) {
    setSelectedCategory(category);
  }
  
  return (
    <ScrollArea className="h-[calc(100vh-200px)] px-4 md:px-6">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-6 space-y-6 px-2">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          {/* Basic Article Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Article Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Article title"
                  required
                  className="font-medium text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief summary of the article (shown in previews)"
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Article Content</h3>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Full article content"
                rows={8}
                required
                className="min-h-[200px]"
              />
            </div>
          </div>

          {/* Media Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Featured Image</h3>
            <ImageUploader
              currentImageUrl={featuredImageUrl}
              onImageUploaded={setFeaturedImageUrl}
              folder="news"
              label="Featured Image"
            />
          </div>

          {/* Categorization */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Categorization</h3>
            
            <div className="space-y-4">
              <Label htmlFor="category">Category</Label>
              <Select 
                onValueChange={handleCategoryChange} 
                value={selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {newsCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedCategory && (
                <div className="mt-2">
                  <Badge>{selectedCategory}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Publishing Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Publishing Options</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublished">Published Status</Label>
                  <div className="text-sm text-muted-foreground">
                    {isPublished ? 'Article will be visible to everyone' : 'Draft mode - only visible to admins'}
                  </div>
                </div>
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
              
              {isPublished && (
                <div className="space-y-2">
                  <Label htmlFor="publishDate">Publish Date</Label>
                  <Input
                    id="publishDate"
                    type="datetime-local"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    required={isPublished}
                  />
                  <p className="text-sm text-muted-foreground">
                    Schedule when this article should be published
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Submit Button - Fixed at the bottom */}
        <div className="sticky bottom-0 pt-4 pb-2 bg-background/80 backdrop-blur-sm">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Article' : 'Create Article')}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
} 