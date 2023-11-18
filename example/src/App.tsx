import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Lio, { LioEvents } from 'react-native-lio';

export const PAYMENT_FORMS = {
  CASH_CREDIT: 0,
  CREDIT_INSTALLMENT: 1,
  DEBIT: 2,
}

const App = () => {
  const [serviceState, setServiceState] = useState<string | undefined>(true);
  const [isLoading, setLoading] = useState<boolean | undefined>(true);

  useEffect(() => {
    let listenerChangeServiceState = Lio.addListener(
      LioEvents.onChangeServiceState,
      onLIOChangeServiceState
    );
    let listenerChangePaymentState = Lio.addListener(
      LioEvents.onChangePaymentState,
      onLIOChangePaymentState
    );

    onLoad();

    return () => {
      listenerChangeServiceState.remove();
      listenerChangePaymentState.remove();
    };
  }, []);

  const onLoad = () => {
    Lio.setup('YOUR_CLIENT_ID', 'YOUR_ACCESS_TOKEN');
    Lio.getMachineInformation();
  };

  const onLIOChangeServiceState = ({
    stateService,
  }: {
    stateService: number;
  }) => {
    switch (stateService) {
      case Lio.ServiceState.ACTIVE:
        setServiceState('Conectado a máquina');
        break;

      case Lio.ServiceState.ERROR:
        setServiceState('Erro ao conectar à máquina');
        break

      case Lio.ServiceState.INACTIVE:
        setServiceState('Máquina inativa');
        break;
      default:
        setServiceState('DESCONHECIDO');
    }
    setLoading(false);
  };

  const onLIOChangePaymentState = async ({
    paymentState,
  }: {
    paymentState: number;
  }) => {
    switch (paymentState) {
      case Lio.PaymentState.DONE:
        break;

      case Lio.PaymentState.CANCELLED:
        setLoading(false);
        break;

      case Lio.PaymentState.ERROR:
        setLoading(false);
        break;

      case Lio.PaymentState.START:
        break;
      default:
        setLoading(false);
        break;
    }
  };

  const onPressPaymentForm = (paymentForm: string) => {
    switch (paymentForm) {
        case PAYMENT_FORMS.CASH_CREDIT:
            hasCardPaymentRequest = true
            setLoading(true)
            const availableInstallments = hasOrderBump ? product.credit.installmentsBump : product.credit.installments
            const crashCreditInstallment = availableInstallments.find((installment) => installment.installments === 1)
            Lio.requestPaymentCrashCredit(crashCreditInstallment.installmentAmount, clientInfo.session)
            break

        case PAYMENT_FORMS.CREDIT_INSTALLMENT:
            navigation.navigate(PathRoutes.INSTALLMENTS, { visionType, clientInfo, title, hasOrderBump, orderbump })
            break
        case PAYMENT_FORMS.DEBIT:
            hasCardPaymentRequest = true
            setLoading(true)
            Lio.requestPaymentDebit(hasOrderBump ? orderbump.amount : product.price, clientInfo.session)
            break
        case PAYMENT_FORMS.PIX:
            clearTimeout(timeout)
            navigation.navigate(PathRoutes.PAYMENT_QR_CODE, { visionType, clientInfo, title, orderbump, createTimeout, hasRequestPaymentAnotherApp })
            break

        default:
            break
    }
}

  return (
    <View style={styles.container}>
      <Text>{`Status: ${serviceState}`}</Text>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
