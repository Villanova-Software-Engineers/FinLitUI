// Money Personality Types and Quiz Data

export interface MoneyPersonalityType {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  strengths: string[];
  challenges: string[];
  tips: string[];
  color: string; // Tailwind gradient
  bgColor: string; // Light background
}

export interface PersonalityQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    scores: { [personalityId: string]: number };
  }[];
}

// Six Money Personality Types
export const MONEY_PERSONALITIES: MoneyPersonalityType[] = [
  {
    id: 'saver',
    name: 'The Saver',
    emoji: '🐿️',
    tagline: 'Security is your superpower',
    description: 'You find comfort in watching your savings grow and always prioritize putting money aside for the future. You\'re disciplined with your finances and rarely make impulsive purchases.',
    strengths: [
      'Strong financial discipline and self-control',
      'Prepared for emergencies and unexpected expenses',
      'Low debt and financial stress',
      'Excellent at reaching long-term financial goals',
    ],
    challenges: [
      'May miss out on enjoyable experiences due to over-saving',
      'Can be overly anxious about spending even necessary amounts',
      'Might not take advantage of good investment opportunities',
      'Risk of becoming too frugal and affecting quality of life',
    ],
    tips: [
      'Create a "fun money" budget category you allow yourself to spend guilt-free',
      'Consider investing more aggressively to grow your savings faster',
      'Remember that some experiences are worth the money',
      'Set specific savings goals to know when "enough" is enough',
    ],
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 'spender',
    name: 'The Spender',
    emoji: '🛍️',
    tagline: 'Life is meant to be enjoyed',
    description: 'You believe money is meant to be enjoyed. You love treating yourself and others, and you\'re generous with your resources. Living in the moment is important to you.',
    strengths: [
      'Generous and enjoys sharing with others',
      'Creates memorable experiences and moments',
      'Good at enjoying the present moment',
      'Often has high quality items that last',
    ],
    challenges: [
      'May struggle with saving for emergencies',
      'Can accumulate credit card debt easily',
      'Difficulty delaying gratification for bigger goals',
      'May feel financial stress between paychecks',
    ],
    tips: [
      'Set up automatic transfers to savings before you can spend',
      'Wait 24-48 hours before making purchases over $50',
      'Track your spending for one month to understand patterns',
      'Find free or low-cost activities that bring you joy',
    ],
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
  },
  {
    id: 'investor',
    name: 'The Investor',
    emoji: '📈',
    tagline: 'Your money should work for you',
    description: 'You see money as a tool for building wealth. You\'re always looking for ways to grow your assets and are comfortable with calculated risks. The stock market excites rather than scares you.',
    strengths: [
      'Understands the power of compound growth',
      'Comfortable making financial decisions',
      'Likely to build significant long-term wealth',
      'Proactive about financial planning',
    ],
    challenges: [
      'May take on too much risk at times',
      'Can become obsessed with market movements',
      'Might neglect enjoying money in the present',
      'Risk of overconfidence in investment decisions',
    ],
    tips: [
      'Diversify investments to manage risk appropriately',
      'Don\'t check your portfolio too frequently',
      'Balance investing with enjoying life today',
      'Keep an emergency fund in cash, not invested',
    ],
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'debtor',
    name: 'The Debtor',
    emoji: '💳',
    tagline: 'Breaking free from the debt cycle',
    description: 'You often find yourself in debt, whether from lifestyle choices, circumstances, or a combination of both. You may feel overwhelmed by bills and struggle to get ahead financially.',
    strengths: [
      'Resilient and adaptable in tough situations',
      'Understands the true cost of borrowing',
      'Motivated to make positive changes',
      'Resourceful at finding ways to manage',
    ],
    challenges: [
      'Interest payments drain your income',
      'Stress and anxiety about money',
      'Difficulty building savings or investments',
      'May feel trapped in a cycle',
    ],
    tips: [
      'List all debts and focus on one at a time (debt snowball or avalanche)',
      'Avoid taking on any new debt while paying off existing',
      'Build a small emergency fund ($500-1000) to avoid new debt',
      'Consider speaking with a financial counselor for support',
    ],
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'avoider',
    name: 'The Avoider',
    emoji: '🙈',
    tagline: 'Money management in progress',
    description: 'You prefer not to think about money and financial matters. Bills might pile up, and checking your bank account feels stressful. You believe things will work out somehow.',
    strengths: [
      'Generally low stress about day-to-day money decisions',
      'Trusting and optimistic outlook',
      'Open to learning once engaged',
      'Not materialistic or status-driven',
    ],
    challenges: [
      'May miss important financial deadlines',
      'Late fees and penalties can add up',
      'Unclear picture of actual financial situation',
      'Missed opportunities for growth and savings',
    ],
    tips: [
      'Set up automatic bill payments to avoid late fees',
      'Schedule just 15 minutes weekly to check your finances',
      'Use budgeting apps that make tracking simple',
      'Start with one small financial goal to build confidence',
    ],
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'planner',
    name: 'The Planner',
    emoji: '📊',
    tagline: 'Every dollar has a purpose',
    description: 'You love spreadsheets, budgets, and financial plans. Every dollar is accounted for, and you feel most comfortable when you have a clear financial roadmap for the future.',
    strengths: [
      'Excellent financial organization and tracking',
      'Clear understanding of where money goes',
      'Prepared for both short and long-term goals',
      'Makes informed financial decisions',
    ],
    challenges: [
      'Can be inflexible when plans change',
      'May cause stress for family members with different styles',
      'Might over-analyze simple financial decisions',
      'Can miss spontaneous opportunities',
    ],
    tips: [
      'Build flexibility into your budget for unexpected opportunities',
      'Accept that not everything can be perfectly planned',
      'Find balance between planning and living in the moment',
      'Be patient with others who have different money styles',
    ],
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50',
  },
];

// Quiz Questions - Each answer contributes to different personality scores
export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  {
    id: 1,
    question: 'You receive an unexpected $500. What\'s your first instinct?',
    options: [
      { text: 'Put it straight into savings', scores: { saver: 3, planner: 1 } },
      { text: 'Treat yourself to something nice', scores: { spender: 3 } },
      { text: 'Invest it in stocks or crypto', scores: { investor: 3 } },
      { text: 'Pay off some debt', scores: { debtor: 2, planner: 1 } },
      { text: 'I\'m not sure, probably leave it in checking', scores: { avoider: 3 } },
    ],
  },
  {
    id: 2,
    question: 'How do you feel when checking your bank account?',
    options: [
      { text: 'Satisfied - I love seeing my savings grow', scores: { saver: 3 } },
      { text: 'Anxious - I prefer not to look', scores: { avoider: 3 } },
      { text: 'Excited to see investment returns', scores: { investor: 3 } },
      { text: 'Stressed - there\'s always bills to pay', scores: { debtor: 3 } },
      { text: 'Neutral - it\'s just a number', scores: { spender: 1, planner: 2 } },
    ],
  },
  {
    id: 3,
    question: 'Your friend invites you on a last-minute weekend trip. What do you do?',
    options: [
      { text: 'Say yes immediately - experiences matter!', scores: { spender: 3 } },
      { text: 'Check my budget first to see if I can afford it', scores: { planner: 3 } },
      { text: 'Probably decline - I\'d rather save that money', scores: { saver: 3 } },
      { text: 'Can\'t go - I need that money for bills', scores: { debtor: 2 } },
      { text: 'Avoid the conversation entirely', scores: { avoider: 2 } },
    ],
  },
  {
    id: 4,
    question: 'How often do you check stock prices or investment news?',
    options: [
      { text: 'Multiple times a day - I love following markets', scores: { investor: 3 } },
      { text: 'Weekly when I review my finances', scores: { planner: 2, investor: 1 } },
      { text: 'Rarely - I just let my savings sit', scores: { saver: 2 } },
      { text: 'Never - I don\'t have investments', scores: { avoider: 2, debtor: 1 } },
      { text: 'Only when I hear big news', scores: { spender: 1 } },
    ],
  },
  {
    id: 5,
    question: 'How would you describe your current debt situation?',
    options: [
      { text: 'No debt - I avoid it at all costs', scores: { saver: 3 } },
      { text: 'I have some debt but it\'s planned (mortgage, student loans)', scores: { planner: 2, investor: 1 } },
      { text: 'I have credit card debt that stresses me out', scores: { debtor: 3 } },
      { text: 'I honestly don\'t know my exact debt', scores: { avoider: 3 } },
      { text: 'Some debt, but I focus on enjoying life', scores: { spender: 2 } },
    ],
  },
  {
    id: 6,
    question: 'When making a major purchase, you typically:',
    options: [
      { text: 'Research extensively and compare all options', scores: { planner: 3, saver: 1 } },
      { text: 'Buy what feels right in the moment', scores: { spender: 3 } },
      { text: 'Calculate the opportunity cost of not investing that money', scores: { investor: 3 } },
      { text: 'Worry about how to pay for it', scores: { debtor: 2 } },
      { text: 'Put off the decision as long as possible', scores: { avoider: 2 } },
    ],
  },
  {
    id: 7,
    question: 'How do you feel about taking financial risks?',
    options: [
      { text: 'Love it - high risk, high reward!', scores: { investor: 3, spender: 1 } },
      { text: 'Comfortable with calculated, researched risks', scores: { investor: 2, planner: 2 } },
      { text: 'Prefer to play it safe with my money', scores: { saver: 3 } },
      { text: 'Can\'t afford to take risks right now', scores: { debtor: 2 } },
      { text: 'I try not to think about it', scores: { avoider: 3 } },
    ],
  },
  {
    id: 8,
    question: 'What\'s your approach to budgeting?',
    options: [
      { text: 'Detailed spreadsheet tracking every expense', scores: { planner: 3 } },
      { text: 'General idea but no strict budget', scores: { spender: 2, investor: 1 } },
      { text: 'I mainly focus on saving a set amount', scores: { saver: 3 } },
      { text: 'I try but it\'s hard to stick to', scores: { debtor: 2, avoider: 1 } },
      { text: 'I don\'t really budget', scores: { avoider: 3 } },
    ],
  },
  {
    id: 9,
    question: 'How do you typically handle financial stress?',
    options: [
      { text: 'Make a plan and take action', scores: { planner: 3 } },
      { text: 'Save more aggressively', scores: { saver: 3 } },
      { text: 'Look for ways to earn or invest more', scores: { investor: 2 } },
      { text: 'Try not to think about it', scores: { avoider: 3 } },
      { text: 'Spend money to feel better', scores: { spender: 2, debtor: 1 } },
    ],
  },
  {
    id: 10,
    question: 'What motivates you most about money?',
    options: [
      { text: 'Security and peace of mind', scores: { saver: 3 } },
      { text: 'Freedom to enjoy life\'s pleasures', scores: { spender: 3 } },
      { text: 'Building wealth and financial independence', scores: { investor: 3 } },
      { text: 'Getting out of debt', scores: { debtor: 3 } },
      { text: 'Having a clear financial plan', scores: { planner: 3 } },
      { text: 'I don\'t think about money that way', scores: { avoider: 2 } },
    ],
  },
  {
    id: 11,
    question: 'When you see something you want but don\'t need:',
    options: [
      { text: 'Buy it - you only live once!', scores: { spender: 3 } },
      { text: 'Walk away - savings come first', scores: { saver: 3 } },
      { text: 'Calculate if that money could grow more invested', scores: { investor: 2, planner: 1 } },
      { text: 'Add it to a wishlist and wait', scores: { planner: 3 } },
      { text: 'Feel guilty either way', scores: { debtor: 2 } },
    ],
  },
  {
    id: 12,
    question: 'How do you feel about discussing money with others?',
    options: [
      { text: 'Love it - I enjoy sharing tips and strategies', scores: { planner: 2, investor: 2 } },
      { text: 'Comfortable if it\'s about deals or saving money', scores: { saver: 2 } },
      { text: 'Fine if it\'s about fun purchases or experiences', scores: { spender: 2 } },
      { text: 'Uncomfortable - it\'s too personal', scores: { avoider: 3 } },
      { text: 'Embarrassed - I\'m not in a good place financially', scores: { debtor: 3 } },
    ],
  },
];

// Calculate personality results from quiz answers
export function calculatePersonality(answers: number[]): {
  primary: MoneyPersonalityType;
  secondary: MoneyPersonalityType | null;
  scores: { [personalityId: string]: number };
} {
  const scores: { [personalityId: string]: number } = {
    saver: 0,
    spender: 0,
    investor: 0,
    debtor: 0,
    avoider: 0,
    planner: 0,
  };

  // Calculate scores from answers
  answers.forEach((answerIndex, questionIndex) => {
    const question = PERSONALITY_QUESTIONS[questionIndex];
    if (question && question.options[answerIndex]) {
      const optionScores = question.options[answerIndex].scores;
      Object.entries(optionScores).forEach(([personalityId, score]) => {
        scores[personalityId] = (scores[personalityId] || 0) + score;
      });
    }
  });

  // Sort personalities by score
  const sortedPersonalities = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => MONEY_PERSONALITIES.find(p => p.id === id)!);

  const primary = sortedPersonalities[0];
  const secondary = sortedPersonalities[1];

  // Only show secondary if it's close to primary (within 30%)
  const showSecondary = scores[secondary.id] >= scores[primary.id] * 0.7;

  return {
    primary,
    secondary: showSecondary ? secondary : null,
    scores,
  };
}

// Get personality by ID
export function getPersonalityById(id: string): MoneyPersonalityType | undefined {
  return MONEY_PERSONALITIES.find(p => p.id === id);
}
