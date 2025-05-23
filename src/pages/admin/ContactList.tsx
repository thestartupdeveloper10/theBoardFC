import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { Mail, CheckCircle, Clock, Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ContactDetail } from './ContactDetail';

// Contact interface matching the database
interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'read' | 'unread';
}

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Fetch all contacts
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('contact')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setContacts(data || []);
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      setError(err.message || 'Failed to load contact submissions');
    } finally {
      setLoading(false);
    }
  };
  
  // Load contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);
  
  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      contact.subject.toLowerCase().includes(searchLower) ||
      contact.message.toLowerCase().includes(searchLower)
    );
  });
  
  // Handle opening a contact detail
  const handleViewContact = async (contact: Contact) => {
    setSelectedContact(contact);
    
    // If contact is unread, mark it as read
    if (contact.status === 'unread') {
      try {
        const { error } = await supabase
          .from('contact')
          .update({ status: 'read' })
          .eq('id', contact.id);
          
        if (error) throw error;
        
        // Update local state
        setContacts(contacts.map(c => 
          c.id === contact.id ? { ...c, status: 'read' } : c
        ));
      } catch (err) {
        console.error('Error updating contact status:', err);
      }
    }
  };
  
  // Close the detail view
  const handleCloseDetail = () => {
    setSelectedContact(null);
  };
  
  // Delete a contact
  const handleDeleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setContacts(contacts.filter(c => c.id !== id));
      setSelectedContact(null);
    } catch (err: any) {
      console.error('Error deleting contact:', err);
    }
  };
  
  // Statistics
  const totalMessages = contacts.length;
  const unreadMessages = contacts.filter(c => c.status === 'unread').length;
  
  return (
    <div className="container mx-auto py-6 px-4">
      {selectedContact ? (
        <ContactDetail 
          contact={selectedContact} 
          onClose={handleCloseDetail} 
          onDelete={() => handleDeleteContact(selectedContact.id)}
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold">Contact Messages</h1>
              <p className="text-muted-foreground">
                Manage and respond to website contact form submissions
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>Total: {totalMessages}</span>
              </Badge>
              
              <Badge variant="secondary" className="flex text-white items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Unread: {unreadMessages}</span>
              </Badge>
              
              <Button variant="outline" size="sm" onClick={fetchContacts}>
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <ScrollArea className="h-[600px] rounded-md border">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                <Mail className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'No contacts matching your search' 
                    : 'No contact submissions yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Name</th>
                      <th className="px-4 py-3 text-left font-medium">Email</th>
                      <th className="px-4 py-3 text-left font-medium">Subject</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr 
                        key={contact.id} 
                        className={`border-b hover:bg-muted/30 ${
                          contact.status === 'unread' ? 'font-medium' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          {contact.status === 'unread' ? (
                            <Badge variant="default">Unread</Badge>
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </td>
                        <td className="px-4 py-3">{contact.name}</td>
                        <td className="px-4 py-3">{contact.email}</td>
                        <td className="px-4 py-3">
                          {contact.subject || '(No subject)'}
                        </td>
                        <td className="px-4 py-3">
                          {format(parseISO(contact.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewContact(contact)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ScrollArea>
        </>
      )}
    </div>
  );
} 