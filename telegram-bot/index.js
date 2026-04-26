import { Bot, InlineKeyboard } from 'grammy';
import { createClient } from '@supabase/supabase-js';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Save user to waitlist on /start
async function saveUser(ctx) {
    const { id, username, first_name } = ctx.from;
    await supabase
        .from('bot_users')
        .upsert(
            { telegram_id: id, username: username ?? null, first_name: first_name ?? null, started_at: new Date().toISOString() },
            { onConflict: 'telegram_id' }
        );
}

bot.command('start', async (ctx) => {
    await saveUser(ctx);

    const name = ctx.from.first_name ?? 'there';

    const keyboard = new InlineKeyboard()
        .url('staqq.in/alerts', 'https://staqq.in/alerts')
        .row()
        .url('View Indian IPO GMP', 'https://staqq.in/ipo');

    await ctx.reply(
        `Hey ${name}! You are on the Staqq Alert Bot early access list.\n\n` +
        `Here is what is coming:\n` +
        `• Real-time Solana new token pair alerts\n` +
        `• Multi-layer rug scoring on every token\n` +
        `• 5-15 quality alerts per day — not 200+ spam\n` +
        `• Alert fires within 60 seconds of pair creation\n\n` +
        `We will ping you right here the moment we go live. Stay sharp.`,
        { reply_markup: keyboard }
    );
});

bot.command('status', async (ctx) => {
    await ctx.reply(
        `Staqq Alert Bot is in pre-launch.\n\n` +
        `You are on the early access list and will be notified here when we go live.\n\n` +
        `In the meantime, check out our Indian market tools at staqq.in`
    );
});

bot.command('help', async (ctx) => {
    await ctx.reply(
        `Staqq Alert Bot commands:\n\n` +
        `/start - Join the early access list\n` +
        `/status - Check launch status\n` +
        `/help - Show this message`
    );
});

// Catch-all for any other message before launch
bot.on('message', async (ctx) => {
    await ctx.reply(
        `The bot is not live yet, but you are on the list.\n\n` +
        `We will alert you here the moment Staqq Alert Bot launches. Use /help to see available commands.`
    );
});

bot.catch((err) => {
    console.error('[Bot error]', err);
});

bot.start();
console.log('Staqq Bot running...');
