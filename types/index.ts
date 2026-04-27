export interface User {
  id: string
  clerk_id: string
  username: string
  email: string
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Payment {
  id: string
  user_id: string | null
  creator_id: string
  amount: number
  message: string | null
  is_anonymous: boolean
  show_amount: boolean
  stripe_payment_intent: string
  created_at: string
  supporter?: User
}

export interface PublicPayment {
  id: string
  supporter_name: string | null
  amount: number | null
  message: string | null
  created_at: string
  reactions?: Record<string, number>
}

export interface LeaderboardEntry {
  rank: number
  supporter_name: string | null
  total_amount: number
  support_count: number
  latest_at: string
  is_anonymous: boolean
}

export interface DailyRevenue {
  date: string
  amount: number
  count: number
}

export interface AnalyticsSummary {
  total_revenue: number
  monthly_revenue: number
  weekly_revenue: number
  total_supporters: number
  monthly_supporters: number
  avg_donation: number
  top_donation: number
  daily_data: DailyRevenue[]
}

export type ReactionEmoji = '☕' | '❤️' | '🔥' | '🎉' | '👏' | '💛'
export const REACTION_EMOJIS: ReactionEmoji[] = ['☕', '❤️', '🔥', '🎉', '👏', '💛']

export interface Tier {
  id: string
  creator_id: string
  name: string
  price: number
  benefits: string[]
  stripe_price_id: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  creator_id: string
  tier_id: string
  stripe_subscription_id: string
  status: 'active' | 'canceled' | 'past_due'
  current_period_end: string
  tier?: Tier
}

export interface Post {
  id: string
  creator_id: string
  title: string
  content: string
  is_public: boolean
  tier_id: string | null
  created_at: string
}

export interface Goal {
  goal_amount:   number | null
  goal_label:    string | null
  thank_you_msg: string | null
}

export interface PostItem {
  id:         string
  creator_id: string
  title:      string
  content:    string
  is_public:  boolean
  cover_url:  string | null
  created_at: string
  updated_at: string
}