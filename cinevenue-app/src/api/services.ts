import { apiClient } from './client';
import { CineCoinWallet, CineCoinTransaction, EventItem, FilmProject, TalentProfile } from '../types';

export const cineCoinApi = {
  getWallet: async (): Promise<CineCoinWallet> => {
    const res = await apiClient.get('/cinecoins/balance');
    return res.data?.data || {
      balance: 150,
      tier: 'GOLD',
      totalEarned: 450,
      totalRedeemed: 300,
      dailySpinAvailable: true
    };
  },

  getTransactions: async (): Promise<CineCoinTransaction[]> => {
    const res = await apiClient.get('/cinecoins/history');
    return res.data?.data?.transactions || [];
  },

  claimDailyBonus: async () => {
    const res = await apiClient.post('/cinecoins/claim-daily');
    return res.data;
  },

  spinLuckyWheel: async (): Promise<{ wonAmount: number; newBalance: number }> => {
    const res = await apiClient.post('/cinecoins/spin-wheel');
    return res.data?.data || res.data;
  }
};

export const eventApi = {
  getEvents: async (category?: string): Promise<EventItem[]> => {
    const res = await apiClient.get('/events', { params: { category } });
    return res.data?.data?.events || res.data?.events || [];
  },

  getEventDetails: async (eventId: string): Promise<EventItem> => {
    const res = await apiClient.get(`/events/${eventId}`);
    return res.data?.data?.event || res.data?.event || res.data;
  },

  bookEventPass: async (params: { eventId: string; tierId: string; quantity: number }) => {
    const res = await apiClient.post('/events/book', params);
    return res.data;
  }
};

export const marketplaceApi = {
  getProjects: async (): Promise<FilmProject[]> => {
    const res = await apiClient.get('/marketplace/projects');
    return res.data?.data?.projects || [];
  },

  getProjectDetails: async (projectId: string): Promise<FilmProject> => {
    const res = await apiClient.get(`/marketplace/projects/${projectId}`);
    return res.data?.data?.project || res.data;
  },

  getTalents: async (category?: string): Promise<TalentProfile[]> => {
    const res = await apiClient.get('/marketplace/talents', { params: { category } });
    return res.data?.data?.talents || [];
  }
};
