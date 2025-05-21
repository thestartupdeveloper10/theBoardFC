import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useNewsArticles } from '@/services/queries'

// Define the NewsArticle interface
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

// Define available categories - these could be derived from the actual tags in the data
const newsCategories = ['All', 'Match Reports', 'Team News', 'Transfer News', 'Community', 'News']

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const { data: articles = [], isLoading: loading, error } = useNewsArticles();

  // Sort articles by publish_date (or created_at as fallback) to show latest first
  const sortedArticles = [...articles].sort((a, b) => {
    const dateA = a.publish_date ? new Date(a.publish_date) : new Date(a.created_at);
    const dateB = b.publish_date ? new Date(b.publish_date) : new Date(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });

  // Filter articles by category using tags
  const filteredNews = selectedCategory === 'All'
    ? sortedArticles
    : sortedArticles.filter(article => 
        article.tags && article.tags.includes(selectedCategory)
      );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-2">Latest News</h1>
        <p className="text-muted-foreground">Stay updated with the latest from The Board FC.</p>
      </motion.div>

      <Tabs defaultValue="All" className="w-full" onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full h-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-8">
          {newsCategories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <ScrollArea className="h-[800px] pr-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-8 text-center text-red-500 bg-red-50 rounded-lg">
              <p>Error loading news. Please try again later.</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p>No articles found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={`/news/${article.id}`}>
                    <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
                      {article.featured_image_url && (
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={article.featured_image_url} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLImageElement).src = '/placeholder-news.jpg';
                            }}
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h2 className="text-xl font-bold mb-2">{article.title}</h2>
                        
                        {/* Date display with fallback to created_at */}
                        <p className="text-sm text-muted-foreground mb-2">
                          {article.publish_date
                            ? format(parseISO(article.publish_date), 'MMMM d, yyyy')
                            : format(parseISO(article.created_at), 'MMMM d, yyyy')}
                          {' • '}
                          {formatDistanceToNow(parseISO(article.created_at), { addSuffix: false })} ago
                        </p>
                        
                        <p className="mb-4 line-clamp-3">{article.summary}</p>
                        
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {article.tags.map((tag: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined, tagIndex: Key | null | undefined) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs text-white">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  )
} 