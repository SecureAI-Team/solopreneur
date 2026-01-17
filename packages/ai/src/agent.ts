
import { StateGraph, END } from "@langchain/langgraph";
import { HumanMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

// Define the state interface
interface AgentState {
    messages: BaseMessage[];
    critique?: string;
    complianceChecked: boolean;
    complianceIssues?: string[];
    revisionCount: number;
}

// Initialize the model (using Aliyun Qwen via OpenAI compatible endpoint)
const model = new ChatOpenAI({
    modelName: "qwen-max", // Aliyun Qwen-Max
    openAIApiKey: process.env.DASHSCOPE_API_KEY || "dummy", // Use env directly
    configuration: {
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    },
    temperature: 0.7,
});

// --- Node Functions ---

// 1. Writer Node: Generates or revises content
async function writerNode(state: AgentState): Promise<Partial<AgentState>> {
    const { messages, critique, complianceIssues } = state;
    let prompt = "You are an expert social media content creator.";

    if (critique) {
        prompt += `\n\nPrevious draft received this critique:\n${critique}\n\nPlease revise the content to address these points.`;
    }

    if (complianceIssues && complianceIssues.length > 0) {
        prompt += `\n\nCRITICAL COMPLIANCE ISSUES FOUND:\n- ${complianceIssues.join("\n- ")}\n\nYou MUST fix these immediately to avoid account bans.`;
    }

    const response = await model.invoke([
        new SystemMessage(prompt),
        ...messages
    ]);

    return {
        messages: [...messages, response],
        revisionCount: state.revisionCount + 1
    };
}

// 2. Critic Node: Evaluates quality and platform fit
async function criticNode(state: AgentState): Promise<Partial<AgentState>> {
    const lastMessage = state.messages[state.messages.length - 1];
    const content = lastMessage.content;

    const response = await model.invoke([
        new SystemMessage("You are a senior content editor. Critique the following social media post for engagement, platform fit, and clarity. If it is excellent (>95/100), reply with 'APPROVE'. Otherwise, list specific actionable improvements."),
        new HumanMessage(content as string)
    ]);

    const critique = response.content as string;
    return { critique };
}

// 3. Compliance Node: Checks against TOS
async function complianceNode(state: AgentState): Promise<Partial<AgentState>> {
    const lastMessage = state.messages[state.messages.length - 1];
    const content = lastMessage.content;

    const response = await model.invoke([
        new SystemMessage("You are a strict Compliance Officer. Check the following content for prohibited keywords, medical claims, or engagement bait. If safe, reply 'SAFE'. If issues found, list them clearly."),
        new HumanMessage(content as string)
    ]);

    const result = response.content as string;
    const isSafe = result.includes("SAFE");

    return {
        complianceChecked: true,
        complianceIssues: isSafe ? [] : [result]
    };
}

// --- Conditional Logic ---

function shouldContinue(state: AgentState) {
    const { critique, complianceIssues, revisionCount } = state;

    if (revisionCount > 3) {
        return "end"; // Force stop after 3 revisions to prevent loops
    }

    const hasComplianceIssues = complianceIssues && complianceIssues.length > 0;
    const isApproved = critique?.includes("APPROVE");

    if (hasComplianceIssues) {
        return "writer"; // Go back to writer to fix compliance
    }

    if (!isApproved) {
        return "writer"; // Go back to writer to improve quality
    }

    return "end";
}

// --- Graph Definition ---

const workflow = new StateGraph<AgentState>({
    channels: {
        messages: {
            reducer: (a: BaseMessage[], b: BaseMessage[]) => a.concat(b),
            default: () => [],
        },
        critique: {
            reducer: (a: string | undefined, b: string | undefined) => b,
            default: () => undefined,
        },
        complianceChecked: {
            reducer: (a: boolean, b: boolean) => b,
            default: () => false,
        },
        complianceIssues: {
            reducer: (a: string[] | undefined, b: string[] | undefined) => b,
            default: () => [],
        },
        revisionCount: {
            reducer: (a: number, b: number) => b,
            default: () => 0,
        }
    }
})
    .addNode("writer", writerNode)
    .addNode("critic", criticNode)
    .addNode("compliance", complianceNode)

    .addEdge("writer", "compliance") // Check compliance first
    .addEdge("compliance", "critic") // Then check quality
    .addConditionalEdges("critic", shouldContinue, {
        writer: "writer",
        end: END
    });

workflow.setEntryPoint("writer");

export const contentAgent = workflow.compile();

// User context interface for personalization
export interface UserContext {
    niche?: string;
    audience?: string;
    style?: string;
    contentDNA?: {
        persona?: string;
        visualStyle?: string;
        voice?: string;
        bio?: string;
    };
    // Learned patterns from user's past content
    learnedPatterns?: {
        keywords?: string[];
        tone?: string;
        emojiStyle?: string;
        hookPatterns?: string[];
        avgLength?: number;
    };
}

export async function runContentAgent(
    topic: string,
    platform: string,
    userContext?: UserContext
) {
    // Build personalized system context
    let contextPrompt = "";

    if (userContext) {
        contextPrompt = `\n\n--- USER CONTEXT ---`;
        if (userContext.niche) {
            contextPrompt += `\nNiche: ${userContext.niche}`;
        }
        if (userContext.audience) {
            contextPrompt += `\nTarget Audience: ${userContext.audience}`;
        }
        if (userContext.style) {
            contextPrompt += `\nContent Style: ${userContext.style}`;
        }
        if (userContext.contentDNA) {
            const dna = userContext.contentDNA;
            if (dna.persona) contextPrompt += `\nPersona: ${dna.persona}`;
            if (dna.voice) contextPrompt += `\nVoice/Tone: ${dna.voice}`;
        }
        if (userContext.learnedPatterns) {
            const patterns = userContext.learnedPatterns;
            contextPrompt += `\n\n--- LEARNED FROM USER'S PAST CONTENT ---`;
            if (patterns.keywords?.length) {
                contextPrompt += `\nFrequent Keywords: ${patterns.keywords.slice(0, 10).join(', ')}`;
            }
            if (patterns.hookPatterns?.length) {
                contextPrompt += `\nSuccessful Hook Patterns: ${patterns.hookPatterns.slice(0, 3).join('; ')}`;
            }
            if (patterns.tone) {
                contextPrompt += `\nPreferred Tone: ${patterns.tone}`;
            }
            if (patterns.emojiStyle) {
                contextPrompt += `\nEmoji Style: ${patterns.emojiStyle}`;
            }
        }
        contextPrompt += `\n--- END CONTEXT ---\n\nUse this context to write content that matches the user's established style and resonates with their audience.`;
    }

    const input: AgentState = {
        messages: [new HumanMessage(
            `Write a viral ${platform} post about: ${topic}${contextPrompt}`
        )],
        revisionCount: 0,
        complianceChecked: false,
        complianceIssues: []
    };

    const finalState = await contentAgent.invoke(input as any);

    // Explicitly cast or access safely
    const messages = finalState.messages as BaseMessage[];
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content;
}
