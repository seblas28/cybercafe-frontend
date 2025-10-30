// src/pages/admin/AdminDemand.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { generateDemandPredictions, type DemandPrediction } from '@/utils/mockData';
import { TrendingUp, BarChart3, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSidebar } from '@/contexts/SidebarContext';

export default function AdminDemand() {
  const [predictions, setPredictions] = useState<DemandPrediction[]>([]);
  const [selectedDay, setSelectedDay] = useState('Lunes');
  const { isOpen } = useSidebar();

  useEffect(() => {
    const data = generateDemandPredictions();
    setPredictions(data);
  }, []);

  const dayData = useMemo(() => predictions.filter(p => p.day === selectedDay), [predictions, selectedDay]);
  const maxUsage = useMemo(() => Math.max(...dayData.map(p => p.predictedUsage)), [dayData]);
  const avgUsage = useMemo(() => Math.round(dayData.reduce((sum, p) => sum + p.predictedUsage, 0) / dayData.length), [dayData]);

  const weeklyStats = useMemo(() => {
    const weeklyPeak = Math.max(...predictions.map(p => p.predictedUsage));
    const lowDemandHours = Math.round(predictions.filter(p => p.predictedUsage < 40).length / 7);
    const avgWeekly = Math.round(predictions.reduce((sum, p) => sum + p.predictedUsage, 0) / predictions.length);
    return { weeklyPeak, lowDemandHours, avgWeekly };
  }, [predictions]);

  const getBarColor = (usage: number) => {
    if (usage < 40) return 'bg-secondary';
    if (usage < 70) return 'bg-accent';
    return 'bg-destructive';
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
            <BarChart3 className="h-8 w-8 text-primary neon-text" />
            <h1 className="text-4xl font-bold neon-text glitch-effect">Predicción de Demanda</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="cyber-card p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Día</label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="cyber-input w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-muted-foreground">Pico: {maxUsage}%</p>
                <p className="text-sm text-muted-foreground">Promedio: {avgUsage}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="cyber-card p-6"
          >
            <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-16 gap-1">
              <AnimatePresence>
                {dayData.map((hour, i) => (
                  <motion.div
                    key={hour.hour}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`w-full ${getBarColor(hour.predictedUsage)} rounded-t-sm transition-all duration-300`}
                      style={{ height: `${(hour.predictedUsage / 100) * 120}px` }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{hour.hour}:00</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              {[
                { color: 'bg-secondary', label: 'Baja demanda', sub: '(< 40%)' },
                { color: 'bg-accent', label: 'Media demanda', sub: '(40-70%)' },
                { color: 'bg-destructive', label: 'Alta demanda', sub: '(> 70%)' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.05 }}
                  className="text-center cyber-card p-2"
                >
                  <div className={`w-4 h-4 ${item.color} rounded mx-auto mb-2`} />
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="cyber-card mt-8 bg-primary/10 border-primary/50 p-4"
          >
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" /> Insight Admin
            </h3>
            <p className="text-sm text-muted-foreground">
              Promedio semanal: {weeklyStats.avgWeekly}%. Usa estos datos para ajustar horarios de mantenimiento o promociones en horas bajas. Demanda pico: {weeklyStats.weeklyPeak}% los fines de semana.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}