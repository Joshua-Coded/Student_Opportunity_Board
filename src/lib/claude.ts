import Anthropic from "@anthropic-ai/sdk";

export async function generateCoverLetter(data: {
  opportunityTitle: string;
  opportunityType: string;
  opportunityDescription: string;
  applicantName: string;
  applicantUniversity?: string;
  applicantMajor?: string;
}) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Write a concise, personalized cover letter for a student applying to this opportunity.

Opportunity: ${data.opportunityTitle} (${data.opportunityType})
Description: ${data.opportunityDescription.slice(0, 600)}

Applicant: ${data.applicantName}${data.applicantUniversity ? `, ${data.applicantUniversity}` : ""}${data.applicantMajor ? `, studying ${data.applicantMajor}` : ""}

Write 3 short paragraphs: (1) introduction and why interested, (2) relevant skills/experience, (3) closing. Keep it under 200 words. Use a professional but approachable tone. Do NOT include placeholders like [Your Name] — use the actual name provided. Return only the cover letter text.`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text");
  return text?.type === "text" ? text.text : null;
}

export async function enhanceOpportunityListing(raw: {
  title: string;
  description: string;
  type: string;
  skills: string[];
}) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    tools: [
      {
        name: "enhance_listing",
        description:
          "Improve a student opportunity listing with better clarity and structured output.",
        input_schema: {
          type: "object" as const,
          properties: {
            improvedTitle: { type: "string" },
            improvedDescription: { type: "string" },
            summary: { type: "string", description: "2-sentence summary for preview cards" },
            suggestedTags: { type: "array", items: { type: "string" } },
            suggestedSkills: { type: "array", items: { type: "string" } },
          },
          required: ["improvedTitle", "improvedDescription", "summary"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "enhance_listing" },
    messages: [
      {
        role: "user",
        content: `Enhance this student opportunity listing:\n\nTitle: ${raw.title}\nType: ${raw.type}\nSkills: ${raw.skills.join(", ")}\n\nDescription:\n${raw.description}`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (toolUse?.type === "tool_use") {
    return toolUse.input as {
      improvedTitle: string;
      improvedDescription: string;
      summary: string;
      suggestedTags?: string[];
      suggestedSkills?: string[];
    };
  }
  return null;
}
