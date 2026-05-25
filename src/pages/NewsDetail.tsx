import { useParams, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNewsArticle } from '@/services/queries';

// interface NewsArticle {
//   id: string;
//   title: string;
//   content: string;
//   summary: string;
//   featured_image_url: string;
//   is_published: boolean;
//   publish_date: string | null;
//   tags: string[];
//   created_at: string;
//   updated_at: string;
// }

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  
  // Use the TanStack Query hook
  const { 
    data: article, 
    isLoading: loading, 
    error: queryError 
  } = useNewsArticle(id || '');

  console.log('article', article);

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

  // Remove publication check for development - only check for query errors
  const error = queryError ? 'Failed to load article' : null;

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
        <Link to="/news">
          <Button>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to News
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto py-8 px-4 max-w-4xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <Link to="/news">
          <Button variant="ghost" className="pl-0">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to News
          </Button>
        </Link>
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
            {article.tags.map((tag: string, index: number) => (
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
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).src = '/placeholder-news.jpg';
            }}
          />
        </div>
      )}
      
      <div className="prose text-justify prose-lg max-w-none text-wrap dark:prose-invert">
        {formatContent(article.content)}
      </div>
    </motion.div>
  );
} 