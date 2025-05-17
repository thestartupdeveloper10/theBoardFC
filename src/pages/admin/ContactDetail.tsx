import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Mail } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'read' | 'unread';
}

interface ContactDetailProps {
  contact: Contact;
  onClose: () => void;
  onDelete: () => void;
}

export function ContactDetail({ contact, onClose, onDelete }: ContactDetailProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Format contact creation date
  const formattedDate = format(parseISO(contact.created_at), 'MMMM d, yyyy h:mm a');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        
        <h2 className="text-xl font-bold">Contact Details</h2>
        
        <div className="ml-auto">
          <Button 
            variant="outline" 
            className="text-red-500 hover:text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="bg-muted/30 p-6 flex flex-row items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">
              From: <span className="font-medium text-foreground">{contact.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Email: <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                {contact.email}
              </a>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Received on {formattedDate}
            </div>
          </div>
          
          <div>
            <Badge variant={contact.status === 'unread' ? 'default' : 'secondary'}>
              {contact.status === 'unread' ? 'New Message' : 'Read'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium">
              {contact.subject || '(No subject)'}
            </h3>
          </div>
          
          <div className="border-t pt-4 whitespace-pre-wrap">
            {contact.message}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onClose}>
          Back to List
        </Button>
        
        <Button variant="default">
          <Mail className="h-4 w-4 mr-2" />
          Reply via Email
        </Button>
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this contact message. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 