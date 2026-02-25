# react-native-lio

React Native library for Cielo LIO deeplink integration. Supports payments, reversals, printing, device information, and order management.

## Features

- ✅ **Device Information** - Get LIO terminal details (serial number, merchant code, battery level, etc.)
- ✅ **Payments** - Process debit and credit payments (cash and installments)
- ✅ **Reversals** - Cancel/reverse payments
- ✅ **Print** - Print receipts and custom text with styling options
- ✅ **Orders** - List and filter orders with payment information
- ✅ **Promise-based API** - Clean async/await interface
- ✅ **TypeScript** - Full type definitions included

## Installation

```bash
yarn add react-native-lio
# or
npm install react-native-lio
```

## Android Setup

### 1. settings.gradle

Add the module to `android/settings.gradle`:

```gradle
include ':react-native-lio'
project(':react-native-lio').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-lio/android')
```

### 2. app/build.gradle

Add the dependency in `android/app/build.gradle`:

```gradle
dependencies {
    implementation project(':react-native-lio')
    // ... other dependencies
}
```

### 3. AndroidManifest.xml

Add queries and intent-filters in `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <queries>
        <!-- Allow interaction with Cielo Smart Order Service -->
        <package android:name="br.com.cielosmart.orderservice" />
        <!-- Allow querying apps that respond to lio:// deeplinks -->
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="lio" />
        </intent>
    </queries>

    <application>
        <meta-data
            android:name="cs_integration_type"
            android:value="uri" />

        <activity
            android:name=".MainActivity"
            android:launchMode="singleTask">

            <!-- Intent filters to receive LIO responses -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="lio" android:host="payment-response" />
                <data android:scheme="lio" android:host="reversal-response" />
                <data android:scheme="lio" android:host="print-response" />
                <data android:scheme="lio" android:host="terminalinfo-response" />
                <data android:scheme="lio" android:host="orders-response" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### 4. MainActivity.kt

Configure deeplink handling in `android/app/src/main/java/com/[your-app]/MainActivity.kt`:

```kotlin
import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.reactnativelio.LioDeepLinkModule

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
        handleDeepLink(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    private fun handleDeepLink(intent: Intent?) {
        intent?.data?.let { uri ->
            val lioModule = LioDeepLinkModule.getInstance()
            lioModule?.handleDeepLinkResponse(uri)
        }
    }
}
```

### 5. MainApplication.kt

Register the package in `android/app/src/main/java/com/[your-app]/MainApplication.kt`:

```kotlin
import com.reactnativelio.LioDeepLinkPackage

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    add(LioDeepLinkPackage())
                }
        }
}
```

## Usage

### Import

```typescript
import Lio from 'react-native-lio';
import { LioOrderStatus } from 'react-native-lio';
```

### 1. Get Device Information

```typescript
const deviceInfo = await Lio.getDeviceInfo({
    clientID: 'your_client_id',
    accessToken: 'your_access_token',
});

console.log(deviceInfo);
// {
//   serialNumber: "99999999-9",
//   logicNumber: "99999999-9",
//   imeiNumber: "UNDEFINED",
//   deviceModel: "UNDEFINED",
//   merchantCode: "9999999999999999",
//   responseCode: 0,
//   batteryLevel: 1
// }
```

### 2. Send Payment

```typescript
const payment = await Lio.sendPayment({
    clientID: 'your_client_id',
    accessToken: 'your_access_token',
    value: 10000, // R$ 100.00 in cents
    installments: 0, // 0 for debit or cash credit
    paymentCode: 'DEBITO_AVISTA', // or 'CREDITO_AVISTA', 'CREDITO_PARCELADO'
    email: 'customer@email.com',
    items: [
        {
            id: 123456,
            sku: '123',
            name: 'Test Product',
            unit_price: 10000,
            quantity: 1,
            unitOfMeasure: 'unit'
        }
    ]
});
```

**Payment Codes:**
- `DEBITO_AVISTA` - Debit
- `CREDITO_AVISTA` - Credit (cash)
- `CREDITO_PARCELADO` - Credit (installments - use `installments` field)

**Example with Installments:**

```typescript
const payment = await Lio.sendPayment({
    clientID: 'your_client_id',
    accessToken: 'your_access_token',
    value: 30000, // R$ 300.00
    installments: 3, // 3 installments
    paymentCode: 'CREDITO_PARCELADO',
    email: 'customer@email.com',
    items: [
        {
            id: 123456,
            sku: '123',
            name: 'Test Product',
            unit_price: 30000,
            quantity: 1,
            unitOfMeasure: 'unit'
        }
    ]
});
```

### 3. Cancel Payment

```typescript
const reversal = await Lio.sendReversal({
    clientID: 'your_client_id',
    accessToken: 'your_access_token',
    orderId: '12345',
    value: 10000,
    authCode: 'authorization_code',
    cieloCode: 'cielo_code'
});
```

### 4. Print

```typescript
const print = await Lio.sendPrint({
    clientID: 'your_client_id',
    accessToken: 'your_access_token',
    operation: 'PRINT_TEXT',
    styles: [
        {
            key_attributes_align: 0, // 0=Center, 1=Left, 2=Right
            key_attributes_textsize: 20,
            key_attributes_typeface: 1, // 0 to 8
        }
    ],
    value: [
        'SALES RECEIPT\n',
        '====================\n',
        `Date: ${new Date().toLocaleDateString()}\n`,
        'Amount: R$ 100.00\n',
        'Status: Approved\n',
        '====================\n'
    ]
});
```

**Style Attributes:**

| Attribute | Description | Values |
|----------|-----------|---------|
| `key_attributes_align` | Text alignment | 0 (Center), 1 (Left), 2 (Right) |
| `key_attributes_textsize` | Text size | Integer |
| `key_attributes_typeface` | Font type | 0 to 8 |
| `key_attributes_marginleft` | Left margin | Integer |
| `key_attributes_marginright` | Right margin | Integer |
| `key_attributes_margintop` | Top margin | Integer |
| `key_attributes_marginbottom` | Bottom margin | Integer |
| `key_attributes_linespace` | Line spacing | Integer |
| `key_attributes_weight` | Column weight (multi-column) | Integer |
| `form_feed` | Spacing after print | 0 (none), 1 (with) |

### 5. List Orders

```typescript
const orders = await Lio.getOrders({
    clientID: 'your_client_id',
    accessToken: 'your_access_token',
    onlyWithPayments: true, // filter only orders with payments (default: true)
    pageSize: 10,
    page: 0
});

if (orders.results && Array.isArray(orders.results)) {
    orders.results.forEach(order => {
        console.log(`Order: ${order.number}`);
        console.log(`Status: ${order.status}`);
        console.log(`Price: ${order.price}`);
    });
}
```

**Order Status:**

```typescript
import { LioOrderStatus } from 'react-native-lio';

LioOrderStatus.PAID        // 'PAID'
LioOrderStatus.ENTERED     // 'ENTERED'
LioOrderStatus.DRAFT       // 'DRAFT'
LioOrderStatus.CLOSED      // 'CLOSED'
LioOrderStatus.RE_ENTERED  // 'RE-ENTERED'
```

## API Reference

### TypeScript Types

```typescript
// Payment Parameters
interface LioPaymentParams {
    clientID: string;
    accessToken: string;
    value: number; // in cents
    items: LioPaymentItem[];
    installments?: number;
    orderId?: string;
    email?: string;
    paymentCode?: string;
}

// Payment Item
interface LioPaymentItem {
    id?: number;
    sku: string;
    name: string;
    unit_price: number; // in cents
    quantity: number;
    unitOfMeasure: string;
}

// Device Information Response
interface LioDeviceInfoResponse {
    serialNumber?: string;
    logicNumber?: string;
    imeiNumber?: string;
    deviceModel?: string;
    merchantCode?: string;
    responseCode?: number;
    batteryLevel?: number;
}

// Reversal Parameters
interface LioReversalParams {
    clientID: string;
    accessToken: string;
    orderId: string;
    value: number;
    authCode?: string;
    cieloCode?: string;
}

// Print Parameters
interface LioPrintParams {
    clientID: string;
    accessToken: string;
    operation: 'PRINT_TEXT';
    styles?: LioPrintStyle[];
    value: string[];
}

// Print Style
interface LioPrintStyle {
    key_attributes_align?: 0 | 1 | 2;
    key_attributes_textsize?: number;
    key_attributes_typeface?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    key_attributes_marginleft?: number;
    key_attributes_marginright?: number;
    key_attributes_margintop?: number;
    key_attributes_marginbottom?: number;
    key_attributes_linespace?: number;
    key_attributes_weight?: number;
    form_feed?: 0 | 1;
}

// Orders Parameters
interface LioOrdersParams {
    clientID: string;
    accessToken: string;
    onlyWithPayments?: boolean; // default: true
    pageSize?: number;
    page?: number;
}

// Order Status
enum LioOrderStatus {
    PAID = 'PAID',
    ENTERED = 'ENTERED',
    DRAFT = 'DRAFT',
    CLOSED = 'CLOSED',
    RE_ENTERED = 'RE-ENTERED'
}

// Generic Response
interface LioResponse {
    success?: boolean;
    error?: string;
    [key: string]: any;
}
```

### Methods

#### `getDeviceInfo(params: LioDeviceInfoParams): Promise<LioDeviceInfoResponse>`
Get LIO terminal information including serial number, merchant code, battery level, and device model.

#### `sendPayment(params: LioPaymentParams): Promise<LioResponse>`
Send payment request to LIO terminal. Returns payment result with transaction details.

#### `sendReversal(params: LioReversalParams): Promise<LioResponse>`
Cancel/reverse a previous payment transaction.

#### `sendPrint(params: LioPrintParams): Promise<LioResponse>`
Print custom text with optional styling. Supports multiple text alignment, fonts, and margins.

#### `getOrders(params: LioOrdersParams): Promise<LioOrdersResponse>`
List orders from LIO terminal with optional filtering by payment status and pagination.

## Troubleshooting

### Error: NO_HANDLER

This means the Cielo LIO app is not responding. Check:
1. If `br.com.cielosmart.orderservice` app is installed on the device
2. If credentials (`clientID` and `accessToken`) are correct
3. If `queries` are configured in AndroidManifest.xml

### Module not found

If you get "Module not found" error, run:

```bash
cd android && ./gradlew clean && cd ..
yarn android
```

### Deeplink not being received

Check if:
1. MainActivity `launchMode` is set to `singleTask` in AndroidManifest.xml
2. Intent-filters are configured correctly
3. `handleDeepLink` method is being called in both `onCreate` and `onNewIntent`

## Official Documentation

For more details about Cielo LIO deeplink integration, see:
https://developercielo.github.io/manual/cielo-lio#integração-via-deep-link

## License

Unlicense
