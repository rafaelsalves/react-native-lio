import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native'
import { LIO_CLIENT_ID, LIO_ACCESS_TOKEN } from '@env'

export * from './types'

import {
    type LioPaymentParams,
    type LioReversalParams,
    type LioPrintParams,
    type LioDeviceInfoParams,
    type LioDeviceInfoResponse,
    type LioOrdersParams,
    type LioOrdersResponse,
    type LioResponse,
    type LioResponseCallback,
    type LioOrder,
    type LioPaymentResponse,
    LioOrderStatus,
} from './types'

const { LioDeepLink: LioDeepLinkNative } = NativeModules

/**
 * Applies default credentials if not provided
 */
function applyDefaultCredentials<T extends { clientID?: string; accessToken?: string }>(params: T): T {
    return {
        ...params,
        clientID: params.clientID || LIO_CLIENT_ID,
        accessToken: params.accessToken || LIO_ACCESS_TOKEN,
    } as T
}

class LioDeepLinkModule {
    private eventEmitter: NativeEventEmitter;
    private listeners: EmitterSubscription[] = [];

    constructor() {
        if (!LioDeepLinkNative) {
            throw new Error(
                'LioDeepLink native module not found. Did you forget to rebuild the app?'
            );
        }
        this.eventEmitter = new NativeEventEmitter(LioDeepLinkNative);
    }

    /**
    * Gets Cielo LIO machine information
    * @param params - Parameters with clientID and accessToken
    * @param onResponse - Callback to receive the response with device information
    * @returns Promise<boolean> - true if the intent was sent successfully
    */
    async getDeviceInfo(
        params: LioDeviceInfoParams = {}
    ): Promise<LioDeviceInfoResponse> {
        const paramsWithDefaults = applyDefaultCredentials(params);

        return new Promise((resolve, reject) => {
            const subscription = this.addResponseListener((content) => {
                this.removeListener(subscription);
                resolve(content as LioDeviceInfoResponse);
            });

            LioDeepLinkNative.sendIntent(
                'terminalinfo',
                paramsWithDefaults,
                'lio://terminalinfo-response'
            ).catch((error: Error) => {
                this.removeListener(subscription);
                reject(error);
            });
        });
    }

    /**
     * Sends a payment request via deeplink to Cielo LIO
     * @param params - Payment parameters
     * @param onResponse - Callback to receive the response
     * @returns Promise<LioPaymentResponse> - Standardized response with code, reason and data
     */
    async sendPayment(
        params: LioPaymentParams
    ): Promise<LioPaymentResponse> {
        const paramsWithDefaults = applyDefaultCredentials(params);

        return new Promise((resolve, reject) => {
            const subscription = this.addResponseListener((content: any) => {
                this.removeListener(subscription);

                if (content && 'code' in content && 'reason' in content) {
                    resolve({
                        code: content.code,
                        reason: content.reason,
                        data: content
                    });
                } else {
                    resolve({
                        code: 0,
                        reason: 'Pagamento realizado com sucesso',
                        data: content as LioOrder
                    });
                }
            });

            LioDeepLinkNative.sendIntent(
                'payment',
                paramsWithDefaults,
                'lio://payment-response'
            ).catch((error: Error) => {
                this.removeListener(subscription);
                reject(error);
            });
        });
    }

    /**
     * Sends a cancellation request via deeplink to Cielo LIO
     * @param params - Cancellation parameters
     * @param onResponse - Callback to receive the response
     * @returns Promise<boolean> - true if the intent was sent successfully
     */
    async sendReversal(
        params: LioReversalParams
    ): Promise<LioResponse> {
        const paramsWithDefaults = applyDefaultCredentials(params);

        return new Promise((resolve, reject) => {
            const subscription = this.addResponseListener((content) => {
                this.removeListener(subscription);
                resolve(content);
            });

            LioDeepLinkNative.sendIntent(
                'payment-reversal',
                paramsWithDefaults,
                'lio://reversal-response'
            ).catch((error: Error) => {
                this.removeListener(subscription);
                reject(error);
            });
        });
    }

    /**
     * Sends a print request via deeplink to Cielo LIO
     * @param params - Print parameters
     * @param onResponse - Callback to receive the response
     * @returns Promise<boolean> - true if the intent was sent successfully
     */
    async sendPrint(
        params: LioPrintParams
    ): Promise<LioResponse> {
        const paramsWithDefaults = applyDefaultCredentials(params);

        return new Promise((resolve, reject) => {
            const subscription = this.addResponseListener((content) => {
                this.removeListener(subscription);
                resolve(content);
            });

            LioDeepLinkNative.sendIntent(
                'print',
                paramsWithDefaults,
                'lio://print-response'
            ).catch((error: Error) => {
                this.removeListener(subscription);
                reject(error);
            });
        });
    }

    /**
    * Saves a Base64 image to storage and returns the file path
    * @param base64Image - Base64 string of the image (with or without data:image prefix)
    * @param fileName - File name (without extension)
    * @returns Promise<string> - Absolute path of the saved file
    */
    async saveBase64Image(base64Image: string, fileName: string): Promise<string> {
        return LioDeepLinkNative.saveBase64Image(base64Image, fileName);
    }

    /**
     * Gets the list of orders from Cielo LIO
     * @param params - Parameters with clientID, accessToken and optional filters
     * @returns Promise<LioOrdersResponse> - List of orders filtered by status (default: ['PAID'])
     */
    async getOrders(
        params: LioOrdersParams = {}
    ): Promise<LioOrdersResponse> {
        const paramsWithDefaults = applyDefaultCredentials(params);

        return new Promise((resolve, reject) => {
            const subscription = this.addResponseListener((content) => {
                this.removeListener(subscription);

                if (content.results && Array.isArray(content.results)) {
                    const statusFilter = paramsWithDefaults.statusFilter || [LioOrderStatus.PAID];

                    const shouldReturnAll = statusFilter === 'ALL' ||
                        (Array.isArray(statusFilter) && (statusFilter as any).includes('ALL'))

                    const filteredResults = shouldReturnAll
                        ? content.results
                        : content.results.filter((order: any) =>
                            (statusFilter as any).includes(order.status)
                        );

                    resolve({
                        ...content,
                        results: filteredResults,
                        totalItems: filteredResults.length
                    } as LioOrdersResponse);
                } else {
                    resolve(content as LioOrdersResponse);
                }
            });

            LioDeepLinkNative.sendIntent(
                'orders',
                paramsWithDefaults,
                'lio://orders-response'
            ).catch((error: Error) => {
                this.removeListener(subscription);
                reject(error);
            });
        });
    }

    /**
     * Adds a listener to receive responses from deeplinks
     * @param callback - Function that will be called when receiving a response
     * @returns EmitterSubscription - Subscription that can be removed
     */
    addResponseListener(callback: LioResponseCallback): EmitterSubscription {
        const subscription = this.eventEmitter.addListener(
            'onLioDeepLinkResponse',
            callback
        );
        this.listeners.push(subscription);
        return subscription;
    }

    /**
     * Removes all response listeners
     */
    removeAllListeners(): void {
        this.listeners.forEach(listener => listener.remove());
        this.listeners = [];
    }

    /**
     * Removes a specific listener
     * @param subscription - Subscription returned by addResponseListener
     */
    removeListener(subscription: EmitterSubscription): void {
        subscription.remove();
        this.listeners = this.listeners.filter(l => l !== subscription);
    }
}

export default new LioDeepLinkModule();
