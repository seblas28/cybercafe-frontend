import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';

export default function ClientReport() {
  const [subject, setSubject] = useState('');
  const [pcNumber, setPcNumber] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useAuth();
  const { isOpen } = useSidebar();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) {
      toast({ variant: "destructive", title: "Error", description: "Completa los campos" });
      return;
    }

    const reports = JSON.parse(localStorage.getItem('cybercafe_reports') || '[]');
    reports.push({
      id: Date.now().toString(),
      userId: user?.id,
      userName: user?.name,
      subject, pcNumber, description,
      timestamp: new Date().toISOString(),
      status: 'pendiente'
    });
    localStorage.setItem('cybercafe_reports', JSON.stringify(reports));

    toast({ title: "Reporte enviado", description: "Gracias por tu feedback" });
    setSubject(''); setPcNumber(''); setDescription('');
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className={`flex-1 p-8 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="max-w-2xl mx-auto">
          <div className="cyber-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Reportar Problema</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Asunto *</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} className="cyber-input" placeholder="Ej: PC no enciende" required />
              </div>
              <div className="space-y-2">
                <Label>Número de PC (opcional)</Label>
                <Input value={pcNumber} onChange={e => setPcNumber(e.target.value)} type="number" className="cyber-input" placeholder="Ej: 5" />
              </div>
              <div className="space-y-2">
                <Label>Descripción *</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} className="cyber-input min-h-32" placeholder="Describe el problema..." required />
              </div>
              <Button type="submit" className="w-full cyber-button">Enviar Reporte</Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}