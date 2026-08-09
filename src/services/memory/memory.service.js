const { UserMemory } = require('../../models');

const toKey = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const extractMemoryCandidates = (text) => {
  const candidates = [];
  const interestMatch = text.match(/\b(?:i am|i'm) interested in\s+([^.!?]{2,100})/i);
  if (interestMatch) {
    const value = interestMatch[1].trim();
    candidates.push({ memoryType: 'interest', memoryKey: toKey(value), memoryValue: value, confidence: 0.9 });
  }

  const briefingMatch = text.match(/\b(?:i prefer|send me)\s+([^.!?]{2,100}\bbriefings?)/i);
  if (briefingMatch) {
    const value = briefingMatch[1].trim();
    candidates.push({ memoryType: 'briefing_preference', memoryKey: toKey(value), memoryValue: value, confidence: 0.85 });
  }

  const trackingMatches = text.matchAll(/\b(?:track|follow)\s+([^.!?]{2,100}?)(?:\s+for me)?(?=[.!?]|$)/gi);
  for (const trackingMatch of trackingMatches) {
    trackingMatch[1]
      .split(/,|\band\b/i)
      .map((value) => value.trim())
      .filter((value) => value.length >= 2 && value.length <= 60 && !/^up\b/i.test(value))
      .forEach((value) => {
        candidates.push({ memoryType: 'company_interest', memoryKey: toKey(value), memoryValue: value, confidence: 0.75 });
      });
  }

  return candidates.filter((candidate) => candidate.memoryKey);
};

const storeMemory = async (userId, memory) => {
  const [record, created] = await UserMemory.findOrCreate({
    where: { userId, memoryType: memory.memoryType, memoryKey: memory.memoryKey },
    defaults: { userId, ...memory },
  });

  if (!created) await record.update({ memoryValue: memory.memoryValue, confidence: memory.confidence });
  return record;
};

const extractAndStoreMemories = async (userId, text) => {
  const candidates = extractMemoryCandidates(text);
  return Promise.all(candidates.map((memory) => storeMemory(userId, memory)));
};

const getUserMemories = (userId) =>
  UserMemory.findAll({
    where: { userId },
    order: [['updatedAt', 'DESC']],
    limit: 20,
  });

module.exports = { extractMemoryCandidates, extractAndStoreMemories, getUserMemories };
