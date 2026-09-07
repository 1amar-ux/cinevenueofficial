export interface EventItem {
  id: string;
  title: string;
  category: 'CONCERT' | 'STANDUP' | 'THEATRE_PLAY' | 'WORKSHOP' | 'CELEBRITY_MEET' | 'FESTIVAL';
  bannerUrl?: string;
  date: string;
  time: string;
  venueName: string;
  city: string;
  organizerName: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  tiers: {
    id: string;
    name: string;
    price: number;
    description?: string;
    availableQuantity: number;
  }[];
}

export interface CineCoinWallet {
  balance: number;
  tier: 'SILVER' | 'GOLD' | 'PLATINUM_VIP';
  totalEarned: number;
  totalRedeemed: number;
  dailySpinAvailable: boolean;
  nextSpinAvailableAt?: string;
}

export interface CineCoinTransaction {
  id: string;
  type: 'EARN' | 'REDEEM' | 'BONUS' | 'SPIN' | 'REFUND';
  amount: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface FilmProject {
  id: string;
  title: string;
  category: string;
  stage: 'DEVELOPMENT' | 'PRE_PRODUCTION' | 'FILMING' | 'POST_PRODUCTION' | 'RELEASED';
  bannerUrl?: string;
  director?: string;
  producer?: string;
  synopsis: string;
  openRolesCount: number;
  roles?: {
    id: string;
    roleName: string;
    category: string;
    description: string;
    deadline?: string;
  }[];
}

export interface TalentProfile {
  id: string;
  name: string;
  category: string;
  experienceYears: number;
  avatarUrl?: string;
  location: string;
  bio: string;
  skills: string[];
  portfolioUrl?: string;
}
