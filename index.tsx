import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native'
const EventEmitter = new NativeEventEmitter(NativeModules.Lio || {})

import {
    ServiceState, PaymentState, CancellationState,
    PaymentStatus, PrinterState, PRINT_KEY_ALIGNS, PrintStyles,
    Payment, PrintStyleKeys, MachineInformation, ProductItem
} from './types'

let Lio = {}

const setup = (clientID: string, accessToken: string, ec = null): void => {
    return NativeModules.Lio.setup(clientID, accessToken, ec);
}

const requestPaymentCrashCredit = (amount: number, orderId: string, notes: string = ''): void => {
    return NativeModules.Lio.requestPaymentCrashCredit(amount, orderId, notes)
}

const requestPaymentCreditInstallment = (amount: number, orderId: string, installments: number, notes: string = ''): void => {
    return NativeModules.Lio.requestPaymentCreditInstallment(amount, orderId, installments, notes)
}

const requestPaymentDebit = (amount: number, orderId: string, notes: string = ''): void => {
    return NativeModules.Lio.requestPaymentDebit(amount, orderId, notes)
}

const cancelPayment = (orderId: string, authCode: string, cieloCode: string, amount: number): void => {
    return NativeModules.Lio.cancelPayment(orderId, authCode, cieloCode, amount)
}

const getMachineInformation = (): MachineInformation => {
    return NativeModules.Lio.getMachineInformation()
}

const getOrderList = (pageSize: number = 30, page: number = 0): void => {
    return NativeModules.Lio.getOrderList(pageSize, page)
}

const createDraftOrder = (orderId: string): void => {
    return NativeModules.Lio.createDraftOrder(orderId);
}

const setOrderNotes = (orderId: string, notes: string = ''): void => {
    return NativeModules.Lio.setOrderNotes(orderId, notes)
}

const getOrdersWithNotes = (): void => {
    return NativeModules.Lio.getOrdersWithNotes()
}

const addItems = (items: Array<ProductItem>): void => {
    return NativeModules.Lio.addItems(items)
}

const placeOrder = (): void => {
    return NativeModules.Lio.placeOrder()
}

const checkoutOrder = (value, paymentCode): void => {
    return NativeModules.Lio.checkoutOrder(value, paymentCode);
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