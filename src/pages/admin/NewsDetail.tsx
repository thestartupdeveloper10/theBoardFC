import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Calendar, Tag, Pencil, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  featured_image_url: string;
  is_published: boolean;
  publish_date: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function AdminNewsDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('news id',id);

  useEffect(() => {
    // Redirect non-admin users
    if (!isAdmin) {
      navigate('/sign-in');
      return;
    }

    async function fetchArticle() {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        // Check if article exists
        if (!data) {
          throw new Error('Article not found');
        }
        
        setArticle(data);
      } catch (err: any) {
        console.error('Error fetching article:', err);
        setError(err.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [id, isAdmin, navigate]);

  // Format date for display
  function formatDate(dateString: string) {
    try {
      return format(parseISO(dateString), 'MMMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  }

  // Function to format content with paragraphs
  function formatContent(content: string) {
    return content.split('\n').map((paragraph, index) => 
      paragraph.trim() ? <p key={index} className="mb-4">{paragraph}</p> : null
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/3 mb-8" />
        <Skeleton className="h-96 w-full mb-8" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-3/4 mb-4" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {error || 'Article not found'}
        </h1>
        <p className="mb-8">The article you're looking for could not be loaded.</p>
        <Link to="/admin/dashboard?tab=news">
          <Button>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to News Management
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6 flex justify-between">
        <Link to="/admin/dashboard?tab=news">
          <Button variant="ghost" className="pl-0">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to News Management
          </Button>
        </Link>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/admin/news/${article.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Article
          </Button>
          
          {article.is_published && (
            <Button
              variant="outline"
              asChild
            >
              <a href={`/news/${article.id}`} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Public Page
              </a>
            </Button>
          )}
        </div>
      </div>
      
      <div className="bg-muted/30 dark:bg-muted/20 px-4 py-2 rounded-md mb-6 flex items-center justify-between">
        <div>
          Status: 
          <Badge variant={article.is_published ? "default" : "outline"} className="ml-2">
            {article.is_published ? "Published" : "Draft"}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">ID: {article.id}</span>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-3">{article.title}</h1>
      
      <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-6">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formatDate(article.publish_date || article.created_at)}</span>
        </div>
        
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4" />
            {article.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {article.featured_image_url && (
        <div className="mb-8">
          <img 
            src={article.featured_image_url} 
            alt={article.title} 
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
      )}
      
      <div className="prose prose-lg max-w-none dark:prose-invert">
        {formatContent(article.content)}
      </div>
    </div>
  );
} 