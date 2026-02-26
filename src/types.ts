// Payment Types
export interface LioPaymentItem {
    id?: number;
    sku: string;
    name: string;
    unit_price: number; // Preço unitário em centavos
    quantity: number;
    unitOfMeasure: string; // Ex: "EACH", "HOUR", "KILO"
}

export interface LioPaymentParams {
    clientID?: string;
    accessToken?: string;
    value: number; // Valor total em centavos (ex: 1000 = R$ 10,00)
    items: LioPaymentItem[]; // Array de itens (obrigatório)
    installments?: number;
    orderId?: string;
    email?: string;
    paymentCode?: string;
    [key: string]: any;
}

// Reversal Types
export interface LioReversalParams {
    clientID?: string;
    accessToken?: string;
    id: string;
    value: number;
    authCode?: string;
    cieloCode?: string;
    [key: string]: any;
}

// Print Types
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
    clientID?: string;
    accessToken?: string;
    operation: 'PRINT_TEXT' | 'PRINT_IMAGE' | 'PRINT_MULTI_COLUMN_TEXT';
    styles?: LioPrintStyle[];
    value: string[]; // Para PRINT_TEXT: array de strings | Para PRINT_IMAGE: [caminho_arquivo]
    [key: string]: any;
}

// Device Info Types
export interface LioDeviceInfoParams {
    clientID?: string;
    accessToken?: string;
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

// Orders Types
export enum LioOrderStatus {
    PAID = 'PAID',
    CANCELED = 'CANCELED',
    ENTERED = 'ENTERED',
    DRAFT = 'DRAFT',
    CLOSED = 'CLOSED',
    RE_ENTERED = 'RE-ENTERED'
}

// Payment Status Codes
export enum LioPaymentStatusCode {
    PIX = 0,
    AUTHORIZATED = 1,
    CANCELED = 2,
}

export interface LioPayment {
    terminal: string;
    secondaryCode: string;
    paymentFields: {
        [key: string]: any;
    };
    requestDate: string;
    merchantCode: string;
    mask: string;
    externalId: string;
    installments: number;
    amount: number;
    applicationName: string;
    discountedAmount: number;
    description: string;
    id: string;
    cieloCode: string;
    accessKey: string;
    primaryCode: string;
    brand: string;
    authCode: string;
    [key: string]: any;
}

export interface LioOrderItem {
    sku: string;
    unitPrice: number;
    reference?: string;
    name: string;
    details?: string;
    unitOfMeasure: string;
    quantity: number;
    id: string;
    description?: string;
    [key: string]: any;
}

export interface LioOrder {
    id: string;
    number: string;
    reference?: string;
    status: LioOrderStatus;
    price: number;
    updatedAt: string;
    createdAt: string;
    type: string;
    pendingAmount: number;
    paidAmount: number;
    notes: string;
    payments?: LioPayment[];
    items?: LioOrderItem[];
    [key: string]: any;
}

export interface LioOrdersParams {
    clientID?: string;
    accessToken?: string;
    statusFilter?: (LioOrderStatus | 'ALL')[] | 'ALL';
    pageSize?: number;
    page?: number;
}

export interface LioOrdersResponse extends LioResponse {
    results?: LioOrder[];
    totalItems?: number;
    totalPages?: number;
    currentPage?: number;
    [key: string]: any;
}

// Generic Response
export interface LioResponse {
    success?: boolean;
    error?: string;
    [key: string]: any;
}

// Callback Type
export type LioResponseCallback = (response: LioResponse) => void;
