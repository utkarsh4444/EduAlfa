import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { LeaderboardEntry } from '../../hooks/useLeaderboard';

export function RankRow({ entry, previousRank }: { entry: LeaderboardEntry; previousRank: number }) {
  const trend = previousRank > entry.rank ? 'up' : previousRank < entry.rank ? 'down' : 'flat';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] items-center gap-3 px-6 py-4"
    >
      <span className="text-white">#{entry.rank}</span>
      <span>{entry.studentName}</span>
      <span>{entry.score}</span>
      <span>{entry.quizzes}</span>
      <span className="flex items-center gap-2 text-sm text-[#8C8C9D]">
        {entry.badges}
        {trend === 'up' && <ArrowUpRight className="text-[#34D399]" size={16} />}
        {trend === 'down' && <ArrowDownRight className="text-[#FB7185]" size={16} />}
      </span>
    </motion.div>
  );
}
