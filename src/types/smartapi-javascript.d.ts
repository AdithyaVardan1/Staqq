declare module 'smartapi-javascript' {
    export class SmartAPI {
        constructor(config: { api_key: string });
        generateSession(clientCode: string, mpin: string, totp: string): Promise<any>;
        getLTPDetail(params: { exchange: string; tradingsymbol: string; symboltoken: string }): Promise<any>;
    }
    export class WebSocketV2 {
        constructor(params: { clientcode: string; jwttoken: string; apikey: string; feedtype: string });
        connect(): Promise<void>;
        fetchData(params: any): void;
        on(event: string, callback: (data: any) => void): void;
        close(): void;
    }
}
