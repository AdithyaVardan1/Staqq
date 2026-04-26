import { NextRequest, NextResponse } from 'next/server';
import { Bot, InlineKeyboard, webhookCallback } from 'grammy';
import { createAdminClient } from '@/utils/supabase/admin';

function makeBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set');

    const bot = new Bot(token);

    bot.command('start', async (ctx) => {
        const { id, username, first_name } = ctx.from!;

        // Save to bot_users table (create this in Supabase)
        const supabase = createAdminClient();
        await supabase.from('bot_users').upsert(
            { telegram_id: id, username: username ?? null, first_name: first_name ?? null },
            { onConflict: 'telegram_id' }
        );

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

    bot.on('message', async (ctx) => {
        await ctx.reply(
            `The bot is not live yet, but you are on the list.\n\n` +
            `We will alert you here the moment Staqq Alert Bot launches.`
        );
    });

    return bot;
}

export async function POST(req: NextRequest) {
    try {
        const handleUpdate = webhookCallback(makeBot(), 'std/http');
        return await handleUpdate(req);
    } catch (err) {
        console.error('[Telegram webhook]', err);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
