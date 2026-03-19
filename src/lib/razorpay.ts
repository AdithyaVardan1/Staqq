import Razorpay from 'razorpay';
import crypto from 'crypto';

let _instance: Razorpay | null = null;

function getInstance(): Razorpay {
    if (!_instance) {
        _instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });
    }
    return _instance;
}

export { getInstance as getRazorpay };

/** Create a Razorpay subscription for a user */
export async function createRazorpaySubscription(params: {
    planId: string; // Razorpay plan ID (plan_xxxxx)
    customerId?: string;
    email: string;
    name?: string;
    totalCount?: number;
}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptionOptions: any = {
        plan_id: params.planId,
        total_count: params.totalCount ?? 120,
        quantity: 1,
        customer_notify: 1,
        notes: {
            email: params.email,
            name: params.name || '',
        },
    };

    if (params.customerId) {
        subscriptionOptions.customer_id = params.customerId;
    }

    const subscription: any = await getInstance().subscriptions.create(subscriptionOptions);
    return subscription as { id: string; [key: string]: any };
}

/** Create or retrieve a Razorpay customer */
export async function getOrCreateCustomer(params: {
    email: string;
    name?: string;
    existingCustomerId?: string;
}) {
    if (params.existingCustomerId) {
        try {
            const customer = await getInstance().customers.fetch(params.existingCustomerId);
            return customer;
        } catch {
            // Customer not found, create new
        }
    }

    const customer: any = await getInstance().customers.create({
        name: params.name || params.email.split('@')[0],
        email: params.email,
        fail_existing: 0, // return existing if email matches
    });
    return customer as { id: string; [key: string]: any };
}

/** Cancel a Razorpay subscription */
export async function cancelRazorpaySubscription(
    subscriptionId: string,
    cancelAtCycleEnd: boolean = true
) {
    const subscription = await getInstance().subscriptions.cancel(
        subscriptionId,
        cancelAtCycleEnd
    );
    return subscription;
}

/** Fetch a subscription from Razorpay */
export async function fetchRazorpaySubscription(subscriptionId: string) {
    return getInstance().subscriptions.fetch(subscriptionId);
}

/** Verify Razorpay webhook signature */
export function verifyWebhookSignature(
    body: string,
    signature: string,
    secret?: string
): boolean {
    const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

/** Verify Razorpay payment signature (for checkout callback) */
export function verifyPaymentSignature(params: {
    razorpay_subscription_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}): boolean {
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${params.razorpay_payment_id}|${params.razorpay_subscription_id}`)
        .digest('hex');
    return crypto.timingSafeEqual(
        Buffer.from(params.razorpay_signature),
        Buffer.from(generatedSignature)
    );
}
