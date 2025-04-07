import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native'
const EventEmitter = new NativeEventEmitter(NativeModules.Lio || {})

enum ServiceState {
    ACTIVE = 0,
    ERROR = 1,
    INACTIVE = 2,
}

type Payment = {
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

enum PaymentState {
    START = 0,
    DONE = 1,
    CANCELLED = 2,
    ERROR = 3,
}

enum CancellationState {
    SUCCESS = 1,
    ABORT = 2,
    ERROR = 3,
}

const PaymentStatus = {
    ACCEPTED: 1,
    CANCELLED: 2,
}

enum PrinterState {
    SUCCESS = 0,
    ERROR = 1,
    NO_PAPER = 2,
}

enum PRINT_KEY_ALIGNS {
    VAL_ALIGN_CENTER = 0,
    VAL_ALIGN_LEFT = 1,
    VAL_ALIGN_RIGHT = 2,
}

enum PrintStyles {
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

type PrintStyleKeys = keyof typeof PrintStyles | null | {};

type MachineInformation = {
    logicNumber: string
    merchantCode: string
    isLoaded: boolean
}

let Lio = {}

const setup = (clientID: string, accessToken: string, ec = null) => {
    return NativeModules.Lio.setup(clientID, accessToken, ec);
}

const requestPaymentCrashCredit = (amount, orderId, notes = '') => {
    return NativeModules.Lio.requestPaymentCrashCredit(amount, orderId, notes)
}

const requestPaymentCreditInstallment = (amount, orderId, installments, notes = '') => {
    return NativeModules.Lio.requestPaymentCreditInstallment(amount, orderId, installments, notes)
}

const requestPaymentDebit = (amount, orderId, notes = '') => {
    return NativeModules.Lio.requestPaymentDebit(amount, orderId, notes)
}

const cancelPayment = (orderId, authCode, cieloCode, amount) => {
    return NativeModules.Lio.cancelPayment(orderId, authCode, cieloCode, amount)
}

const getMachineInformation = (): MachineInformation => {
    return NativeModules.Lio.getMachineInformation()
}

const getOrderList = (pageSize: number = 30, page: number = 0) => {
    return NativeModules.Lio.getOrderList(pageSize, page)
}

const createDraftOrder = (orderId: string) => {
    return NativeModules.Lio.createDraftOrder(orderId);
}

const addItems = (items): void => {
    return NativeModules.Lio.addItems(items);
}

const placeOrder = () => {
    return NativeModules.Lio.placeOrder();
}

const checkoutOrder = (value, paymentCode) => {
    return NativeModules.Lio.checkoutOrder(value, paymentCode);
}

const setOrderNotes = (orderId: string, notes: string = ''): void => {
    return NativeModules.Lio.setOrderNotes(orderId, notes)
}

const getOrdersWithNotes = () => {
    return NativeModules.Lio.getOrdersWithNotes()
}

const getIsServiceConnected = (): boolean => {
    return NativeModules.Lio.getIsServiceConnected()
}

const printText = (textToPrint: string, style: PrintStyleKeys = {}): void => {
    return NativeModules.Lio.printText(textToPrint, style)
}

const printImage = (encodedImage: string, style: PrintStyleKeys = {}): void => {
    return NativeModules.Lio.printImage(encodedImage, style)
}

const unbind = (): void => {
    return NativeModules.Lio.unbind()
}

const activateNFC = (): void => {
    return NativeModules.Lio.activateNFC()
}

const deactivateNFC = (): void => {
    return NativeModules.Lio.deactivateNFC()
}

type EventMap = {
    onChangeServiceState: (state: string) => void;
    onChangePaymentState: (data: Payment) => void;
    onChangeCancellationState: (data: { cancellationState: CancellationState }) => void;
    onChangePrinterState: (data: { printerState: PrinterState }) => void;
    onReadNFC: (data: { status: boolean; cardId?: string }) => void;
}

const addListener = <eventName extends keyof EventMap>(
    event: eventName,
    callback: EventMap[eventName]
): EmitterSubscription => {
    return EventEmitter.addListener(event, callback)
}

export default {
    Lio, setup, getMachineInformation, getOrderList, createDraftOrder, setOrderNotes, getOrdersWithNotes,
    addItems, placeOrder, checkoutOrder, printText, printImage, unbind, getIsServiceConnected, activateNFC, deactivateNFC,
    requestPaymentCrashCredit, requestPaymentCreditInstallment, requestPaymentDebit, cancelPayment,
    addListener,
    ServiceState, PaymentState, PaymentStatus, CancellationState,
    PrintStyles, PRINT_KEY_ALIGNS,
}