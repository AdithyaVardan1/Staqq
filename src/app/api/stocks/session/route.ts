import { NextResponse } from 'next/server';
import { angelOne } from '@/lib/angelone';

export async function GET() {
    try {
        const result = await angelOne.authenticate();

        if (result.success) {
            // We only return what's needed for the frontend to connect to the WebSocket
            // Avoid returning sensitive data like password or totp secret
            return NextResponse.json({
                success: true,
                jwtToken: result.data.jwtToken,
                feedToken: result.data.feedToken,
                clientCode: process.env.ANGEL_ONE_CLIENT_CODE
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error
            }, { status: 401 });
        }
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
