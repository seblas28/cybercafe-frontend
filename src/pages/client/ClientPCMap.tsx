import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { getPCs, type PC } from '@/utils/mockData';
import { Monitor, Zap, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSidebar } from '@/contexts/SidebarContext';

export default function ClientPCMap() {
  const [pcs, setPcs] = useState<PC[]>([]);
  const navigate = useNavigate();
  const { isOpen } = useSidebar();
  const { toast } = useToast();

  useEffect(() => {
    const load = () => setPcs(getPCs());
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePCClick = (pc: PC) => {
    if (pc.status === 'libre') {
      navigate(`/dashboard/cliente/reserve?pc=${pc.id}`);
    } else {
      toast({
        variant: "destructive",
        title: pc.status === 'ocupada' ? "PC Ocupada" : "En Mantenimiento",
        description: `PC #${pc.number} no disponible`,
      });
    }
  };

  const getStatusIcon = (s: PC['status']) => {
    return s === 'libre' ? <Monitor className="h-12 w-12 text-green-400" /> :
           s === 'ocupada' ? <Zap className="h-12 w-12 text-red-400" /> :
           <Wrench className="h-12 w-12 text-yellow-400" />;
  };

  const getStatusColor = (s: PC['status']) => {
    return s === 'libre' ? 'border-green-500 shadow-[0_0_15px_rgba(0,255,0,0.3)]' :
           s === 'ocupada' ? 'border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.3)]' :
           'border-yellow-500 shadow-[0_0_15px_rgba(255,255,0,0.3)]';
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className={`flex-1 p-8 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-cyan-400 mb-8">Mapa de PCs</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {pcs.map(pc => (
              <button
                key={pc.id}
                onClick={() => handlePCClick(pc)}
                className={`cyber-card p-6 rounded-xl border-2 ${getStatusColor(pc.status)} 
                  ${pc.status === 'libre' ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-60'}
                  transition-all duration-300`}
                disabled={pc.status !== 'libre'}
              >
                {getStatusIcon(pc.status)}
                <div className="mt-3 text-2xl font-bold">#{pc.number}</div>
                <div className="text-xs uppercase">{pc.status}</div>
                <div className="text-xs text-muted-foreground mt-1">{pc.location}</div>
              </button>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6">
            {['libre', 'ocupada', 'mantenimiento'].map(s => (
              <div key={s} className="cyber-card text-center p-6">
                <div className="text-4xl font-bold mb-2">
                  {pcs.filter(p => p.status === s).length}
                </div>
                <div className="text-muted-foreground capitalize">{s === 'mantenimiento' ? 'Manten.' : s}s</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}