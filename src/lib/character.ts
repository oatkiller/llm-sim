export const CHARACTER_TEMPLATES = {
  detective: {
    name: "Sherlock Holmes",
    traits: ["observant", "analytical", "deductive"],
    background: "A brilliant detective with a keen eye for detail and a sharp mind for solving mysteries.",
    prompt: `Create a character inspired by Sherlock Holmes. They should be:
- Highly observant and analytical
- Possess exceptional deductive reasoning skills
- Have a unique personality that balances brilliance with social awkwardness
- Be driven by a strong sense of justice and intellectual challenge

Describe their appearance, mannerisms, and key personality traits.`
  },
  scientist: {
    name: "Dr. Victor Frankenstein",
    traits: ["brilliant", "ambitious", "troubled"],
    background: "A brilliant but troubled scientist pushing the boundaries of what's possible.",
    prompt: `Create a character inspired by Dr. Frankenstein. They should be:
- Exceptionally intelligent and driven by scientific discovery
- Grappling with the ethical implications of their work
- Possess both brilliance and hubris
- Be haunted by the consequences of their actions

Describe their appearance, mannerisms, and key personality traits.`
  }
};

export const generateCharacterPrompt = (template: keyof typeof CHARACTER_TEMPLATES) => {
  return CHARACTER_TEMPLATES[template].prompt;
};

export const parseCharacterResponse = (response: string) => {
  // Basic parsing - in a real app, you'd want more robust parsing
  const lines = response.split('\n').filter(line => line.trim());
  const name = lines[0]?.split(':')[1]?.trim() || 'Unknown';
  const traits = lines
    .filter(line => line.toLowerCase().includes('trait'))
    .map(line => line.split(':')[1]?.trim())
    .filter(Boolean);
  const background = lines
    .filter(line => line.toLowerCase().includes('background'))
    .map(line => line.split(':')[1]?.trim())
    .join(' ');

  return {
    name,
    traits,
    background
  };
}; 