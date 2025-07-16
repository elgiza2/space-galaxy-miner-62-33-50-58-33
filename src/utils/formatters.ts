
export const formatCoins = (coins: number | null) => {
  if (!coins) return '0';
  if (coins >= 1000000) {
    return `${(coins / 1000000).toFixed(1)}M`;
  } else if (coins >= 1000) {
    return `${(coins / 1000).toFixed(1)}K`;
  }
  return coins.toLocaleString();
};

export const formatPlayerCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`;
  }
  return count.toLocaleString();
};

export const getDisplayName = (user: { first_name?: string | null; username?: string | null; referral_name?: string | null }) => {
  if (user.first_name && user.first_name.trim()) {
    return user.first_name.trim();
  }
  
  if (user.username && user.username.trim()) {
    return user.username.trim();
  }
  
  if (user.referral_name && !user.referral_name.startsWith('SPACE#')) {
    return user.referral_name;
  }
  
  return user.referral_name || 'Unknown User';
};

export const getAvatarFallback = (displayName: string) => {
  return displayName.charAt(0).toUpperCase();
};
