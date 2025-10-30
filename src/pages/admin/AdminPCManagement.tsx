// src/pages/admin/AdminPCManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { getPCs, updatePCStatus, type PC } from '@/utils/mockData';
import { Settings, Monitor, Zap, Wrench, Edit, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/contexts/SidebarContext';

export default function AdminPCManagement() {
  const [pcs, setPcs] = useState<PC[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<'libre' | 'ocupada' | 'mantenimiento'>('libre');
  const { toast } = useToast();
  const { isOpen } = useSidebar();

  useEffect(() => {
    setPcs(getPCs());
  }, []);

  const statusCounts = useMemo(() => {
    const libre = pcs.filter(p => p.status === 'libre').length;
    const ocupada = pcs.filter(p => p.status === 'ocupada').length;
    const mantenimiento = pcs.filter(p => p.status === 'mantenimiento').length;
    return { libre, ocupada, mantenimiento };
  }, [pcs]);

  const handleEditStatus = (pcId: string, newStatus: PC['status']) => {
    updatePCStatus(pcId, newStatus);
    setPcs(prev => prev.map(p => p.id === pcId ? { ...p, status: newStatus } : p));
    setEditingId(null);
    toast({ title: "PC actualizada", description: `PC #${pcs.find(p => p.id === pcId)?.number} → ${newStatus}` });
  };

  const statusColor = (status: PC['status']) => {
    switch (status) {
      case 'libre': return 'bg-secondary';
      case 'ocupada': return 'bg-destructive';
      case 'mantenimiento': return 'bg-muted';
      default: return 'bg-muted';
    }
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
            <Settings className="h-8 w-8 text-primary neon-text" />
            <h1 className="text-4xl font-bold neon-text glitch-effect">Gestión de PCs</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {[
              { label: 'Libres', count: statusCounts.libre, color: 'bg-secondary' },
              { label: 'Ocupadas', count: statusCounts.ocupada, color: 'bg-destructive' },
              { label: 'Mantenimiento', count: statusCounts.mantenimiento, color: 'bg-muted' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="cyber-card text-center p-6"
              >
                <div className={`w-12 h-12 ${stat.color} rounded-full mx-auto mb-3`} />
                <div className="text-3xl font-bold neon-text">{stat.count}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {pcs.map((pc, i) => (
                <motion.div
                  key={pc.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="cyber-card p-6"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">PC #{pc.number}</h3>
                    <Badge className={`${statusColor(pc.status)} neon-text`}>
                      {pc.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Ubicación: {pc.location}</p>
                  <p className="text-sm text-muted-foreground mb-4">Especs: {pc.specs}</p>
                  <Button
                    onClick={() => setEditingId(editingId === pc.id ? null : pc.id)}
                    variant="ghost"
                    size="sm"
                    className="cyber-button mb-2"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Estado
                  </Button>
                  <AnimatePresence>
                    {editingId === pc.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2"
                      >
                        {(['libre', 'ocupada', 'mantenimiento'] as PC['status'][]).map(status => (
                          <Button
                            key={status}
                            onClick={() => handleEditStatus(pc.id, status)}
                            variant="outline"
                            size="sm"
                            className="cyber-button"
                          >
                            {status}
                          </Button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}