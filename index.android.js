'use strict'

import { NativeModules, NativeEventEmitter } from 'react-native'
const EventEmitter = new NativeEventEmitter(NativeModules.Lio || {});

export const LioEvent = {
    LioServiceErrorReceived: 'LioServiceErrorReceived',
    LioOnPayment: 'LioOnPayment'
};

const Lio = {};

Lio.initializeLio = (clientID, accessToken) => {
    return NativeModules.Lio.initializeLio(clientID, accessToken);
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

Lio.on = (event, callback) => {
    return EventEmitter.addListener(event, callback);
}

export default Lio;
export {};

