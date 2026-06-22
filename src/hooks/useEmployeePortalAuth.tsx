import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { portalSupabase } from '@/integrations/supabase/portalClient';

interface PortalAccount {
  id: string;
  employee_id: string;
  tenant_id: string;
  status: string;
  must_change_password: boolean;
}

interface PortalEmployee {
  id: string;
  first_name: string;
  last_name: string;
  document_number: string;
  email: string | null;
  position: string | null;
  department: string | null;
  photo_url: string | null;
  tenant_id: string;
}

interface PortalAuthContextType {
  user: User | null;
  session: Session | null;
  account: PortalAccount | null;
  employee: PortalEmployee | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<PortalAuthContextType | undefined>(undefined);

export function EmployeePortalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<PortalAccount | null>(null);
  const [employee, setEmployee] = useState<PortalEmployee | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAccount = async (uid: string) => {
    const { data: acc } = await portalSupabase
      .from('employee_portal_accounts')
      .select('id, employee_id, tenant_id, status, must_change_password')
      .eq('user_id', uid)
      .maybeSingle();
    setAccount(acc as PortalAccount | null);
    if (acc?.employee_id) {
      const { data: emp } = await portalSupabase
        .from('employees')
        .select('id, first_name, last_name, document_number, email, position, department, photo_url, tenant_id')
        .eq('id', acc.employee_id)
        .maybeSingle();
      setEmployee(emp as PortalEmployee | null);
    } else {
      setEmployee(null);
    }
  };

  const refresh = async () => {
    if (user) await loadAccount(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = portalSupabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) setTimeout(() => loadAccount(s.user.id), 0);
      else { setAccount(null); setEmployee(null); }
      setLoading(false);
    });
    portalSupabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadAccount(s.user.id);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await portalSupabase.auth.signOut();
    setUser(null); setSession(null); setAccount(null); setEmployee(null);
  };

  return (
    <Ctx.Provider value={{ user, session, account, employee, loading, signOut, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useEmployeePortalAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useEmployeePortalAuth must be used within EmployeePortalAuthProvider');
  return ctx;
}
