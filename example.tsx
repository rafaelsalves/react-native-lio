/**
 * Usage example for the LioDeepLink module
 *
 * This file demonstrates how to use the module for:
 * - Get LIO machine information
 * - Send payment requests
 * - Send cancellation requests
 * - Send print requests
 * - Receive and handle responses
 */

import React, { useState } from 'react';
import { View, Button, Alert, Text, TextInput, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Lio from 'react-native-lio'
import { Picker } from '@react-native-picker/picker';

type Props = {
    base64Image?: string
}

const LioDeepLinkExample = (props: Props) => {
    const { base64Image = '' } = props
    const [logs, setLogs] = useState('')
    const [paymentValue, setPaymentValue] = useState('100.00')
    const [paymentType, setPaymentType] = useState<any>('DEBITO_AVISTA')
    const [installments, setInstallments] = useState('1')

    // Get LIO machine information
    const handleGetDeviceInfo = async () => {
        try {
            const response = await Lio.getDeviceInfo()

            if (response.error) {
                setLogs(JSON.stringify(response.error))
            } else {
                setLogs(JSON.stringify(response))
            }
        } catch (error) {
            setLogs(JSON.stringify(error))
        }
    }

    // List orders
    const handleGetOrders = async () => {
        try {
            const response = await Lio.getOrders({
                statusFilter: 'ALL'
            })

            if (response.error) {
                Alert.alert('Error', response.error);
            } else if (response.results && Array.isArray(response.results)) {
                setLogs(JSON.stringify(response.results))
            } else {
                Alert.alert('Orders', 'No orders found');
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to retrieve orders');
        }
    }

    const handlePayment = async () => {
        try {
            const valueInCents = Math.round(parseFloat(paymentValue) * 100);
            const numInstallments = paymentType === 'CREDITO_PARCELADO_LOJA' ? parseInt(installments) : 0;

            const result = await Lio.sendPayment({
                value: valueInCents,
                installments: numInstallments,
                email: "emaildocliente@email.com",
                paymentCode: paymentType,
                items: [
                    {
                        id: Date.now(),
                        sku: "123654",
                        name: "Test",
                        unit_price: valueInCents,
                        quantity: 1,
                        unitOfMeasure: "unit"
                    }
                ]
            });
            setLogs(JSON.stringify(result))
        } catch (error) {
            Alert.alert('Error', 'Unable to process payment');
        }
    }

    // Cancel payment (reversal)
    const handleReversal = async () => {
        try {
            await Lio.sendReversal({
                id: 'd110b026-f8fb-4e9f-b090-73f78ebae394',
                value: 600,
                authCode: 'lJNOiS',
                cieloCode: 'EIPWlN'
            })
        } catch (error) {
            Alert.alert('Error', 'Unable to cancel payment');
        }
    };

    // Print receipt
    const handlePrint = async () => {
        try {
            const imagePath = await Lio.saveBase64Image(base64Image, 'logo')
            await Lio.sendPrint({
                "operation": "PRINT_IMAGE",
                "styles": [{ key_attributes_align: 0, key_attributes_marginbottom: 30 }],
                "value": [imagePath]
            })

            await Lio.sendPrint({
                operation: 'PRINT_MULTI_COLUMN_TEXT',
                styles: [
                    {
                        "key_attributes_align": 1,
                        "key_attributes_textsize": 30,
                        "key_attributes_typeface": 0
                    },
                    {
                        "key_attributes_align": 0,
                        "key_attributes_textsize": 20,
                        "key_attributes_typeface": 1
                    },
                    {
                        "key_attributes_align": 2,
                        "key_attributes_textsize": 15,
                        "key_attributes_typeface": 2
                    }
                ],
                value: [
                    "Left-aligned text.\n\n\n",
                    "Centered text\n\n\n",
                    "Right-aligned text\n\n\n"
                ]
            })

            await Lio.sendPrint({
                "operation": "PRINT_TEXT",
                "styles": [{ form_feed: 1, key_attributes_align: 0 }],
                "value": ["TEXT TO PRINT ON FIRST LINE\nTEXT TO PRINT ON SECOND LINE\nTEXT TO PRINT ON THIRD LINE\n\n"]
            })

            await Lio.sendPrint({
                "operation": "PRINT_TEXT",
                "styles": [{ key_attributes_margintop: 40 }],
                "value": ["-"]
            })
        } catch (error) {
            Alert.alert('Error', 'Unable to print');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Button title="Get Machine Information" onPress={handleGetDeviceInfo} />
            <View style={{ height: 10 }} />

            <Button title="List Orders" onPress={handleGetOrders} />
            <View style={{ height: 20 }} />

            <Text style={styles.label}>Payment Configuration</Text>

            <Text style={styles.inputLabel}>Value (R$)</Text>
            <TextInput
                style={styles.input}
                value={paymentValue}
                onChangeText={setPaymentValue}
                keyboardType="decimal-pad"
                placeholder="100.00"
            />

            <Text style={styles.inputLabel}>Payment Type</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={paymentType}
                    onValueChange={setPaymentType}
                    style={styles.picker}
                >
                    <Picker.Item label="Debit" value="DEBITO_AVISTA" />
                    <Picker.Item label="Credit" value="CREDITO_AVISTA" />
                    <Picker.Item label="Installment Credit" value="CREDITO_PARCELADO_LOJA" />
                </Picker>
            </View>

            {paymentType === 'CREDITO_PARCELADO_LOJA' && (
                <>
                    <Text style={styles.inputLabel}>Number of Installments</Text>
                    <TextInput
                        style={styles.input}
                        value={installments}
                        onChangeText={setInstallments}
                        keyboardType="number-pad"
                        placeholder="1"
                    />
                </>
            )}

            <Button title="Send Payment" onPress={handlePayment} />
            <View style={{ height: 10 }} />

            <Button title="Cancel Payment" onPress={handleReversal} />
            <View style={{ height: 10 }} />

            <Button title="Print Receipt" onPress={handlePrint} />
            <View style={{ height: 20 }} />

            <Text style={styles.label}>Logs</Text>
            <Text style={styles.logs}>{logs}</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        marginBottom: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    picker: {
        height: 50,
    },
    logs: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        fontSize: 12,
        marginBottom: 50,
    },
});

export default LioDeepLinkExample;
