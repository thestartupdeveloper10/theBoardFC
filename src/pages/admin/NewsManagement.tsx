import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Pencil, Trash, Search, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { NewsForm } from './NewsForm';
import { useAuth } from '@/context/AuthContext';

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

export function NewsManagement() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<NewsArticle | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Load news on component mount
  useEffect(() => {
    loadNews();
  }, []);
  
  async function loadNews() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setNews(data);
    } catch (error) {
      console.error('Error loading news:', error);
      toast({
        title: "Failed to load news",
        description: "There was an error loading the news articles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  
  async function handleDeleteArticle(id: string) {
    if (!confirm("Are you sure you want to delete this news article? This action cannot be undone.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update UI
      setNews(news.filter(article => article.id !== id));
      
      toast({
        title: "News article deleted",
        description: "The news article has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting news article:', error);
      toast({
        title: "Failed to delete news article",
        description: "There was an error deleting the news article.",
        variant: "destructive",
      });
    }
  }
  
  function handleEditArticle(article: NewsArticle) {
    setCurrentArticle(article);
    setIsEditDialogOpen(true);
  }
  
  // Filter news based on search query
  const filteredNews = news.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (article.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );
  
  // Format date for display
  function formatDate(dateString: string) {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch (e) {
      return dateString;
    }
  }
  
  // Truncate text helper
  function truncateText(text: string, maxLength: number) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add News Article
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Add New Article</DialogTitle>
            </DialogHeader>
            <NewsForm 
              onSuccess={() => {
                setIsAddDialogOpen(false);
                loadNews();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search news articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredNews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No news articles found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredNews.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="font-medium">{truncateText(article.title, 50)}</div>
                    </TableCell>
                    <TableCell>{truncateText(article.summary || '', 60)}</TableCell>
                    <TableCell>
                      {article.is_published ? 
                        formatDate(article.publish_date || article.created_at) :
                        `Draft (${formatDate(article.created_at)})`
                      }
                    </TableCell>
                    <TableCell>
                      {article.is_published ? (
                        <Badge>Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {article.tags && article.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditArticle(article)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteArticle(article.id)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <a href={`/news/${article.id}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit News Article Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit News Article</DialogTitle>
          </DialogHeader>
          {currentArticle && (
            <NewsForm 
              article={currentArticle}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                loadNews();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 