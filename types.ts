export enum ServiceState {
    ACTIVE = 0,
    ERROR = 1,
    INACTIVE = 2,
}

export enum PaymentState {
    START = 0,
    DONE = 1,
    CANCELLED = 2,
    ERROR = 3,
}

export enum CancellationState {
    SUCCESS = 1,
    ABORT = 2,
    ERROR = 3,
}

export enum PaymentStatus {
    ACCEPTED = 1,
    CANCELLED = 2,
}

export enum PrinterState {
    SUCCESS = 0,
    ERROR = 1,
    NO_PAPER = 2,
}

export enum PRINT_KEY_ALIGNS {
    VAL_ALIGN_CENTER = 0,
    VAL_ALIGN_LEFT = 1,
    VAL_ALIGN_RIGHT = 2,
}

export enum PrintStyles {
    KEY_ALIGN = "key_attributes_align",
    KEY_TEXT_SIZE = "key_attributes_textsize",
    KEY_TYPEFACE = "key_attributes_typeface",
    KEY_MARGIN_LEFT = "key_attributes_marginleft",
    KEY_MARGIN_RIGHT = "key_attributes_marginright",
    KEY_MARGIN_TOP = "key_attributes_margintop",
    KEY_MARGIN_BOTTOM = "key_attributes_marginbottom",
    KEY_LINE_SPACE = "key_attributes_linespace",
    KEY_WEIGHT = "key_attributes_weight",
}

export type Payment = {
    paymentState: PaymentState
    orderId: string
    amount: number
    product: string
    brand: string
    nsu: string
    authorizationCode: string
    authorizationDate: string
    logicNumber: string
}

export type PrintStyleKeys = keyof typeof PrintStyles | null | {};

export type MachineInformation = {
    logicNumber: string
    merchantCode: string
    isLoaded: boolean
}

export type ProductItem = {
    id_produto: string
    descricao: string
    preco: string
    unidade: string
}