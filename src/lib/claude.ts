import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function enhanceOpportunityListing(raw: {
  title: string;
  description: string;
  type: string;
  skills: string[];
}) {
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
