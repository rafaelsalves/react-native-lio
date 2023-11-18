import { NativeModules, NativeEventEmitter } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-lio' doesn't seem to be linked. Make sure: \n\n` +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const LioModule = NativeModules.Lio
  ? NativeModules.Lio
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const eventEmitter = new NativeEventEmitter(LioModule);

export const LioEvents = {
  onChangeServiceState: 'onChangeServiceState',
  onChangeCancellationState: 'onChangeCancellationState',
  onChangePaymentState: 'onChangePaymentState',
};

export const ServiceState = {
  ACTIVE: 0,
  ERROR: 1,
  INACTIVE: 2,
};

export const PaymentState = {
  START: 0,
  DONE: 1,
  CANCELLED: 2,
  ERROR: 3,
};

export const CancellationState = {
  SUCCESS: 1,
  ABORT: 2,
  ERROR: 3,
};

export const PaymentStatus = {
  ACCEPTED: 1,
  CANCELLED: 2,
};

export const PrintStyles = {
  KEY_ALIGN: 'key_attributes_align',
  KEY_TEXT_SIZE: 'key_attributes_textsize',
  KEY_TYPEFACE: 'key_attributes_typeface',
  KEY_MARGIN_LEFT: 'key_attributes_marginleft',
  KEY_MARGIN_RIGHT: 'key_attributes_marginright',
  KEY_MARGIN_TOP: 'key_attributes_margintop',
  KEY_MARGIN_BOTTOM: 'key_attributes_marginbottom',
  KEY_LINE_SPACE: 'key_attributes_linespace',
  KEY_WEIGHT: 'key_attributes_weight',
  VAL_ALIGN_CENTER: 0,
  VAL_ALIGN_LEFT: 1,
  VAL_ALIGN_RIGHT: 2,
};

export function multiply(a: number, b: number): Promise<number> {
  return LioModule.multiply(a, b);
}

export const setup = (
  clientID: string,
  accessToken: string,
  ec?: string
): void => {
  return LioModule.setup(clientID, accessToken, ec);
};

export const requestPaymentCrashCredit = (
  amount: number,
  orderId: string
): void => {
  return LioModule.requestPaymentCrashCredit(amount, orderId);
};

export const requestPaymentCreditInstallment = (
  amount: number,
  orderId: string,
  installments: number
): void => {
  return LioModule.requestPaymentCreditInstallment(
    amount,
    orderId,
    installments
  );
};

export const requestPaymentDebit = (amount: number, orderId: string): void => {
  return LioModule.requestPaymentDebit(amount, orderId);
};

export const cancelPayment = (
  orderId: string,
  authCode: string,
  cieloCode: string,
  amount: number
): void => {
  return LioModule.cancelPayment(orderId, authCode, cieloCode, amount);
};

export interface MachineProps {
  logicNumber: string;
  merchantCode: string;
}
export const getMachineInformation = (): MachineProps => {
  return LioModule.getMachineInformation();
};

export const getOrderList = (pageSize = 30, page = 0) => {
  return LioModule.getOrderList(pageSize, page);
};

export const createDraftOrder = (orderId: string): void => {
  return LioModule.createDraftOrder(orderId);
};

export const addItems = (items) => {
  return LioModule.addItems(items);
};

export const placeOrder = (): void => {
  return LioModule.placeOrder();
};

export const checkoutOrder = (amount: number, paymentCode: string) => {
  return LioModule.checkoutOrder(amount, paymentCode);
};

export const printText = (textToPrint: string, style?: Object): void => {
  return LioModule.printText(textToPrint, style);
};

export const printImage = (encodedImage: string, style?: Object) => {
  return LioModule.printImage(encodedImage, style);
};

const unbind = (): void => {
  return LioModule.unbind();
};

export const addListener = (event: string, callback: (event: any) => void) => {
  return eventEmitter.addListener(event, callback);
};

const Lio = {
  multiply,
  LioEvents,
  ServiceState,
  PaymentState,
  CancellationState,
  PaymentStatus,
  PrintStyles,
  setup,
  requestPaymentCrashCredit,
  requestPaymentCreditInstallment,
  requestPaymentDebit,
  cancelPayment,
  getMachineInformation,
  printText,
  printImage,
  unbind,
  addListener,
};

export default Lio;
