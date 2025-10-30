import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Calendar, X } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';

interface Reservation {
  id: string;
  pcId: string;
  startTime: string;
  duration: number;
  status: 'activa' | 'completada' | 'cancelada';
}

export default function ClientAccount() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const { isOpen } = useSidebar();
  const { toast } = useToast();

  useEffect(() => {
    loadReservations();
  }, [user]);

  const loadReservations = () => {
    const all = JSON.parse(localStorage.getItem('cybercafe_reservations') || '[]');
    setReservations(all.filter((r: any) => r.userId === user?.id));
  };

  const handleUpdateProfile = () => {
    toast({ title: "Perfil actualizado", description: "Cambios guardados (demo)" });
  };

  const handleCancelReservation = (id: string) => {
    const all = JSON.parse(localStorage.getItem('cybercafe_reservations') || '[]');
    const updated = all.map((r: any) => r.id === id ? { ...r, status: 'cancelada' } : r);
    localStorage.setItem('cybercafe_reservations', JSON.stringify(updated));
    loadReservations();
    toast({ title: "Reserva cancelada", description: "Cancelada con éxito" });
  };

  const getPCNumber = (pcId: string) => {
    const pcs = JSON.parse(localStorage.getItem('cybercafe_pcs') || '[]');
    return pcs.find((p: any) => p.id === pcId)?.number || 'Desconocido';
  };

  const getStatusColor = (status: string) => {
    return status === 'activa' ? 'text-green-400' : status === 'cancelada' ? 'text-red-400' : 'text-gray-400';
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className={`flex-1 p-8 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="cyber-card">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Mi Perfil</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={name} onChange={e => setName(e.target.value)} className="cyber-input" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} disabled className="cyber-input bg-muted" />
              </div>
              <Button onClick={handleUpdateProfile} className="cyber-button w-full">
                Guardar Cambios
              </Button>
            </div>
          </div>

          <div className="cyber-card">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Historial de Reservas</h2>
            </div>
            {reservations.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No tienes reservas</p>
            ) : (
              <div className="space-y-4">
                {reservations.map(r => (
                  <div key={r.id} className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-primary/20">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">PC #{getPCNumber(r.pcId)}</span>
                        <span className={`text-sm uppercase font-medium ${getStatusColor(r.status)}`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.startTime} • {r.duration}h</p>
                    </div>
                    {r.status === 'activa' && (
                      <Button onClick={() => handleCancelReservation(r.id)} variant="destructive" size="sm">
                        <X className="h-4 w-4 mr-1" /> Cancelar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}