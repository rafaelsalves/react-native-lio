import { NativeModules, NativeEventEmitter } from 'react-native'
const EventEmitter = new NativeEventEmitter(NativeModules.Lio || {});

const LioEvents = {
    onChangeServiceState: 'onChangeServiceState',
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

let Lio = {};

const setup = (clientID, accessToken) => {
    return NativeModules.Lio.setup(clientID, accessToken);
}

const requestPaymentCrashCredit = (amount, orderId) => {
    return NativeModules.Lio.requestPaymentCrashCredit(amount, orderId)
}

const requestPaymentCreditInstallment = (amount, orderId, installments) => {
    return NativeModules.Lio.requestPaymentCreditInstallment(amount, orderId, installments)
}

const requestPaymentDebit = (amount, orderId) => {
    return NativeModules.Lio.requestPaymentDebit(amount, orderId)
}

Lio.createDraftOrder = (orderId) => {
    return NativeModules.Lio.createDraftOrder(orderId);
}

Lio.addItems = (items) => {
    return NativeModules.Lio.addItems(items);
}

Lio.placeOrder = () => {
    return NativeModules.Lio.placeOrder();
}

Lio.checkoutOrder = (value, paymentCode) => {
    return NativeModules.Lio.checkoutOrder(value, paymentCode);
}

const addListener = (event, callback) => {
    return EventEmitter.addListener(event, callback);
}

export default { 
    Lio, setup, 
    requestPaymentCrashCredit, requestPaymentCreditInstallment, requestPaymentDebit,
    addListener, LioEvents, 
    ServiceState, PaymentState,
}

