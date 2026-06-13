import { motion } from 'framer-motion';

interface BadgePopupProps {
  badge: {
    name: string;
    rarity: string;
    icon: string;
  };
}

export function BadgePopup({ badge }: BadgePopupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-3 text-sm text-white"
    >
      <div className="flex items-center gap-3">
        <span>{badge.icon}</span>
        <div>
          <p className="font-semibold">{badge.name}</p>
          <p className="text-xs text-[#8C8C9D]">{badge.rarity}</p>
        </div>
      </div>
    </motion.div>
  );
}
