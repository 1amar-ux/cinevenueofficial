import { apiClient } from './client';
import { Movie, Theatre, ShowSchedule, SeatInfo } from '../types/movie';

export const movieApi = {
  getNowShowing: async (city?: string): Promise<Movie[]> => {
    const res = await apiClient.get('/movies/now-showing', { params: { city } });
    return res.data?.data?.movies || res.data?.movies || [];
  },

  getUpcoming: async (): Promise<Movie[]> => {
    const res = await apiClient.get('/movies/upcoming');
    return res.data?.data?.movies || res.data?.movies || [];
  },

  getMovieDetails: async (movieId: string): Promise<Movie> => {
    const res = await apiClient.get(`/movies/${movieId}`);
    return res.data?.data?.movie || res.data?.movie || res.data;
  },

  search: async (query: string): Promise<{ movies: Movie[]; theatres: Theatre[]; events: any[] }> => {
    const res = await apiClient.get('/movies/search', { params: { q: query } });
    return res.data?.data || { movies: [], theatres: [], events: [] };
  }
};

export const theatreApi = {
  getTheatresByCity: async (city: string): Promise<Theatre[]> => {
    const res = await apiClient.get('/theatres', { params: { city } });
    return res.data?.data?.theatres || res.data?.theatres || [];
  },

  getTheatreDetails: async (theatreId: string): Promise<Theatre> => {
    const res = await apiClient.get(`/theatres/${theatreId}`);
    return res.data?.data?.theatre || res.data?.theatre || res.data;
  }
};

export const showApi = {
  getShowtimes: async (params: { movieId: string; date: string; city: string }): Promise<{ [theatreId: string]: { theatre: Theatre; shows: ShowSchedule[] } }> => {
    const res = await apiClient.get('/shows', { params });
    return res.data?.data?.schedules || res.data?.schedules || {};
  },

  getSeats: async (showId: string, theatreId?: string): Promise<{ seats: SeatInfo[]; screenName: string; isPosIntegration: boolean }> => {
    const res = await apiClient.get(`/shows/${showId}/seats`, { params: { theatreId } });
    return res.data?.data || { seats: [], screenName: 'Screen 1', isPosIntegration: false };
  }
};
