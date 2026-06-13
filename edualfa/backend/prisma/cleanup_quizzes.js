const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subjects = await prisma.subject.findMany({ include: { quizzes: true } });
  const difficulties = ['Easy', 'Medium', 'Hard'];

  for (const subject of subjects) {
    const quizzes = subject.quizzes;
    if (quizzes.length <= 3) {
      console.log(`Subject ${subject.name} has ${quizzes.length} quizzes — skipping`);
      continue;
    }

    // group quizzes by difficulty keyword found in title
    const byDifficulty = {};
    for (const d of difficulties) byDifficulty[d] = [];

    const others = [];
    for (const q of quizzes) {
      const found = difficulties.find((d) => new RegExp(`\\b${d}\\b`, 'i').test(q.title));
      if (found) byDifficulty[found].push(q);
      else others.push(q);
    }

    // choose one quiz per difficulty (prefer latest createdAt)
    const keepIds = new Set();
    for (const d of difficulties) {
      const list = byDifficulty[d];
      if (list.length === 0) continue;
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      keepIds.add(list[0].id);
    }

    // if less than 3 selected, fill from 'others' by newest
    const remainingSlots = 3 - keepIds.size;
    if (remainingSlots > 0) {
      const sortedOthers = others.concat(...Object.values(byDifficulty).flat()).filter((q) => !keepIds.has(q.id));
      sortedOthers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      for (let i = 0; i < remainingSlots && i < sortedOthers.length; i++) {
        keepIds.add(sortedOthers[i].id);
      }
    }

    // determine to-delete quizzes
    const toDelete = quizzes.filter((q) => !keepIds.has(q.id));
    if (toDelete.length === 0) {
      console.log(`Subject ${subject.name}: nothing to delete`);
      continue;
    }

    console.log(`Subject ${subject.name}: keeping ${Array.from(keepIds).length} quizzes, deleting ${toDelete.length}`);

    for (const q of toDelete) {
      // delete attempts first to avoid FK issues
      await prisma.quizAttempt.deleteMany({ where: { quizId: q.id } });
      await prisma.quiz.delete({ where: { id: q.id } });
      console.log(`Deleted quiz ${q.title} (${q.id}) and its attempts`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
