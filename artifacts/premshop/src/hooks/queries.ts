import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Product, Category, Announcement, Order, Ticket, WalletTransaction } from '@/lib/supabase';
import { IS_DEMO, MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_ANNOUNCEMENTS } from '@/lib/mock-data';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (IS_DEMO) return MOCK_PRODUCTS;
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      if (IS_DEMO) return MOCK_PRODUCTS.find(p => p.id === id) ?? null;
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      if (IS_DEMO) return MOCK_CATEGORIES;
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      if (IS_DEMO) return MOCK_ANNOUNCEMENTS;
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
  });
}

export function useMyOrders(userId?: string) {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      if (IS_DEMO) return [] as Order[];
      const { data, error } = await supabase
        .from('orders')
        .select('*, product:products(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!userId,
  });
}

export function useMyTickets(userId?: string) {
  return useQuery({
    queryKey: ['tickets', userId],
    queryFn: async () => {
      if (IS_DEMO) return [] as Ticket[];
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Ticket[];
    },
    enabled: !!userId,
  });
}

export function useWalletTransactions(userId?: string) {
  return useQuery({
    queryKey: ['wallet_transactions', userId],
    queryFn: async () => {
      if (IS_DEMO) return [] as WalletTransaction[];
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as WalletTransaction[];
    },
    enabled: !!userId,
  });
}

export function useSubmitTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketData: Partial<Ticket>) => {
      if (IS_DEMO) throw new Error('กรุณาเชื่อมต่อ Supabase ก่อนใช้งานจริง');
      const { data, error } = await supabase.from('tickets').insert([ticketData]).select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', data.user_id] });
    },
  });
}

export function useSubmitTopup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (topupData: Partial<WalletTransaction>) => {
      if (IS_DEMO) throw new Error('กรุณาเชื่อมต่อ Supabase ก่อนใช้งานจริง');
      const { data, error } = await supabase.from('wallet_transactions').insert([topupData]).select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallet_transactions', data.user_id] });
    },
  });
}
