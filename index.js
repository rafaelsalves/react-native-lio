import { NativeModules, NativeEventEmitter } from 'react-native'
const EventEmitter = new NativeEventEmitter(NativeModules.Lio || {});

const LioEvents = {
    onChangeServiceState: 'onChangeServiceState',
    onChangeCancellationState: 'onChangeCancellationState',
    onChangePaymentState: 'onChangePaymentState',
};

const ServiceState = {
    ACTIVE: 0,
    ERROR: 1,
    INACTIVE: 2,
}

const PaymentState = {
    START: 0,
    DONE: 1,
    CANCELLED: 2,
    ERROR: 3,
}

const CancellationState = {
    SUCCESS: 1,
    ABORT: 2,
    ERROR: 3,
}

const PaymentStatus = {
    ACCEPTED: 1,
    CANCELLED: 2,
}

const PrintStyles = {
    KEY_ALIGN: "key_attributes_align",
    KEY_TEXT_SIZE: "key_attributes_textsize",
    KEY_TYPEFACE: "key_attributes_typeface",
    KEY_MARGIN_LEFT: "key_attributes_marginleft",
    KEY_MARGIN_RIGHT: "key_attributes_marginright",
    KEY_MARGIN_TOP: "key_attributes_margintop",
    KEY_MARGIN_BOTTOM: "key_attributes_marginbottom",
    KEY_LINE_SPACE: "key_attributes_linespace",
    KEY_WEIGHT: "key_attributes_weight",
    VAL_ALIGN_CENTER: 0,
    VAL_ALIGN_LEFT: 1,
    VAL_ALIGN_RIGHT: 2,
}

let Lio = {};

const setup = (clientID, accessToken, ec = null) => {
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

const getMachineInformation = () => {
    return NativeModules.Lio.getMachineInformation()
}

const getOrderList = (pageSize = 30, page = 0) => {
    return NativeModules.Lio.getOrderList(pageSize, page)
}

const createDraftOrder = (orderId) => {
    return NativeModules.Lio.createDraftOrder(orderId);
}

const addItems = (items) => {
    return NativeModules.Lio.addItems(items);
}

const placeOrder = () => {
    return NativeModules.Lio.placeOrder();
}

const checkoutOrder = (value, paymentCode) => {
    return NativeModules.Lio.checkoutOrder(value, paymentCode);
}

const setOrderNotes = (orderId, notes = '') => {
    return NativeModules.Lio.setOrderNotes(orderId, notes)
}

const getOrdersWithNotes = () => {
    return NativeModules.Lio.getOrdersWithNotes()
}

const getIsServiceConnected = () => {
    return NativeModules.Lio.getIsServiceConnected()
}

const printText = (textToPrint, style = {}) => {
    return NativeModules.Lio.printText(textToPrint, style)
}

const printImage = (encodedImage, style = {}) => {
    return NativeModules.Lio.printImage(encodedImage, style)
}

const unbind = () => {
    return NativeModules.Lio.unbind()
}

const addListener = (event, callback) => {
    return EventEmitter.addListener(event, callback);
}

export default {
    Lio, setup, getMachineInformation, getOrderList, createDraftOrder, setOrderNotes, getOrdersWithNotes,
    addItems, placeOrder, checkoutOrder, printText, printImage, unbind, getIsServiceConnected,
    requestPaymentCrashCredit, requestPaymentCreditInstallment, requestPaymentDebit, cancelPayment,
    addListener, LioEvents,
    ServiceState, PaymentState, PaymentStatus, CancellationState,
    PrintStyles,
}