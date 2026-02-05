import { SmartAPI } from 'smartapi-javascript';
import { generateSync } from 'otplib';

const API_KEY = process.env.ANGEL_ONE_API_KEY!;
const CLIENT_CODE = process.env.ANGEL_ONE_CLIENT_CODE!;
const PASSWORD = process.env.ANGEL_ONE_PASSWORD!;
const TOTP_SECRET = process.env.ANGEL_ONE_TOTP_SECRET!;

export class AngelOneService {
    private static instance: AngelOneService;
    private smartApi: any;
    private sessionData: any = null;

    private constructor() {
        this.smartApi = new SmartAPI({
            api_key: API_KEY,
        });
    }

    public static getInstance(): AngelOneService {
        if (!AngelOneService.instance) {
            AngelOneService.instance = new AngelOneService();
        }
        return AngelOneService.instance;
    }

    /**
     * Authenticates with Angel One using Password and TOTP.
     * Returns the session data including JWT token and Feed token.
     */
    public async authenticate() {
        try {
            if (!TOTP_SECRET) throw new Error('ANGEL_ONE_TOTP_SECRET is missing');

            // Generate current TOTP (otplib v13 requirement)
            const token = generateSync({
                secret: TOTP_SECRET,
                algorithm: 'sha1',
                digits: 6,
                period: 30
            });

            const response = await this.smartApi.generateSession(CLIENT_CODE, PASSWORD, token);

            if (response.status) {
                this.sessionData = response.data;
                return {
                    success: true,
                    data: response.data
                };
            } else {
                throw new Error(response.message || 'Authentication failed');
            }
        } catch (error: any) {
            console.error('Angel One Auth Error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    public getSession() {
        return this.sessionData;
    }

    private tokensCache: Map<string, any> | null = null;
    private lastFetchTime: number = 0;
    private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for master list
    private readonly CACHE_FILE = 'angelone_tokens.json';

    /**
     * Fetches all instrument tokens and stores them in a Map for fast lookup.
     */
    public async getInstrumentTokens() {
        const now = Date.now();
        const fs = require('fs');
        const path = require('path');
        const cachePath = path.join(process.cwd(), this.CACHE_FILE);

        // 1. Check Memory Cache
        if (this.tokensCache && (now - this.lastFetchTime < this.CACHE_DURATION)) {
            return this.tokensCache;
        }

        // 2. Check File Cache
        if (fs.existsSync(cachePath)) {
            const stats = fs.statSync(cachePath);
            if (now - stats.mtimeMs < this.CACHE_DURATION) {
                try {
                    console.log('[AngelOne] Loading tokens from file cache...');
                    const rawData = fs.readFileSync(cachePath, 'utf8');
                    const data = JSON.parse(rawData);
                    this.buildTokenMap(data);
                    this.lastFetchTime = stats.mtimeMs;
                    return this.tokensCache;
                } catch (e) {
                    console.error('[AngelOne] File cache read error:', e);
                }
            }
        }

        // 3. Fetch from API
        try {
            console.log('[AngelOne] Fetching fresh instrument tokens from API (40MB+)...');
            const response = await fetch('https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json');
            const data = await response.json();

            // Save to file cache
            fs.writeFileSync(cachePath, JSON.stringify(data));

            this.buildTokenMap(data);
            this.lastFetchTime = now;

            return this.tokensCache;
        } catch (error) {
            console.error('Error fetching tokens:', error);
            return this.tokensCache || new Map();
        }
    }

    private buildTokenMap(data: any[]) {
        console.log(`[AngelOne] Building lookup map for ${data.length} tokens...`);
        const map = new Map();
        data.forEach(item => {
            // Key: EXCHANGE:SYMBOL
            const key = `${item.exch_seg}:${item.symbol}`;
            map.set(key, item);
        });
        this.tokensCache = map;
    }

    /**
     * Finds a token for a given ticker.
     */
    public async findToken(ticker: string, exchange: string = 'NSE') {
        const tokensMap = await this.getInstrumentTokens();
        const symbol = exchange === 'NSE' ? `${ticker}-EQ` : ticker;
        const key = `${exchange}:${symbol}`;
        const instrument = tokensMap?.get(key);
        return instrument ? instrument.token : null;
    }

    /**
     * Creates and returns a WebSocketV2 instance from the SDK.
     */
    public async getWebSocketV2() {
        if (!this.sessionData) {
            await this.authenticate();
        }

        const { WebSocketV2 } = require('smartapi-javascript');

        return new WebSocketV2({
            clientcode: CLIENT_CODE,
            jwttoken: this.sessionData.jwtToken,
            apikey: API_KEY,
            feedtype: this.sessionData.feedToken
        });
    }

    /**
     * Gets Full Quote using marketData method.
     */
    public async getFullQuote(exchange: string, symbol: string, token: string) {
        if (!this.sessionData) {
            await this.authenticate();
        }

        try {
            // Use marketData with FULL mode
            const response = await this.smartApi.marketData({
                mode: 'FULL',
                exchangeTokens: {
                    [exchange]: [token]
                }
            });

            if (response && response.status && response.data && response.data.fetched && response.data.fetched.length > 0) {
                const data = response.data.fetched[0];
                // Map to expected structure
                // format: { ltp, close, percentChange, netChange, ... }
                return {
                    status: true,
                    data: [{
                        ltp: data.ltp,
                        netChange: data.netChange || (data.ltp - data.close).toFixed(2),
                        percentChange: data.percentChange || ((data.ltp - data.close) / data.close * 100).toFixed(2),
                        exchange: exchange,
                        tradingsymbol: symbol // Note: marketData might not return symbol
                    }]
                };
            }
            return response;
        } catch (error: any) {
            console.error('Angel One Quote Error:', error.message);
            return null;
        }
    }

    /**
     * Gets historical candle data.
     * @param exchange Exchange (NSE, BSE)
     * @param token Symbol Token
     * @param interval Interval (ONE_MINUTE, FIVE_MINUTE, ONE_HOUR, ONE_DAY)
     * @param fromDate Format: YYYY-MM-DD HH:mm
     * @param toDate Format: YYYY-MM-DD HH:mm
     */
    public async getCandleData(exchange: string, token: string, interval: string, fromDate: string, toDate: string) {
        if (!this.sessionData) {
            await this.authenticate();
        }

        try {
            const params = {
                exchange,
                symboltoken: token,
                interval,
                fromdate: fromDate,
                todate: toDate
            };

            // Expected response: { status: true, data: [ [timestamp, open, high, low, close, volume], ... ] }
            const response = await this.smartApi.getCandleData(params);
            return response;
        } catch (error: any) {
            console.error('Angel One Candle Data Error:', error.message);
            return null;
        }
    }

    /**
     * Gets Last Traded Price (LTP) for a specific symbol.
     */
    public async getLTP(exchange: string, symbol: string, token: string) {
        if (!this.sessionData) {
            await this.authenticate();
        }

        try {
            const response = await this.smartApi.getLTPDetail({
                exchange,
                tradingsymbol: symbol,
                symboltoken: token
            });
            return response;
        } catch (error: any) {
            console.error('Angel One LTP Error:', error.message);
            return null;
        }
    }
}

export const angelOne = AngelOneService.getInstance();
