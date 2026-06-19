const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key.trim()] = val.join('=').trim();
    return acc;
}, {});
const DISCORD_WEBHOOK_URL = env.DISCORD_ADMIN_WEBHOOK_URL;

async function test() {
    console.log("Testing Discord Failure Webhook...");
    console.log("Webhook URL:", DISCORD_WEBHOOK_URL ? "Loaded" : "Not Found");
    if (!DISCORD_WEBHOOK_URL) {
        console.error("No webhook URL configured");
        process.exit(1);
    }

    const embed = {
        title: "🚨 Test: Auto-Blog Cron Job Failed",
        description: "This is a test notification verifying the cron job failure alerting system.",
        color: 0xff0000,
        timestamp: new Date().toISOString(),
        fields: [
            {
                name: "Error Message",
                value: "```\nTest Error: Verified webhook integration successfully.\n```",
                inline: false
            }
        ],
        footer: {
            text: "MyFolio Cron Alert System"
        }
    };

    const res = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: "<@475357995367137282> Test: The auto-blog cron job has failed.",
            embeds: [embed]
        })
    });

    if (res.ok) {
        console.log("✅ Success! Webhook message sent to Discord.");
    } else {
        console.error("❌ Failed to send webhook:", res.status, await res.text());
    }
}
test().catch(console.error);
