'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Contact {
  id: string;
  name: string;
  phone: string;
  notes: string | null;
  visibleToSales: boolean;
}

export default function ContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/api/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await api.put(`/api/contacts/${editingContact.id}`, formData);
      } else {
        await api.post('/api/contacts', formData);
      }
      setShowModal(false);
      setEditingContact(null);
      setFormData({ name: '', phone: '', notes: '' });
      fetchContacts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save contact');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.delete(`/api/contacts/${id}`);
      fetchContacts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete contact');
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Quick phone book</p>
        </div>
        <button
          onClick={() => {
            setEditingContact(null);
            setFormData({ name: '', phone: '', notes: '' });
            setShowModal(true);
          }}
          className="flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 min-h-[44px] w-full md:w-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Contact
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
              placeholder="Search contacts..."
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                {user?.role === 'ADMIN' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visible to Sales</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{contact.name}</td>
                  <td className="px-6 py-4">{contact.phone}</td>
                  <td className="px-6 py-4">{contact.notes || 'N/A'}</td>
                  {user?.role === 'ADMIN' && (
                    <td className="px-6 py-4">
                      <button
                        onClick={async () => {
                          try {
                            await api.put(`/api/contacts/${contact.id}`, {
                              visibleToSales: !contact.visibleToSales,
                            });
                            fetchContacts();
                          } catch (error: any) {
                            alert(error.response?.data?.error || 'Failed to update visibility');
                          }
                        }}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors min-h-[44px] ${
                          contact.visibleToSales
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {contact.visibleToSales ? 'Visible' : 'Hidden'}
                      </button>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingContact(contact);
                          setFormData({
                            name: contact.name,
                            phone: contact.phone,
                            notes: contact.notes || '',
                          });
                          setShowModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-600 hover:text-red-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden p-4 space-y-3">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-600">{contact.phone}</p>
                </div>
                <div className="flex space-x-2 ml-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditingContact(contact);
                      setFormData({
                        name: contact.name,
                        phone: contact.phone,
                        notes: contact.notes || '',
                      });
                      setShowModal(true);
                    }}
                    className="text-primary-600 hover:text-primary-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="text-red-600 hover:text-red-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {contact.notes && (
                <div>
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-sm text-gray-700">{contact.notes}</p>
                </div>
              )}
              {user?.role === 'ADMIN' && (
                <div>
                  <button
                    onClick={async () => {
                      try {
                        await api.put(`/api/contacts/${contact.id}`, {
                          visibleToSales: !contact.visibleToSales,
                        });
                        fetchContacts();
                      } catch (error: any) {
                        alert(error.response?.data?.error || 'Failed to update visibility');
                      }
                    }}
                    className={`w-full px-3 py-2 rounded text-xs font-medium transition-colors min-h-[44px] ${
                      contact.visibleToSales
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {contact.visibleToSales ? 'Visible to Sales' : 'Hidden from Sales'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold mb-4">
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                />
              </div>
              <div className="flex flex-col space-y-2 md:flex-row md:justify-end md:space-y-0 md:space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingContact(null);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 min-h-[44px] w-full md:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 min-h-[44px] w-full md:w-auto"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

