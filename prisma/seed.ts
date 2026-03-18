import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Demo Users ──────────────────────────────────────────────────────
  const password = await bcrypt.hash("password123", 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "amara@unilag.edu.ng" },
      update: {},
      create: {
        email: "amara@unilag.edu.ng", password,
        name: "Amara Diallo", university: "University of Lagos",
        major: "Computer Science", graduationYear: 2025,
        bio: "Full-stack developer passionate about Web3 and open source.",
        walletAddress: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
      },
    }),
    prisma.user.upsert({
      where: { email: "carlos@usp.br" },
      update: {},
      create: {
        email: "carlos@usp.br", password,
        name: "Carlos Mendes", university: "University of São Paulo",
        major: "Design & UX", graduationYear: 2026,
        bio: "UI/UX designer creating beautiful digital experiences.",
        walletAddress: "0x8ba1f109551bD432803012645Hac136c9481B",
      },
    }),
    prisma.user.upsert({
      where: { email: "priya@iitb.ac.in" },
      update: {},
      create: {
        email: "priya@iitb.ac.in", password,
        name: "Priya Nair", university: "IIT Bombay",
        major: "Data Science", graduationYear: 2025,
        bio: "ML researcher and data scientist. Love turning data into insights.",
        walletAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      },
    }),
    prisma.user.upsert({
      where: { email: "kwame@ug.edu.gh" },
      update: {},
      create: {
        email: "kwame@ug.edu.gh", password,
        name: "Kwame Asante", university: "University of Ghana",
        major: "Finance & Blockchain", graduationYear: 2026,
        bio: "DeFi enthusiast. Building the future of African fintech.",
        walletAddress: "0x4Fabb145d64652a948d72533023f6E7A623C7C5",
      },
    }),
    prisma.user.upsert({
      where: { email: "fatima@uit.ac.ma" },
      update: {},
      create: {
        email: "fatima@uit.ac.ma", password,
        name: "Fatima El-Amin", university: "International University of Tunis",
        major: "Software Engineering", graduationYear: 2025,
        bio: "Backend engineer specialising in Node.js, PostgreSQL and system design.",
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // ── Opportunities ───────────────────────────────────────────────────
  const opps = [
    {
      title: "React & Next.js Frontend Developer for EdTech Startup",
      description: `We are building a next-generation e-learning platform targeting African universities and need a talented frontend developer to join our remote team for a 3-month contract.\n\nYou will be responsible for building interactive course modules, student dashboards, and real-time collaboration features using React and Next.js.\n\nRequirements:\n- Strong React and TypeScript skills\n- Experience with Next.js App Router\n- Familiar with REST APIs and state management\n- Bonus: experience with WebSockets or real-time features\n\nThis is a paid engagement with crypto compensation available.`,
      type: "GIG", paymentType: "CRYPTO", compensationAmount: 0.15,
      compensationCurrency: "ETH", cryptoNetworkChain: "ethereum",
      isRemote: true, skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
      tags: ["edtech", "frontend", "web3", "remote"], aiEnhanced: true,
      aiSummary: "Frontend developer role for an African EdTech startup building next-gen e-learning. Pays 0.15 ETH for a 3-month contract.",
      authorId: users[0].id,
    },
    {
      title: "UI/UX Designer for DeFi Wallet Mobile App",
      description: `A fast-growing Web3 startup is looking for a creative UI/UX designer to redesign our mobile DeFi wallet app from the ground up.\n\nScope of work:\n- User research and persona development\n- Wireframing and low-fi prototypes\n- High-fidelity Figma designs\n- Design system and component library\n- Handoff to engineering team\n\nWe believe great design is what separates products students love from ones they abandon. You'll work directly with the founding team.\n\nPay: 0.08 ETH on Polygon network (low gas fees).`,
      type: "GIG", paymentType: "CRYPTO", compensationAmount: 0.08,
      compensationCurrency: "ETH", cryptoNetworkChain: "polygon",
      isRemote: true, skills: ["Figma", "UI Design", "UX Research", "Mobile Design"],
      tags: ["design", "defi", "mobile", "web3"], aiEnhanced: true,
      aiSummary: "Creative UI/UX designer needed to redesign a DeFi wallet mobile app. Full design system scope, 0.08 ETH on Polygon.",
      authorId: users[1].id,
    },
    {
      title: "Machine Learning Research Assistant — NLP for Low-Resource Languages",
      description: `IIT Bombay's AI Lab is seeking a motivated research assistant to support ongoing work in natural language processing for low-resource African and South Asian languages.\n\nResponsibilities:\n- Data collection and annotation for under-resourced languages\n- Fine-tuning transformer models (BERT, mBERT, XLM-R)\n- Writing research reports and contributing to publications\n- Weekly syncs with lead researchers\n\nThis is a 6-month paid research position ideal for students interested in academia, AI safety, or multilingual NLP. Remote-friendly with optional campus visits.`,
      type: "RESEARCH", paymentType: "NEGOTIABLE",
      isRemote: true, skills: ["Python", "PyTorch", "NLP", "Transformers", "Research"],
      tags: ["ai", "nlp", "research", "academia", "machine-learning"],
      authorId: users[2].id,
    },
    {
      title: "Smart Contract Auditor — Solidity DeFi Protocol",
      description: `Growing DeFi protocol on Polygon is looking for a smart contract auditor to review our yield farming and staking contracts before mainnet launch.\n\nWhat you'll do:\n- Audit Solidity contracts for vulnerabilities (reentrancy, integer overflow, access control)\n- Write a detailed security report\n- Suggest and review fixes\n- Optionally write fuzz tests using Foundry\n\nIdeal for CS or blockchain students who understand EVM internals. We pay in USDC — fast, cross-border, no bank needed.`,
      type: "GIG", paymentType: "CRYPTO", compensationAmount: 500,
      compensationCurrency: "USDC", cryptoNetworkChain: "polygon",
      isRemote: true, skills: ["Solidity", "Smart Contracts", "Security", "Foundry", "EVM"],
      tags: ["blockchain", "security", "solidity", "defi", "audit"],
      authorId: users[3].id,
    },
    {
      title: "Backend Node.js Developer — Fintech API Platform",
      description: `We are a fintech startup building payment infrastructure for African SMEs and need a solid backend developer to join our team part-time.\n\nTech stack:\n- Node.js + Express / Fastify\n- PostgreSQL with Prisma ORM\n- Redis for caching\n- AWS Lambda for serverless endpoints\n\nYou will build REST API endpoints, write database migrations, set up background jobs, and write integration tests. 20 hrs/week minimum commitment.\n\nPerfect opportunity to gain real production experience while still in school.`,
      type: "PART_TIME", paymentType: "NEGOTIABLE",
      isRemote: true, skills: ["Node.js", "PostgreSQL", "Prisma", "REST APIs", "AWS"],
      tags: ["fintech", "backend", "nodejs", "api", "africa"],
      authorId: users[4].id,
    },
    {
      title: "Content Creator & Technical Writer — Web3 Education",
      description: `Web3 education platform is hiring student content creators who can explain blockchain concepts in simple, relatable language to African student audiences.\n\nYou will:\n- Write tutorials on topics like DeFi, NFTs, wallets, and crypto payments\n- Create short video scripts for YouTube\n- Write Twitter/X thread templates\n- Review and edit community submissions\n\nThis is a volunteer + equity opportunity — you receive tokens when our platform launches. Great CV builder and network access.\n\nRemote, flexible hours. Apply with 2 writing samples.`,
      type: "VOLUNTEER", paymentType: "FREE",
      isRemote: true, skills: ["Technical Writing", "Content Creation", "Blockchain Knowledge"],
      tags: ["content", "writing", "web3", "education", "community"],
      authorId: users[0].id,
    },
    {
      title: "Full-Stack Internship — Climate Tech Startup (Lagos)",
      description: `ClimateTrack Africa is a Lagos-based startup building carbon credit tracking tools for African businesses. We're offering a 4-month full-stack internship for driven students.\n\nYou'll work on:\n- React frontend dashboards for carbon data visualisation\n- Django + PostgreSQL backend for credit reporting\n- Integrations with IoT sensor APIs\n- Contributing to real features used by paying customers\n\nBenefits:\n- Monthly stipend (negotiable)\n- Mentorship from senior engineers\n- Certificate of completion\n- Possible conversion to full-time\n\nHybrid — Lagos Island office 3 days/week.`,
      type: "INTERNSHIP", paymentType: "NEGOTIABLE",
      isRemote: false, location: "Lagos, Nigeria",
      skills: ["React", "Python", "Django", "PostgreSQL", "Data Visualisation"],
      tags: ["climatetech", "internship", "fullstack", "lagos", "impact"],
      authorId: users[1].id,
    },
    {
      title: "Solana Rust Developer — NFT Marketplace",
      description: `Building a student-focused NFT marketplace on Solana and need a Rust developer who understands Anchor framework and Solana program model.\n\nScope:\n- Write and deploy Solana programs using Anchor\n- Implement listing, bidding, and royalty logic\n- Integrate with Metaplex standards\n- Write unit tests for all program instructions\n\nThis is a project-based gig with SOL payment. Timeline: 6 weeks. You'll own the code and be credited on the project.`,
      type: "GIG", paymentType: "CRYPTO", compensationAmount: 2.5,
      compensationCurrency: "ETH", cryptoNetworkChain: "ethereum",
      isRemote: true, skills: ["Rust", "Solana", "Anchor", "Blockchain", "Smart Contracts"],
      tags: ["solana", "rust", "nft", "blockchain", "web3"],
      authorId: users[2].id,
    },
    {
      title: "Data Analyst Intern — Student Financial Behaviour Research",
      description: `University research unit studying how Gen Z students manage money across 5 African countries is looking for a data analyst intern.\n\nYou will:\n- Clean and analyse survey data from 3,000+ students (Python/Pandas)\n- Build interactive dashboards in Tableau or Power BI\n- Run statistical tests and write up findings\n- Co-author a published paper (expected Q3 2025)\n\nThis is a 3-month paid internship with flexible remote hours. A great opportunity if you're interested in behavioural economics, fintech, or academic research.`,
      type: "INTERNSHIP", paymentType: "NEGOTIABLE",
      isRemote: true, skills: ["Python", "Pandas", "Tableau", "Statistics", "Data Analysis"],
      tags: ["data", "research", "finance", "internship", "africa"],
      authorId: users[3].id,
    },
    {
      title: "Mobile App Developer — React Native Health Tracker",
      description: `Early-stage health startup targeting university students is building a mental health and wellness tracking app. Looking for a React Native developer to build the MVP.\n\nFeatures to build:\n- Daily mood tracking with local notifications\n- Sleep and exercise logging\n- Anonymous peer support chat\n- Gamified streaks and achievements\n- Integration with Apple Health / Google Fit\n\nPay: 0.12 ETH (Ethereum mainnet). Flexible timeline over 2 months. You'll be listed as a founding contributor.`,
      type: "GIG", paymentType: "CRYPTO", compensationAmount: 0.12,
      compensationCurrency: "ETH", cryptoNetworkChain: "ethereum",
      isRemote: true, skills: ["React Native", "JavaScript", "Mobile", "Firebase", "TypeScript"],
      tags: ["health", "mobile", "react-native", "startup", "wellness"],
      authorId: users[4].id,
    },
    {
      title: "Open Source Contributor — Pan-African Developer Tools",
      description: `We maintain an open-source suite of developer tools built specifically for African infrastructure constraints — offline-first, low-bandwidth, and affordable SMS integrations.\n\nLooking for contributors to help with:\n- Improving documentation (any language welcome)\n- Writing tests for existing modules\n- Building new adapters for African payment APIs (Paystack, Flutterwave, MTN MoMo)\n- Fixing GitHub issues tagged 'good first issue'\n\nAll contributions are voluntary but you'll be recognised publicly, get a LinkedIn recommendation, and qualify for our community grant programme.`,
      type: "VOLUNTEER", paymentType: "FREE",
      isRemote: true, skills: ["JavaScript", "Node.js", "Open Source", "Documentation", "Testing"],
      tags: ["opensource", "africa", "developer-tools", "community", "volunteer"],
      authorId: users[0].id,
    },
    {
      title: "Graphic Designer — Student Startup Branding Package",
      description: `Student-run food delivery startup at the University of Nairobi needs a complete brand identity package designed from scratch.\n\nDeliverables:\n- Logo (3 concepts, 1 refined)\n- Brand colour palette and typography guide\n- Business card and flyer templates\n- Social media kit (Instagram, Twitter)\n- App icon\n\nBudget: 200 USDC on Polygon. Timeline: 10 days. All files delivered in Figma + exported assets. Perfect for design students building their portfolio.`,
      type: "GIG", paymentType: "CRYPTO", compensationAmount: 200,
      compensationCurrency: "USDC", cryptoNetworkChain: "polygon",
      isRemote: true, skills: ["Graphic Design", "Branding", "Figma", "Illustration", "Typography"],
      tags: ["design", "branding", "startup", "nairobi", "creative"],
      authorId: users[1].id,
    },
  ];

  let created = 0;
  for (const opp of opps) {
    await prisma.opportunity.create({ data: opp as any });
    created++;
  }

  console.log(`✅ Created ${created} opportunities`);
  console.log("\n🎉 Seed complete!");
  console.log("📧 Demo login: amara@unilag.edu.ng / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
