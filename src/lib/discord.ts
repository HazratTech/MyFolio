const DISCORD_WEBHOOK_URL = process.env.DISCORD_ADMIN_WEBHOOK_URL;

interface WebhookPayload {
    email: string;
    name?: string;
    picture?: string;
    success: boolean;
    ip?: string;
}

export async function sendDiscordWebhook({ email, name, picture, success, ip }: WebhookPayload) {
    if (!DISCORD_WEBHOOK_URL) return;

    const color = success ? 0x00ff00 : 0xff0000; // Green for success, Red for failure
    const title = success ? "✅ Admin Login Successful" : "⛔ Unauthorized Login Attempt";

    const embed = {
        title: title,
        color: color,
        timestamp: new Date().toISOString(),
        thumbnail: picture ? { url: picture } : undefined,
        fields: [
            {
                name: "User",
                value: `${name || 'Unknown'} (${email})`,
                inline: true
            },
            {
                name: "Status",
                value: success ? "Granted" : "Denied",
                inline: true
            },
            {
                name: "IP Address",
                value: ip || "Unknown",
                inline: false
            }
        ],
        footer: {
            text: "MyFolio Admin Security"
        }
    };

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                embeds: [embed],
            }),
        });
    } catch (error) {
        console.error("Failed to send Discord webhook:", error);
    }
}

export async function sendCronFailureNotification(error: any) {
    if (!DISCORD_WEBHOOK_URL) return;
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error && error.stack ? error.stack : "";
    
    const embed: any = {
        title: "🚨 Auto-Blog Cron Job Failed",
        description: "The automated blog posting pipeline failed to complete.",
        color: 0xff0000, // Red
        timestamp: new Date().toISOString(),
        fields: [
            {
                name: "Error Message",
                value: `\`\`\`\n${errorMessage.slice(0, 1000)}\n\`\`\``,
                inline: false
            }
        ],
        footer: {
            text: "MyFolio Cron Alert System"
        }
    };

    if (errorStack) {
        embed.fields.push({
            name: "Stack Trace",
            value: `\`\`\`\n${errorStack.slice(0, 1000)}\n\`\`\``,
            inline: false
        });
    }

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: "<@475357995367137282> The auto-blog cron job has failed.",
                embeds: [embed]
            })
        });
    } catch (err) {
        console.error("Failed to send Discord cron error webhook:", err);
    }
}

export interface SocialMediaContent {
    twitter: string;
    linkedin: string;
    facebook: string;
}

export async function sendSocialMediaWebhook(
    content: SocialMediaContent,
    postTitle: string,
    postUrl: string,
    coverImage: string | null
) {
    const webhookUrl = process.env.DISCORD_POST_WEBHOOK;
    if (!webhookUrl) {
        console.warn("DISCORD_POST_WEBHOOK is not set, skipping social media broadcast.");
        return;
    }

    const embeds = [
        {
            title: "🐦 Twitter Post",
            description: `\`\`\`text\n${content.twitter}\n\`\`\`\n**Length:** ${content.twitter.length}/280 chars`,
            color: 0x1DA1F2,
            url: postUrl
        },
        {
            title: "💼 LinkedIn Post",
            description: `\`\`\`text\n${content.linkedin}\n\`\`\``,
            color: 0x0A66C2,
            url: postUrl
        },
        {
            title: "📘 Facebook Post",
            description: `\`\`\`text\n${content.facebook}\n\`\`\``,
            color: 0x1877F2,
            url: postUrl,
            image: coverImage ? { url: coverImage } : undefined
        }
    ];

    try {
        await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: `🚀 **New Blog Generated!** Here are your social media drafts for:\n**${postTitle}**\n${postUrl}`,
                embeds: embeds
            })
        });
    } catch (err) {
        console.error("Failed to send social media Discord webhook:", err);
    }
}
