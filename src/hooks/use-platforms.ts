"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Platform } from '@/lib/types';
import { useToast } from './use-toast';

const PLATFORMS_KEY = 'rutin-tracker-platforms';

const initialPlatforms: Platform[] = [
  { id: '1', name: 'Bibit' },
  { id: '2', name: 'Bank Jago' },
  { id: '3', name: 'Dana' },
  { id: '4', name: 'Gopay' },
  { id: '5', name: 'BCA' },
  { id: '6', name: 'Cash' },
];

export const usePlatforms = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    try {
      const storedPlatforms = localStorage.getItem(PLATFORMS_KEY);
      if (storedPlatforms) {
        setPlatforms(JSON.parse(storedPlatforms));
      } else {
        setPlatforms(initialPlatforms);
        localStorage.setItem(PLATFORMS_KEY, JSON.stringify(initialPlatforms));
      }
    } catch (error) {
      console.error("Failed to access localStorage for platforms:", error);
      setPlatforms(initialPlatforms);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAndSavePlatforms = useCallback((newPlatforms: Platform[]) => {
    setPlatforms(newPlatforms);
    try {
      localStorage.setItem(PLATFORMS_KEY, JSON.stringify(newPlatforms));
    } catch (error) {
      console.error("Failed to save platforms to localStorage:", error);
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan Platform",
        description: "Tidak dapat menyimpan perubahan platform.",
      });
    }
  }, [toast]);

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
