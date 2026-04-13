"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Platform } from '@/lib/types';
import { useToast } from './use-toast';
import { createClient } from '@/lib/supabase/client';

export const usePlatformsSuapabase = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const loadPlatforms = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setPlatforms([]);
          return;
        }

        const { data, error } = await supabase
          .from('platforms')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        setPlatforms(data || []);
      } catch (error) {
        console.error("Failed to load platforms from Supabase:", error);
        toast({
          variant: "destructive",
          title: "Gagal Memuat Platform",
          description: "Tidak dapat memuat daftar platform dari database.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlatforms();
  }, [toast]);

  const updateAndSavePlatforms = useCallback(async (newPlatforms: Platform[]) => {
    setPlatforms(newPlatforms);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Sync all platforms to Supabase
      for (const platform of newPlatforms) {
        const { error } = await supabase
          .from('platforms')
          .upsert({
            id: platform.id,
            user_id: user.id,
            name: platform.name,
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error("Failed to save platforms to Supabase:", error);
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan Platform",
        description: "Tidak dapat menyimpan perubahan platform.",
      });
    }
  }, [supabase, toast]);

  const addPlatform = useCallback((name: string) => {
    if (platforms.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        toast({
            variant: "destructive",
            title: "Platform Sudah Ada",
            description: `Platform dengan nama "${name}" sudah ada.`,
        });
        return;
    }
    const newPlatform: Platform = { id: Date.now().toString(), name };
    updateAndSavePlatforms([...platforms, newPlatform]);
    toast({
        title: "Platform Ditambahkan",
        description: `"${name}" telah ditambahkan ke daftar platform.`,
    });
  }, [platforms, updateAndSavePlatforms, toast]);

  const updatePlatform = useCallback((id: string, newName: string) => {
    if (platforms.some(p => p.id !== id && p.name.toLowerCase() === newName.toLowerCase())) {
        toast({
            variant: "destructive",
            title: "Nama Platform Sama",
            description: `Platform dengan nama "${newName}" sudah ada.`,
        });
        return;
    }
    let oldName = '';
    const newPlatforms = platforms.map(p => {
        if (p.id === id) {
            oldName = p.name;
            return { ...p, name: newName };
        }
        return p;
    });
    updateAndSavePlatforms(newPlatforms);
    toast({
        title: "Platform Diperbarui",
        description: `"${oldName}" telah diubah menjadi "${newName}".`,
    });
  }, [platforms, updateAndSavePlatforms, toast]);

  const deletePlatform = useCallback((id: string) => {
    const platformToDelete = platforms.find(p => p.id === id);
    if (!platformToDelete) return;

    updateAndSavePlatforms(platforms.filter(p => p.id !== id));
    toast({
        variant: "destructive",
        title: "Platform Dihapus",
        description: `"${platformToDelete.name}" telah dihapus.`,
    });
  }, [platforms, updateAndSavePlatforms, toast]);

  return { platforms, addPlatform, updatePlatform, deletePlatform, loading };
};
