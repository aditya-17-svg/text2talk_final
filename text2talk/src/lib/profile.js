import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from '../features/auth/AuthContext';


export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!user) return;
    let on = true;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (on) setProfile(data || {});
      });
    return () => {
      on = false;
    };
  }, [user?.id]);
  return profile;
}
