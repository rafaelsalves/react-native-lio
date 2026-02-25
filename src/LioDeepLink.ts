import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

const { LioDeepLink: LioDeepLinkNative } = NativeModules;

// Types
export interface LioPaymentItem {
    id?: number;
    sku: string;
    name: string;
    unit_price: number; // Preço unitário em centavos
    quantity: number;
    unitOfMeasure: string; // Ex: "EACH", "HOUR", "KILO"
}

export interface LioPaymentParams {
    clientID: string;
    accessToken: string;
    value: number; // Valor total em centavos (ex: 1000 = R$ 10,00)
    items: LioPaymentItem[]; // Array de itens (obrigatório)
    installments?: number;
    orderId?: string;
    email?: string;
    [key: string]: any;
}

export interface LioReversalParams {
    clientID: string;
    accessToken: string;
    orderId: string;
    value: number;
    authCode?: string;
    cieloCode?: string;
    [key: string]: any;
}

export interface LioPrintStyle {
    key_attributes_align?: 0 | 1 | 2; // 0 = Center, 1 = Left, 2 = Right
    key_attributes_textsize?: number;
    key_attributes_typeface?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    key_attributes_marginleft?: number;
    key_attributes_marginright?: number;
    key_attributes_margintop?: number;
    key_attributes_marginbottom?: number;
    key_attributes_linespace?: number;
    key_attributes_weight?: number;
    form_feed?: 0 | 1; // 0 = sem espaçamento, 1 = com espaçamento
    [key: string]: any;
}

export interface LioPrintParams {
    clientID: string;
    accessToken: string;
    operation: 'PRINT_TEXT' | 'PRINT_IMAGE' | 'PRINT_MULTI_COLUMN_TEXT';
    styles?: LioPrintStyle[];
    value: string[];
    [key: string]: any;
}

export interface LioDeviceInfoParams {
    clientID: string;
    accessToken: string;
}

export interface LioResponse {
    success?: boolean;
    error?: string;
    [key: string]: any;
}

export interface LioDeviceInfoResponse extends LioResponse {
    serialNumber?: string;
    logicNumber?: string;
    imeiNumber?: string;
    deviceModel?: string;
    merchantCode?: string;
    responseCode?: number;
    batteryLevel?: number;
}

export enum LioOrderStatus {
    PAID = 'PAID',
    ENTERED = 'ENTERED',
    DRAFT = 'DRAFT',
    CLOSED = 'CLOSED',
    RE_ENTERED = 'RE-ENTERED'
}

export interface LioOrder {
    id: string;
    number: string;
    reference?: string;
    status: string;
    price: number;
    [key: string]: any;
}

export interface LioOrdersParams {
    clientID: string;
    accessToken: string;
    onlyWithPayments?: boolean;
    pageSize?: number;
    page?: number;
}

export interface LioOrdersResponse extends LioResponse {
    results?: string | LioOrder[]; // Vem como string JSON que precisa ser parseado
    totalItems?: number;
    totalPages?: number;
    currentPage?: number;
    [key: string]: any;
}

export type LioResponseCallback = (response: LioResponse) => void;

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
    * Obtém informações da máquina Cielo LIO
    * @param params - Parâmetros com clientID e accessToken
    * @param onResponse - Callback para receber a resposta com as informações do dispositivo
    * @returns Promise<boolean> - true se o intent foi enviado com sucesso
    */
    async getDeviceInfo(
        params: LioDeviceInfoParams
    ): Promise<LioDeviceInfoResponse> {
        return new Promise((resolve, reject) => {
            const subscription = this.addResponseListener((content) => {
                this.removeListener(subscription);
                resolve(content as LioDeviceInfoResponse);
            });

            LioDeepLinkNative.sendIntent(
                'terminalinfo',
                params,
                'lio://terminalinfo-response'
            ).catch((error: Error) => {
                this.removeListener(subscription);
                reject(error);
            });
        });
    }

    /**
     * Envia uma requisição de pagamento via deeplink para a Cielo LIO
     * @param params - Parâmetros do pagamento
     * @param onResponse - Callback para receber a resposta
     * @returns Promise<boolean> - true se o intent foi enviado com sucesso
     */
    async sendPayment(
        params: LioPaymentParams
    ): Promise<LioResponse> {
        return new Promise((resolve, reject) => {
            const subscription = this.addResponseListener((content) => {
                this.removeListener(subscription);
                resolve(content);
            });

            LioDeepLinkNative.sendIntent(
                'payment',
                params,
                'lio://payment-response'
            ).catch((error: Error) => {
                this.removeListener(subscription);
                reject(error);
            });
        });
    }

    /**
     * Envia uma requisição de cancelamento via deeplink para a Cielo LIO
     * @param params - Parâmetros do cancelamento
     * @param onResponse - Callback para receber a resposta
     * @returns Promise<boolean> - true se o intent foi enviado com sucesso
     */
    async sendReversal(
        params: LioReversalParams
    ): Promise<LioResponse> {
        return new Promise((resolve, reject) => {
            const subscription = this.addResponseListener((content) => {
                this.removeListener(subscription);
                resolve(content);
            });

            LioDeepLinkNative.sendIntent(
                'payment-reversal',
                params,
                'lio://reversal-response'
            ).catch((error: Error) => {
                this.removeListener(subscription);
                reject(error);
            });
        });
    }

    /**
     * Envia uma requisição de impressão via deeplink para a Cielo LIO
     * @param params - Parâmetros da impressão
     * @param onResponse - Callback para receber a resposta
     * @returns Promise<boolean> - true se o intent foi enviado com sucesso
     */
    async sendPrint(
        params: LioPrintParams
    ): Promise<LioResponse> {
        return new Promise((resolve, reject) => {
            const subscription = this.addResponseListener((content) => {
                this.removeListener(subscription);
                resolve(content);
            });

            LioDeepLinkNative.sendIntent(
                'print',
                params,
                'lio://print-response'
            ).catch((error: Error) => {
                this.removeListener(subscription);
                reject(error);
            });
        });
    }

    /**
     * Obtém a lista de pedidos da Cielo LIO
     * @param params - Parâmetros com clientID, accessToken e filtro opcional
     * @returns Promise<LioOrdersResponse> - Lista de pedidos
     */
    async getOrders(
        params: LioOrdersParams
    ): Promise<LioOrdersResponse> {
        return new Promise((resolve, reject) => {
            const subscription = this.addResponseListener((content) => {
                this.removeListener(subscription);

                const shouldFilter = params.onlyWithPayments !== false

                if (shouldFilter && content.results && Array.isArray(content.results)) {
                    const filteredResults = content.results.filter((order: any) =>
                        order.payments && Array.isArray(order.payments) && order.payments.length > 0
                    )

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
                params,
                'lio://orders-response'
            ).catch((error: Error) => {
                this.removeListener(subscription);
                reject(error);
            });
        });
    }

    /**
     * Adiciona um listener para receber respostas dos deeplinks
     * @param callback - Função que será chamada quando receber uma resposta
     * @returns EmitterSubscription - Subscrição que pode ser removida
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
     * Remove todos os listeners de resposta
     */
    removeAllListeners(): void {
        this.listeners.forEach(listener => listener.remove());
        this.listeners = [];
    }

    /**
     * Remove um listener específico
     * @param subscription - Subscrição retornada por addResponseListener
     */
    removeListener(subscription: EmitterSubscription): void {
        subscription.remove();
        this.listeners = this.listeners.filter(l => l !== subscription);
    }
}

// Exporta uma instância única (singleton)
export default new LioDeepLinkModule();
