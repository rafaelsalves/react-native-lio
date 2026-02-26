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
    LioOrderStatus,
} from './types'

const { LioDeepLink: LioDeepLinkNative } = NativeModules

/**
 * Aplica credenciais padrão se não forem fornecidas
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
    * Obtém informações da máquina Cielo LIO
    * @param params - Parâmetros com clientID e accessToken
    * @param onResponse - Callback para receber a resposta com as informações do dispositivo
    * @returns Promise<boolean> - true se o intent foi enviado com sucesso
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
     * Envia uma requisição de pagamento via deeplink para a Cielo LIO
     * @param params - Parâmetros do pagamento
     * @param onResponse - Callback para receber a resposta
     * @returns Promise<boolean> - true se o intent foi enviado com sucesso
     */
    async sendPayment(
        params: LioPaymentParams
    ): Promise<LioResponse> {
        const paramsWithDefaults = applyDefaultCredentials(params);

        return new Promise((resolve, reject) => {
            const subscription = this.addResponseListener((content) => {
                this.removeListener(subscription);
                resolve(content);
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
     * Envia uma requisição de cancelamento via deeplink para a Cielo LIO
     * @param params - Parâmetros do cancelamento
     * @param onResponse - Callback para receber a resposta
     * @returns Promise<boolean> - true se o intent foi enviado com sucesso
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
     * Envia uma requisição de impressão via deeplink para a Cielo LIO
     * @param params - Parâmetros da impressão
     * @param onResponse - Callback para receber a resposta
     * @returns Promise<boolean> - true se o intent foi enviado com sucesso
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
    * Salva uma imagem Base64 no storage e retorna o caminho do arquivo
    * @param base64Image - String Base64 da imagem (com ou sem prefixo data:image)
    * @param fileName - Nome do arquivo (sem extensão)
    * @returns Promise<string> - Caminho absoluto do arquivo salvo
    */
    async saveBase64Image(base64Image: string, fileName: string): Promise<string> {
        return LioDeepLinkNative.saveBase64Image(base64Image, fileName);
    }

    /**
     * Obtém a lista de pedidos da Cielo LIO
     * @param params - Parâmetros com clientID, accessToken e filtros opcionais
     * @returns Promise<LioOrdersResponse> - Lista de pedidos filtrados por status (padrão: ['PAID'])
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

export default new LioDeepLinkModule();
