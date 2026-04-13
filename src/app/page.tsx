"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Lock, Zap, Share2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        router.push('/dashboard');
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-20">
          <Skeleton className="h-12 w-48 mb-8" />
          <Skeleton className="h-32 w-full mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <main className="container mx-auto max-w-4xl px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Kelola Pengeluaran Rutin dengan Mudah
          </h1>
          <p className="text-lg text-muted-foreground mb-8 text-balance">
            Lacak semua pengeluaran rutin Anda di satu tempat dengan database terpusat yang aman dan dapat diakses dari mana saja.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.push('/auth/login')} size="lg" className="font-semibold">
              Masuk
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button onClick={() => router.push('/auth/signup')} size="lg" variant="outline" className="font-semibold">
              Daftar Gratis
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Data Aman & Terlindungi</h3>
                  <p className="text-sm text-muted-foreground">Semua data Anda tersimpan dengan aman di database terenkripsi dengan akses terbatas hanya untuk Anda.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Sinkronisasi Real-time</h3>
                  <p className="text-sm text-muted-foreground">Akses data Anda dari perangkat apa pun dan perubahan akan langsung tersinkronisasi secara otomatis.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Share2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Mudah Dimigrasi</h3>
                  <p className="text-sm text-muted-foreground">Migrasikan data lokal Anda ke database dengan mudah dan terus gunakan fitur yang sama.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-balance">Cara Kerja</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
              <p className="font-semibold text-foreground mb-2">Daftar</p>
              <p className="text-sm text-muted-foreground">Buat akun dengan email Anda</p>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
              <p className="font-semibold text-foreground mb-2">Migrasi Data</p>
              <p className="text-sm text-muted-foreground">Pindahkan data lama Anda ke database</p>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
              <p className="font-semibold text-foreground mb-2">Kelola</p>
              <p className="text-sm text-muted-foreground">Tambah, edit, dan kelola pengeluaran</p>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
              <p className="font-semibold text-foreground mb-2">Pantau</p>
              <p className="text-sm text-muted-foreground">Pantau progress dari mana saja</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center p-4 text-sm text-muted-foreground border-t border-border mt-20">
        <p>&copy; {new Date().getFullYear()} Biaya RT. Dibuat dengan ❤️.</p>
      </footer>
    </div>
  );
}
