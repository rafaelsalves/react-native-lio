# react-native-lio

React Native library for Cielo LIO deeplink integration with support for payments, reversals, printing, device info, and order management.

## Features

- ✅ **Device Information** - Get LIO terminal details (serial number, merchant code, etc.)
- ✅ **Payments** - Process debit and credit payments with installments
- ✅ **Reversals** - Cancel/reverse payments
- ✅ **Print** - Print receipts and custom text
- ✅ **Orders** - List and filter orders with payment information
- ✅ **Foreground Service** - Keeps app active during LIO transactions
- ✅ **Promise-based API** - Clean async/await interface
- ✅ **TypeScript** - Full type definitions included

## Installation

```bash
npm install react-native-lio
# or
yarn add react-native-lio
```

## Usage

```typescript
import LioDeepLink from 'react-native-lio';

// Get device information
const deviceInfo = await LioDeepLink.getDeviceInfo({
    clientID: 'your_client_id',
    accessToken: 'your_access_token',
});

// Process payment
const paymentResult = await LioDeepLink.sendPayment({
    clientID: 'your_client_id',
    accessToken: 'your_access_token',
    value: 10000, // R$ 100.00 in cents
    installments: 1,
    items: [{
        sku: '123',
        name: 'Product',
        unit_price: 10000,
        quantity: 1,
        unit_of_measure: 'EACH'
    }]
});
```

## License

Unlicense
