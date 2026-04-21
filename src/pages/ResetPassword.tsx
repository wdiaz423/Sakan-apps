import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Status = 'verifying' | 'valid' | 'invalid';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>('verifying');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    let active = true;

    const parseHashParams = () => {
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash;
      return new URLSearchParams(hash);
    };

    const fail = (msg: string) => {
      if (!active) return;
      setErrorMsg(msg);
      setStatus('invalid');
    };

    const validate = async () => {
      const hashParams = parseHashParams();
      const queryParams = new URLSearchParams(window.location.search);

      // 1) Explicit error in the URL (expired/invalid link from Supabase)
      const urlError =
        hashParams.get('error') ||
        hashParams.get('error_code') ||
        queryParams.get('error') ||
        queryParams.get('error_code');
      if (urlError) {
        const desc =
          hashParams.get('error_description') ||
          queryParams.get('error_description') ||
          'El enlace ha expirado o no es válido.';
        return fail(decodeURIComponent(desc.replace(/\+/g, ' ')));
      }

      // 2) Verify there's a recovery type and tokens present
      const type = hashParams.get('type') || queryParams.get('type');
      const accessToken = hashParams.get('access_token');
      const hasCode = queryParams.get('code');

      // 3) Wait briefly for Supabase to process the hash and emit PASSWORD_RECOVERY
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (!active) return;
        if (event === 'PASSWORD_RECOVERY' && session) {
          setStatus('valid');
        }
      });

      // Give the SDK a moment to parse the URL
      await new Promise(r => setTimeout(r, 400));

      const { data, error } = await supabase.auth.getSession();
      if (!active) {
        sub.subscription.unsubscribe();
        return;
      }

      if (error) {
        sub.subscription.unsubscribe();
        return fail(error.message || 'No se pudo verificar el enlace.');
      }

      if (data.session) {
        // Only accept session if it came from a recovery flow
        if (type === 'recovery' || accessToken || hasCode) {
          setStatus('valid');
        } else {
          // There was an existing session but no recovery context — reject
          sub.subscription.unsubscribe();
          return fail('Este enlace no es válido para restablecer la contraseña.');
        }
      } else {
        sub.subscription.unsubscribe();
        return fail('El enlace ha expirado o no es válido. Solicita uno nuevo.');
      }

      return () => sub.subscription.unsubscribe();
    };

    validate();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'valid') return;
    if (password !== confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Contraseña actualizada');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar la contraseña');
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
            className={`mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-5 ${
              status === 'invalid' ? 'bg-destructive' : 'bg-primary glow-primary'
            }`}
            whileHover={{ rotate: 10, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {status === 'invalid' ? (
              <AlertCircle className="h-8 w-8 text-destructive-foreground" />
            ) : (
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            )}
          </motion.div>
          <h1 className="text-3xl font-heading text-foreground tracking-tight">
            {status === 'invalid' ? 'Enlace no válido' : 'Nueva contraseña'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {status === 'verifying' && 'Verificando enlace...'}
            {status === 'valid' && 'Crea una nueva contraseña segura'}
            {status === 'invalid' && (errorMsg || 'El enlace ha expirado o no es válido.')}
          </p>
        </div>

        {status === 'valid' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Nueva contraseña</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 h-11 rounded-xl border-border/50"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 h-11 rounded-xl border-border/50"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl glow-primary" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        )}

        {status === 'invalid' && (
          <div className="space-y-3">
            <Link to="/forgot-password" className="block">
              <Button className="w-full h-11 rounded-xl glow-primary">
                Solicitar un nuevo enlace
              </Button>
            </Link>
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a iniciar sesión
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
