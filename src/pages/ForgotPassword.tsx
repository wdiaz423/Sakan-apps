import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success('Correo enviado. Revisa tu bandeja de entrada.');
    } catch (err: any) {
      toast.error(err.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <motion.div
            className="mx-auto h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-5 glow-primary"
            whileHover={{ rotate: 10, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-heading text-foreground tracking-tight">Recuperar contraseña</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {sent
              ? 'Te enviamos un enlace para restablecer tu contraseña'
              : 'Ingresa tu email y te enviaremos un enlace'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="pl-9 h-11 rounded-xl border-border/50"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl glow-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </Button>
          </form>
        ) : (
          <div className="rounded-xl border border-border/50 bg-card/50 p-4 text-sm text-muted-foreground text-center">
            Revisa tu correo <span className="text-foreground font-medium">{email}</span> y haz clic en el enlace para continuar.
          </div>
        )}

        <Link
          to="/auth"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a iniciar sesión
        </Link>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
