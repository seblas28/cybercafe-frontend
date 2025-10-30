import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getPCs, type PC } from '@/utils/mockData';
import { Calendar } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';

export default function ClientReserve() {
  const [searchParams] = useSearchParams();
  const prePC = searchParams.get('pc');
  const [pcs, setPcs] = useState<PC[]>([]);
  const [selectedPC, setSelectedPC] = useState(prePC || '');
  const [duration, setDuration] = useState('1');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOpen } = useSidebar();
  const { toast } = useToast();

  useEffect(() => {
    const available = getPCs().filter(p => p.status === 'libre');
    setPcs(available);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPC || !date || !time) {
      toast({ variant: "destructive", title: "Error", description: "Completa todos los campos" });
      return;
    }

    const reservations = JSON.parse(localStorage.getItem('cybercafe_reservations') || '[]');
    reservations.push({
      id: Date.now().toString(),
      userId: user?.id,
      pcId: selectedPC,
      startTime: `${date}T${time}:00`,
      duration: parseInt(duration),
      status: 'activa'
    });
    localStorage.setItem('cybercafe_reservations', JSON.stringify(reservations));

    toast({ title: "Reserva confirmada", description: "Tu PC está reservada" });
    navigate('/dashboard/cliente/my-account');
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className={`flex-1 p-8 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="max-w-2xl mx-auto">
          <div className="cyber-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Reservar PC</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>PC Disponible</Label>
                <Select value={selectedPC} onValueChange={setSelectedPC}>
                  <SelectTrigger className="cyber-input">
                    <SelectValue placeholder="Selecciona una PC" />
                  </SelectTrigger>
                  <SelectContent>
                    {pcs.map(pc => (
                      <SelectItem key={pc.id} value={pc.id}>PC #{pc.number} - {pc.location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="cyber-input" required />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="cyber-input" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Duración</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="cyber-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,6,8].map(h => <SelectItem key={h} value={h.toString()}>{h} hora{h>1?'s':''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="cyber-card bg-primary/10 p-4">
                <p className="text-sm"><strong>Total:</strong> ${parseInt(duration) * 5}.00</p>
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1 cyber-button">Confirmar</Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="border-primary">Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}