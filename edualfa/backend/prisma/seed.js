const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const subjects = [
  {
    name: 'Mathematics',
    icon: '∑',
    color: '#F97316',
    quizTitle: 'Mathematics - Class 8 Quiz',
    questions: [
      { q: 'What is 7 × 8?', opts: ['54','56','58','49'], a: 1 },
      { q: 'Solve: 3/4 + 1/8 = ?', opts: ['7/8','5/8','1','3/8'], a: 0 },
      { q: 'What is the value of 2^5?', opts: ['16','32','64','8'], a: 1 },
      { q: 'What is the perimeter of a square with side 5 cm?', opts: ['10 cm','20 cm','25 cm','15 cm'], a: 1 },
      { q: 'If x + 5 = 12, x = ?', opts: ['7','17','-7','6'], a: 0 },
      { q: 'What is 45 ÷ 9?', opts: ['4','6','5','7'], a: 2 },
      { q: 'LCM of 4 and 6 is?', opts: ['12','24','8','6'], a: 0 },
      { q: 'What is 15% of 200?', opts: ['20','25','30','15'], a: 2 },
      { q: 'Which is an odd number?', opts: ['14','22','31','48'], a: 2 },
      { q: 'Area of rectangle 4x6 is?', opts: ['10','24','20','16'], a: 1 }
    ]
  },
  {
    name: 'Science',
    icon: '🔬',
    color: '#10B981',
    quizTitle: 'Science - Class 8 Quiz',
    questions: [
      { q: 'Which gas do plants produce during photosynthesis?', opts: ['Oxygen','Carbon Dioxide','Nitrogen','Hydrogen'], a: 0 },
      { q: 'Water boils at what temperature (°C)?', opts: ['50','90','100','120'], a: 2 },
      { q: 'Which part of the plant conducts water?', opts: ['Leaf','Root','Stem','Flower'], a: 2 },
      { q: 'The force that pulls objects toward Earth is called?', opts: ['Magnetism','Friction','Gravity','Electrostatic'], a: 2 },
      { q: 'Which is a renewable source of energy?', opts: ['Coal','Petrol','Wind','Natural Gas'], a: 2 },
      { q: 'Human body system for digestion is?', opts: ['Nervous','Digestive','Respiratory','Circulatory'], a: 1 },
      { q: 'Sound needs what to travel?', opts: ['Vacuum','Solid only','Medium','Light'], a: 2 },
      { q: 'Which organ pumps blood?', opts: ['Liver','Brain','Heart','Lungs'], a: 2 },
      { q: 'What is H2O commonly called?', opts: ['Salt','Water','Sugar','Oxygen'], a: 1 },
      { q: 'Which is a metal?', opts: ['Wood','Iron','Plastic','Rubber'], a: 1 }
    ]
  },
  {
    name: 'English',
    icon: '📘',
    color: '#3B82F6',
    quizTitle: 'English - Class 8 Quiz',
    questions: [
      { q: 'Select the correct plural of "child".', opts: ['childs','children','childes','childer'], a: 1 },
      { q: 'Choose the correct article: ___ apple', opts: ['A','An','The','No article'], a: 1 },
      { q: 'Find the synonym of "happy".', opts: ['sad','angry','joyful','tired'], a: 2 },
      { q: 'Choose the correct past tense: go', opts: ['goed','went','gone','goes'], a: 1 },
      { q: 'Identify the adjective: "A tall tree".', opts: ['A','tall','tree','None'], a: 1 },
      { q: 'Which is a pronoun?', opts: ['Alice','She','Dog','Run'], a: 1 },
      { q: 'Pick the correct spelling.', opts: ['Definately','Definitely','Definetly','Defenitely'], a: 1 },
      { q: 'Choose the antonym of "cold".', opts: ['hot','cool','icy','frigid'], a: 0 },
      { q: 'Which is a verb?', opts: ['Quick','Blue','Jump','Table'], a: 2 },
      { q: 'Select the correct sentence.', opts: ['He don\'t like it.','He doesn\'t like it.','He not like it.','He doesn\'t likes it.'], a: 1 }
    ]
  },
  {
    name: 'Social Studies',
    icon: '🌍',
    color: '#F59E0B',
    quizTitle: 'Social Studies - Class 8 Quiz',
    questions: [
      { q: 'Who is known as the father of the nation in India?', opts: ['Netaji','Gandhi','Nehru','Ambedkar'], a: 1 },
      { q: 'Which planet is known as the Red Planet?', opts: ['Venus','Earth','Mars','Jupiter'], a: 2 },
      { q: 'The capital of India is?', opts: ['Mumbai','New Delhi','Kolkata','Chennai'], a: 1 },
      { q: 'Which document is the supreme law of India?', opts: ['Constitution','Treaty','Charter','Act'], a: 0 },
      { q: 'Which ocean is the largest?', opts: ['Atlantic','Indian','Pacific','Arctic'], a: 2 },
      { q: 'The process of buying and selling is called?', opts: ['Trade','War','Govern','Cultivate'], a: 0 },
      { q: 'Which is a primary occupation?', opts: ['Farming','Banking','Teaching','Trading'], a: 0 },
      { q: 'UN stands for?', opts: ['United Nations','Universal Network','United Neighbors','Union Nations'], a: 0 },
      { q: 'Which is an example of non-renewable resource?', opts: ['Solar','Wind','Coal','Hydro'], a: 2 },
      { q: 'Who wrote the Indian Constitution?', opts: ['Ambedkar','Gandhi','Nehru','Patel'], a: 0 }
    ]
  },
  {
    name: 'Computer',
    icon: '💻',
    color: '#8B5CF6',
    quizTitle: 'Computer - Class 8 Quiz',
    questions: [
      { q: 'What does CPU stand for?', opts: ['Central Process Unit','Central Processing Unit','Computer Personal Unit','Control Processing Unit'], a: 1 },
      { q: 'Which is an input device?', opts: ['Monitor','Keyboard','Printer','Speaker'], a: 1 },
      { q: 'What is the brain of the computer?', opts: ['RAM','CPU','Hard Disk','Mouse'], a: 1 },
      { q: 'Which stores data permanently?', opts: ['RAM','ROM','Hard Disk','Cache'], a: 2 },
      { q: 'HTML is used for?', opts: ['Styling','Scripting','Markup','Database'], a: 2 },
      { q: 'Which is an example of an OS?', opts: ['Windows','Chrome','Firefox','Vite'], a: 0 },
      { q: 'Which language is used for web styles?', opts: ['HTML','CSS','Python','C++'], a: 1 },
      { q: 'Binary uses which digits?', opts: ['0 and 1','0 to 9','1 to 8','A and B'], a: 0 },
      { q: 'Which device displays output?', opts: ['Keyboard','Mouse','Monitor','Scanner'], a: 2 },
      { q: 'Which is a programming language?', opts: ['HTTP','HTML','Python','URL'], a: 2 }
    ]
  },
  {
    name: 'General Knowledge',
    icon: '🧠',
    color: '#EF4444',
    quizTitle: 'General Knowledge - Class 8 Quiz',
    questions: [
      { q: 'Who was the first President of the United States?', opts: ['Abraham Lincoln','George Washington','Thomas Jefferson','John Adams'], a: 1 },
      { q: 'The tallest mountain in the world is?', opts: ['K2','Kangchenjunga','Mount Everest','Lhotse'], a: 2 },
      { q: 'Water covers about what percent of Earth?', opts: ['50%','60%','70%','80%'], a: 2 },
      { q: 'The chemical symbol for gold is?', opts: ['Au','Ag','Gd','Go'], a: 0 },
      { q: 'Which country is known as the Land of the Rising Sun?', opts: ['China','Japan','Korea','Thailand'], a: 1 },
      { q: 'Which is the largest mammal?', opts: ['Elephant','Blue Whale','Giraffe','Hippopotamus'], a: 1 },
      { q: 'Which is a primary color?', opts: ['Green','Purple','Red','Brown'], a: 2 },
      { q: 'Which instrument measures temperature?', opts: ['Barometer','Hygrometer','Thermometer','Anemometer'], a: 2 },
      { q: 'Which planet has a ring system?', opts: ['Earth','Mars','Saturn','Venus'], a: 2 },
      { q: 'Which organ helps in breathing?', opts: ['Kidney','Lung','Heart','Liver'], a: 1 }
    ]
  }
  ,
  {
    name: 'Economics',
    icon: '📈',
    color: '#06B6D4',
    quizTitle: 'Economics - Class 8 Quiz',
    questions: [
      { q: 'What is the term for the amount of goods consumers want to buy?', opts: ['Supply','Demand','Market','Price'], a: 1 },
      { q: 'Money kept aside for future use is called?', opts: ['Spending','Saving','Investment','Donation'], a: 1 },
      { q: 'A place where goods are bought and sold is called?', opts: ['Factory','Market','Bank','School'], a: 1 },
      { q: 'When prices rise generally it is called?', opts: ['Deflation','Inflation','Recession','Boom'], a: 1 },
      { q: 'Producer is the person who?', opts: ['Buys goods','Sells services','Makes goods','Stores goods'], a: 2 },
      { q: 'Which is a factor of production?', opts: ['Land','Color','Shape','Taste'], a: 0 },
      { q: 'Goods that are used up quickly are called?', opts: ['Durable','Non-durable','Luxury','Fixed'], a: 1 },
      { q: 'The system of rules for money supply is managed by?', opts: ['Bank of India','Central Bank','Local shop','School'], a: 1 },
      { q: 'A record of income and expenses is called?', opts: ['Budget','Invoice','Receipt','Ticket'], a: 0 },
      { q: 'Trade between countries is called?', opts: ['Local trade','Foreign trade','Domestic trade','Retail trade'], a: 1 }
    ]
  },
  {
    name: 'Geography',
    icon: '🗺️',
    color: '#0EA5A4',
    quizTitle: 'Geography - Class 8 Quiz',
    questions: [
      { q: 'Which is the longest river in the world?', opts: ['Nile','Amazon','Yangtze','Mississippi'], a: 0 },
      { q: 'The line that divides Earth into Northern and Southern Hemispheres is?', opts: ['Prime Meridian','Equator','Tropic of Cancer','Arctic Circle'], a: 1 },
      { q: 'Mount Everest is located in which mountain range?', opts: ['Andes','Rockies','Himalayas','Alps'], a: 2 },
      { q: 'Which ocean is the largest by area?', opts: ['Atlantic','Indian','Arctic','Pacific'], a: 3 },
      { q: 'Which type of map shows height and terrain?', opts: ['Political map','Climate map','Topographic map','Road map'], a: 2 },
      { q: 'Latitude measures distance from the?', opts: ['Prime Meridian','Equator','Poles','Tropic'], a: 1 },
      { q: 'A dry area with sparse vegetation is called?', opts: ['Forest','Desert','Tundra','Swamp'], a: 1 },
      { q: 'The study of Earth’s atmosphere is called?', opts: ['Geology','Biology','Meteorology','Ecology'], a: 2 },
      { q: 'A river that flows into another river is called?', opts: ['Delta','Tributary','Estuary','Lagoon'], a: 1 },
      { q: 'The natural environment of a place is called its?', opts: ['Culture','Climate','Location','Population'], a: 1 }
    ]
  },
  {
    name: 'History',
    icon: '🏺',
    color: '#F43F5E',
    quizTitle: 'History - Class 8 Quiz',
    questions: [
      { q: 'Who was the first Prime Minister of India?', opts: ['Jawaharlal Nehru','Mahatma Gandhi','Sardar Patel','Subhas Chandra Bose'], a: 0 },
      { q: 'Which civilization built the pyramids?', opts: ['Indus','Mesopotamia','Egyptian','Mayan'], a: 2 },
      { q: 'The event of 1857 in India is known as?', opts: ['First War of Independence','Salt Satyagraha','Quit India Movement','Non-Cooperation Movement'], a: 0 },
      { q: 'Who wrote the Indian Constitution?', opts: ['Nehru','Ambedkar','Gandhi','Patel'], a: 1 },
      { q: 'Which empire was ruled by Akbar?', opts: ['Maratha','Mughal','British','Maurya'], a: 1 },
      { q: 'The Renaissance began in which country?', opts: ['France','England','Italy','Germany'], a: 2 },
      { q: 'Who discovered America in 1492 (commonly taught)?', opts: ['Vasco da Gama','Christopher Columbus','Magellan','Columbus'], a: 1 },
      { q: 'The Cold War was mainly between?', opts: ['USA and China','USA and USSR','UK and France','India and Pakistan'], a: 1 },
      { q: 'Stone Age people used tools made of?', opts: ['Metal','Stone','Plastic','Glass'], a: 1 },
      { q: 'The Great Wall is located in which country?', opts: ['India','China','Russia','Japan'], a: 1 }
    ]
  }
];

async function main() {
  const difficulties = ['Easy', 'Medium', 'Hard'];
  for (const sub of subjects) {
    // find or create subject (name is not unique in schema)
    let subject = await prisma.subject.findFirst({ where: { name: sub.name } });
    if (!subject) {
      subject = await prisma.subject.create({ data: { name: sub.name, icon: sub.icon, color: sub.color } });
      console.log(`Created subject '${sub.name}'`);
    } else {
      await prisma.subject.update({ where: { id: subject.id }, data: { icon: sub.icon, color: sub.color } });
    }

    // create three quizzes per subject for different difficulties with distinct questions
    for (const diffIndex in difficulties) {
      const difficulty = difficulties[diffIndex];
      const quizTitle = `${sub.quizTitle} - ${difficulty}`;

      // try exact title match first
      let quiz = await prisma.quiz.findFirst({ where: { title: quizTitle, subjectId: subject.id } });
      if (!quiz) {
        // look for any existing quiz that mentions this difficulty
        const matches = await prisma.quiz.findMany({ where: { subjectId: subject.id, title: { contains: difficulty } }, orderBy: { createdAt: 'desc' } });
        if (matches.length > 0) {
          // reuse most recent match and remove older duplicates
          quiz = matches[0];
          if (matches.length > 1) {
            for (let i = 1; i < matches.length; i++) {
              const old = matches[i];
              await prisma.quizAttempt.deleteMany({ where: { quizId: old.id } });
              await prisma.quiz.delete({ where: { id: old.id } });
              console.log(`Removed duplicate quiz '${old.title}' (${old.id})`);
            }
          }
          // rename to canonical title if different
          if (quiz.title !== quizTitle) {
            await prisma.quiz.update({ where: { id: quiz.id }, data: { title: quizTitle } });
            console.log(`Renamed quiz ${quiz.id} -> '${quizTitle}'`);
            quiz = await prisma.quiz.findUnique({ where: { id: quiz.id } });
          }
        } else {
          quiz = await prisma.quiz.create({ data: { title: quizTitle, subjectId: subject.id, duration: 10 } });
          console.log(`Created quiz '${quizTitle}' for subject ${sub.name}`);
        }
      }

      const existingCount = await prisma.question.count({ where: { quizId: quiz.id } });
      const baseCount = sub.questions.length;
      const needed = baseCount - existingCount;
      // For Medium quizzes, force recreate to ensure they differ from Easy
      const forceRecreate = difficulty.toLowerCase() === 'medium';
      if (forceRecreate && existingCount > 0) {
        await prisma.question.deleteMany({ where: { quizId: quiz.id } });
        console.log(`Cleared existing questions for ${quiz.title} to regenerate distinct Medium questions`);
      }
      const actualExisting = forceRecreate ? 0 : existingCount;
      const neededToCreate = baseCount - actualExisting;
      if (neededToCreate > 0) {
        // generate variants of base questions so each difficulty has different questions
        const toCreate = [];
        for (let i = actualExisting; i < baseCount; i++) {
          // pick a base question index shifted by difficulty so each difficulty gets different questions
          const shift = Number(diffIndex) % baseCount;
          const baseIndex = (i + shift) % baseCount;
          const q = sub.questions[baseIndex];
          const opts = Array.isArray(q.opts) ? q.opts.slice() : [];
          // rotate options by difficulty index to make options and correct index differ
          const d = Number(diffIndex) % (opts.length || 1);
          const rotated = opts.length ? opts.slice(d).concat(opts.slice(0, d)) : opts;
          const originalCorrect = typeof q.a === 'number' ? q.a : 0;
          const newCorrect = opts.length ? ((originalCorrect - d) % opts.length + opts.length) % opts.length : originalCorrect;

          toCreate.push({
            quizId: quiz.id,
            questionText: `${q.q} [${difficulty}]`,
            options: JSON.stringify(rotated),
            correctAnswer: typeof q.a === 'number' ? String(newCorrect) : JSON.stringify(q.a),
            points: 10,
            orderIndex: i
          });
        }

        for (const item of toCreate) {
          await prisma.question.create({ data: item });
        }
        console.log(`Added ${toCreate.length} questions to quiz '${quiz.title}'`);
      } else {
        console.log(`Quiz '${quiz.title}' already has ${existingCount} questions`);
      }
    }
  }

  console.log('Seeding complete.');

  // Post-pass: ensure any Medium quizzes that are identical to Easy are regenerated
  const allSubjects = await prisma.subject.findMany();
  for (const s of allSubjects) {
    const quizzes = await prisma.quiz.findMany({ where: { subjectId: s.id }, orderBy: { createdAt: 'asc' } });
    const easy = quizzes.find(q => /Easy/i.test(q.title));
    const medium = quizzes.find(q => /Medium/i.test(q.title));
    if (easy && medium) {
      const easyQs = await prisma.question.findMany({ where: { quizId: easy.id }, orderBy: { orderIndex: 'asc' } });
      const medQs = await prisma.question.findMany({ where: { quizId: medium.id }, orderBy: { orderIndex: 'asc' } });
      if (easyQs.length > 0 && medQs.length === easyQs.length) {
        const equal = easyQs.filter((q, i) => q.questionText === medQs[i].questionText).length;
        if (equal === easyQs.length) {
          // regenerate medium questions by rotating options and tagging difficulty
          await prisma.question.deleteMany({ where: { quizId: medium.id } });
          console.log(`Regenerating Medium questions for subject '${s.name}' from Easy quiz`);
          for (let i = 0; i < easyQs.length; i++) {
            const q = easyQs[i];
            let opts = [];
            try { opts = JSON.parse(q.options || '[]'); } catch (e) { opts = []; }
            const d = 1 % (opts.length || 1);
            const rotated = opts.length ? opts.slice(d).concat(opts.slice(0, d)) : opts;
            const originalCorrect = typeof q.correctAnswer === 'string' ? Number(q.correctAnswer) : q.correctAnswer || 0;
            const newCorrect = opts.length ? ((originalCorrect - d) % opts.length + opts.length) % opts.length : originalCorrect;
            await prisma.question.create({ data: {
              quizId: medium.id,
              questionText: `${q.questionText} [Medium]`,
              options: JSON.stringify(rotated),
              correctAnswer: String(newCorrect),
              points: q.points || 10,
              orderIndex: i
            } });
          }
        }
      }
    }
  }

  // create a test student if not exists
  const testStudentId = 'STU-2024-001';
  const testStudent = await prisma.student.findUnique({ where: { studentId: testStudentId } });
  if (!testStudent) {
    const hashed = bcrypt.hashSync('password123', 10);
    await prisma.student.create({ data: { name: 'Test Student', studentId: testStudentId, password: hashed } });
    console.log(`Created test student ${testStudentId} with password 'password123'`);
  } else {
    console.log(`Test student ${testStudentId} already exists`);
  }
}

async function runSeed() {
  return main();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { main };
