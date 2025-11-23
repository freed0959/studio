"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from "@/components/ui/form";
import type { Platform } from "@/lib/types";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  name: z.string().min(1, "Nama platform tidak boleh kosong."),
});

type PlatformSettingsProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  platforms: Platform[];
  onAddPlatform: (name: string) => void;
  onUpdatePlatform: (id: string, newName: string) => void;
  onDeletePlatform: (id: string) => void;
};

export function PlatformSettings({
  isOpen,
  onOpenChange,
  platforms,
  onAddPlatform,
  onUpdatePlatform,
  onDeletePlatform,
}: PlatformSettingsProps) {
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Platform | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const handleAddNew = () => {
    setEditingPlatform({ id: 'new', name: '' });
    form.reset({ name: '' });
  };
  
  const handleEdit = (platform: Platform) => {
    setEditingPlatform(platform);
    form.reset({ name: platform.name });
  };

  const handleCancelEdit = () => {
    setEditingPlatform(null);
    form.reset({ name: "" });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingPlatform) {
      if (editingPlatform.id === 'new') {
        onAddPlatform(values.name);
      } else {
        onUpdatePlatform(editingPlatform.id, values.name);
      }
      handleCancelEdit();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pengaturan Platform</DialogTitle>
            <DialogDescription>
              Kelola daftar platform pembayaran Anda. Perubahan akan disimpan secara otomatis.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {platforms.map((platform) => (
              <div key={platform.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                <p className="flex-1 font-medium text-sm">{platform.name}</p>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(platform)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteCandidate(platform)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {editingPlatform && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-2 rounded-md bg-secondary flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input autoFocus placeholder={editingPlatform.id === 'new' ? 'Nama platform baru' : 'Ubah nama'} {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="sm" variant="default">Simpan</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={handleCancelEdit}>Batal</Button>
                </form>
              </Form>
            )}

          </div>

          <DialogFooter className="border-t pt-4">
             {!editingPlatform && (
                 <Button onClick={handleAddNew} variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Platform Baru
                </Button>
             )}
            <Button onClick={() => onOpenChange(false)} variant="secondary" className="w-full">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus platform <strong>{deleteCandidate?.name}</strong>. Ini dapat memengaruhi pengeluaran yang sudah ada yang menggunakan platform ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteCandidate(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteCandidate) onDeletePlatform(deleteCandidate.id);
                setDeleteCandidate(null);
              }} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
