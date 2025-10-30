// src/pages/admin/AdminUserManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { Users, User, Shield, Ban, Edit3, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getMockUsers, banUser, editUserRole } from '@/utils/mockData';
import { useSidebar } from '@/contexts/SidebarContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'cliente' | 'admin';
  createdAt: string;
  lastLogin: string;
  isBanned: boolean;
}

export default function AdminUserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<'cliente' | 'admin'>('cliente');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { isOpen } = useSidebar();

  useEffect(() => {
    const mockUsers = getMockUsers().map(u => ({ ...u, lastLogin: '2025-10-20' }));
    setUsers(mockUsers);
  }, []);

  const filteredUsers = useMemo(() =>
    users.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [users, searchTerm]
  );

  const handleEditRole = (userId: string, newRole: 'cliente' | 'admin') => {
    if (userId === currentUser?.id) {
      toast({ variant: "destructive", title: "Error", description: "No puedes cambiar tu propio rol" });
      return;
    }
    editUserRole(userId, newRole);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setEditingId(null);
    toast({ title: "Rol actualizado", description: `Usuario ahora es ${newRole}` });
  };

  const handleBanUser = (userId: string) => {
    if (userId === currentUser?.id) {
      toast({ variant: "destructive", title: "Error", description: "No puedes banearte" });
      return;
    }
    banUser(userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: true } : u));
    toast({ title: "Usuario baneado", description: "Acceso bloqueado" });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <main className={`flex-1 p-8 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <Users className="h-8 w-8 text-primary neon-text" />
            <h1 className="text-4xl font-bold neon-text glitch-effect">Gestión de Usuarios</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="cyber-card p-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cyber-input flex-1"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="cyber-card"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/30">
                    <th className="text-left p-4">Usuario</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Rol</th>
                    <th className="text-left p-4">Estado</th>
                    <th className="text-left p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredUsers.map((user, i) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-primary/10"
                      >
                        <td className="p-4">{user.name}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4">
                          <Badge className={user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={user.isBanned ? 'bg-destructive' : 'bg-green-500'}>
                            {user.isBanned ? 'Baneado' : 'Activo'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {editingId === user.id ? (
                              <AnimatePresence>
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="space-y-1"
                                >
                                  <Select value={editRole} onValueChange={(v) => setEditRole(v as 'cliente' | 'admin')}>
                                    <SelectTrigger className="w-32 cyber-input">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="cliente">Cliente</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    onClick={() => handleEditRole(user.id, editRole)}
                                    size="sm"
                                    className="cyber-button w-full"
                                  >
                                    Guardar
                                  </Button>
                                </motion.div>
                              </AnimatePresence>
                            ) : (
                              <Button
                                onClick={() => setEditingId(user.id)}
                                variant="ghost"
                                size="sm"
                                className="cyber-button"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            )}
                            {!user.isBanned && (
                              <Button
                                onClick={() => handleBanUser(user.id)}
                                variant="destructive"
                                size="sm"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}