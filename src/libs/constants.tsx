import { DiscordIcon, TelegramIcon, TwitterIcon } from '@/components/icons';

export const TWITTER_USER_NAME = 'deban_xyz';
export const SITE_URL = 'https://deban.xyz';

export const communityAccounts = [
  {
    title: 'Twitter',
    description: 'For announcements, tips and general information.',
    icon: <TwitterIcon className="text-[#00ACEE]" size={32} />,
    href: 'https://twitter.com/deban_xyz',
    isExternal: true,
  },

  {
    title: 'Telegram',
    description:
      'To report bugs, request features and contribute to the project.',
    icon: (
      <TelegramIcon className="text-[#333] dark:text-[#E7E7E7]" size={32} />
    ),
    href: 'https://t.me/deban_xyz',
    isExternal: true,
  },
  {
    title: 'Discord',
    description:
      'To get involved in the community, ask questions and share tips.',
    icon: <DiscordIcon className="text-[#7289DA]" size={32} />,
    href: 'https://discord.gg/kX2RCHRa',
    isExternal: true,
  },
];
