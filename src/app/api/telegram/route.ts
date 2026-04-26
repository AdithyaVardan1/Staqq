import { NextRequest, NextResponse } from 'next/server';
import { Bot, InlineKeyboard } from 'grammy';
import { createAdminClient } from '@/utils/supabase/admin';

// Singleton -- reused across warm serverless invocations
let bot: Bot | null = null;
let initPromise: Promise<void> | null = null;

function getBot(): { bot: Bot; ready: Promise<void> } {
    if (!bot) {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set');

        bot = new Bot(token);
        registerHandlers(bot);
        initPromise = bot.init();
    }
    return { bot, ready: initPromise! };
}

function registerHandlers(b: Bot) {
    b.command('start', async (ctx) => {
        if (!ctx.from) return;
        const { id, username, first_name } = ctx.from;

        try {
            const supabase = createAdminClient();
            const { error } = await supabase
                .from('bot_users')
                .upsert(
                    { telegram_id: id, username: username ?? null, first_name: first_name ?? null },
                    { onConflict: 'telegram_id' }
                );
            if (error) console.error('[Bot] Failed to save user', id, error.message);
        } catch (e) {
            console.error('[Bot] DB unavailable, continuing without save:', e);
        }

        const name = first_name ?? 'there';
        const keyboard = new InlineKeyboard()
            .url('Learn more', 'https://staqq.in/alerts')
            .row()
            .url('Indian IPO GMP', 'https://staqq.in/ipo');

        await ctx.reply(
            `Hey ${name}! You are on the Staqq Alert Bot early access list.\n\n` +
            `What is coming:\n` +
            `• Real-time Solana new token pair alerts\n` +
            `• Multi-layer rug scoring on every token\n` +
            `• 5-15 quality alerts per day, not 200+ noise\n` +
            `• Alert fires within 60 seconds of pair creation\n\n` +
            `We will ping you right here the moment we go live. Stay sharp.`,
            { reply_markup: keyboard }
        );
    });

    b.command('status', async (ctx) => {
        await ctx.reply(
            `Staqq Alert Bot is in pre-launch.\n\n` +
            `You are on the early access list and will be notified here when we go live.\n\n` +
            `In the meantime, check out our Indian market tools at staqq.in`
        );
    });

    b.command('help', async (ctx) => {
        await ctx.reply(
            `Staqq Alert Bot commands:\n\n` +
            `/start - Join the early access list\n` +
            `/status - Check launch status\n` +
            `/help - Show this message`
        );
    });

    b.on('message', async (ctx) => {
        await ctx.reply(
            `The bot is not live yet, but you are on the list.\n\n` +
            `We will alert you here the moment Staqq Alert Bot launches.`
        );
    });

    b.catch((err) => {
        console.error('[Bot error]', err.ctx?.update?.update_id, err.error);
    });
}

export async function POST(req: NextRequest) {
    // Reject requests that don't carry the webhook secret Telegram was registered with.
    // Set TELEGRAM_WEBHOOK_SECRET to any random string (e.g. openssl rand -hex 32).
    const secret = req.headers.get('x-telegram-bot-api-secret-token');
    if (!secret || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    try {
        const { bot: b, ready } = getBot();
        await ready;
        const body = await req.json();
        await b.handleUpdate(body);
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[Telegram webhook]', err);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
