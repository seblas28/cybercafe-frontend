import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';

interface Product {
  id: string;
  name: string;
  price: number;
  category: 'bebidas' | 'snacks';
}

const products: Product[] = [
  { id: '1', name: 'Coca Cola', price: 2.5, category: 'bebidas' },
  { id: '2', name: 'Agua', price: 1.5, category: 'bebidas' },
  { id: '3', name: 'Red Bull', price: 3.5, category: 'bebidas' },
  { id: '4', name: 'Café', price: 2.0, category: 'bebidas' },
  { id: '5', name: 'Papas Fritas', price: 2.0, category: 'snacks' },
  { id: '6', name: 'Doritos', price: 2.5, category: 'snacks' },
  { id: '7', name: 'Chocolate', price: 1.5, category: 'snacks' },
  { id: '8', name: 'Sandwich', price: 5.0, category: 'snacks' },
];

export default function ClientCafeteria() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const { isOpen } = useSidebar();
  const { toast } = useToast();

  const addToCart = (id: string) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id]--;
      else delete newCart[id];
      return newCart;
    });
  };

  const getTotal = () => Object.entries(cart).reduce((t, [id, q]) => {
    const p = products.find(x => x.id === id);
    return t + (p?.price || 0) * q;
  }, 0);

  const handleOrder = () => {
    if (Object.keys(cart).length === 0) {
      toast({ variant: "destructive", title: "Carrito vacío", description: "Agrega productos" });
      return;
    }
    const orders = JSON.parse(localStorage.getItem('cybercafe_orders') || '[]');
    orders.push({ cart, total: getTotal(), date: new Date().toISOString() });
    localStorage.setItem('cybercafe_orders', JSON.stringify(orders));
    toast({ title: "Pedido enviado", description: "¡Gracias por tu compra!" });
    setCart({});
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className={`flex-1 p-8 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="cyber-card mb-8">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Cafetería</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="cyber-card p-4">
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <p className="text-primary font-bold">${p.price.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button onClick={() => removeFromCart(p.id)} size="icon" variant="outline" className="h-8 w-8">
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-bold">{cart[p.id] || 0}</span>
                    <Button onClick={() => addToCart(p.id)} size="icon" variant="outline" className="h-8 w-8">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {Object.keys(cart).length > 0 && (
            <div className="cyber-card">
              <h2 className="text-xl font-bold mb-4">Tu Pedido</h2>
              {Object.entries(cart).map(([id, q]) => {
                const p = products.find(x => x.id === id);
                if (!p) return null;
                return (
                  <div key={id} className="flex justify-between py-2 border-b border-primary/20">
                    <span>{p.name} x{q}</span>
                    <span>${(p.price * q).toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="mt-4 pt-4 border-t border-primary flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-primary">${getTotal().toFixed(2)}</span>
              </div>
              <Button onClick={handleOrder} className="w-full mt-4 cyber-button">
                Realizar Pedido
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}