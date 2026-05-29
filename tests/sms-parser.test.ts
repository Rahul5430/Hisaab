import { parseSMSClient } from '../src/lib/parsers/sms';

describe('SMS parser', () => {
	type Expected = {
		amount: number | null;
		merchant: string | null;
		date: string | null;
		paymentMethod: 'upi' | 'card' | 'cash' | 'netbanking' | 'other' | null;
		time?: string | null;
	};

	const cases: Array<{
		label: string;
		sms: string;
		expected: Expected;
	}> = [
		{
			label: 'HDFC UPI debit',
			sms: 'You have done a UPI txn. Rs.340.00 debited from A/c XX1234 on 17-05-26. UPI Ref 123456789. If not you, call 1800111109',
			expected: { amount: 340, merchant: null, date: '2026-05-17', paymentMethod: 'upi' },
		},
		{
			label: 'ICICI Zomato UPI',
			sms: 'Dear Customer, INR 1,250.00 debited from your A/c XX5678 on 17-May-2026 for UPI transfer to zomato@icici. Avail Bal INR 45,230.00',
			expected: { amount: 1250, merchant: 'Zomato', date: '2026-05-17', paymentMethod: 'upi' },
		},
		{
			label: 'SBI trf to Swiggy',
			sms: 'Your A/c no. XX9012 is debited with Rs.500.00 on 17/05/26 trf to SWIGGY UPI Ref 987654321. If not done by you call 1800111109',
			expected: { amount: 500, merchant: 'Swiggy', date: '2026-05-17', paymentMethod: 'upi' },
		},
		{
			label: 'Axis Bank electricity bill',
			sms: 'Rs.2,000.00 debited from Axis Bank A/c XX3456 on 17-05-2026. Info: UPI/PHONEPE/ELECTRICITY BILL. Avail Bal: Rs.12,500.00',
			expected: { amount: 2000, merchant: null, date: '2026-05-17', paymentMethod: 'upi' },
		},
		{
			label: 'Kotak Netflix',
			sms: 'INR 899.00 debited from Kotak Bank A/c XX7890 towards Netflix on 17-05-2026. Available Balance INR 8,450.00',
			expected: { amount: 899, merchant: 'Netflix', date: '2026-05-17', paymentMethod: null },
		},
		{
			label: 'Generic UPI person name morning',
			sms: 'Rs.150.00 paid to Ramesh Kumar via UPI on 17-05-26 at 08:30 AM. UPI Ref 456789123',
			expected: { amount: 150, merchant: 'Ramesh Kumar', date: '2026-05-17', time: '08:30', paymentMethod: 'upi' },
		},
		{
			label: 'PhonePe Swiggy',
			sms: 'Money Sent! Rs.450 paid to Swiggy using PhonePe on 17-May-2026 at 07:45 PM. Transaction ID: 789456123',
			expected: { amount: 450, merchant: 'Swiggy', date: '2026-05-17', time: '19:45', paymentMethod: 'upi' },
		},
		{
			label: 'Google Pay Amazon',
			sms: 'You paid Rs.1,200 to Amazon via Google Pay on 17/05/2026. UPI transaction ID: 321654987',
			expected: { amount: 1200, merchant: 'Amazon', date: '2026-05-17', paymentMethod: 'upi' },
		},
		{
			label: 'HDFC credit card',
			sms: 'HDFC Bank: Rs.3,499.00 spent on HDFC Bank Credit Card XX4321 at MYNTRA on 17-05-2026. Available credit limit: Rs.96,501',
			expected: { amount: 3499, merchant: 'Myntra', date: '2026-05-17', paymentMethod: 'card' },
		},
		{
			label: 'Paytm wallet',
			sms: 'Rs.200.00 debited from Paytm Wallet on 17-05-2026. Paid to Dominos. Txn ID: PAY123456',
			expected: { amount: 200, merchant: "Domino's", date: '2026-05-17', paymentMethod: 'upi' },
		},
		{
			label: 'ICICI netbanking',
			sms: 'ICICI Bank: Rs.15,000.00 transferred via NEFT from your account XX1111 on 17-05-2026. Ref No: NEFT123456',
			expected: { amount: 15000, merchant: null, date: '2026-05-17', paymentMethod: 'netbanking' },
		},
		{
			label: 'Amount with no decimal',
			sms: 'Rs.50 debited from SBI A/c XX2222 on 17/05/26 trf to RAPIDO UPI Ref 111222333',
			expected: { amount: 50, merchant: 'Rapido', date: '2026-05-17', paymentMethod: 'upi' },
		},
		{
			label: 'Large amount with commas',
			sms: 'INR 1,25,000.00 debited from your Axis Bank A/c XX3333 on 17-05-2026 via NEFT. Available Balance: INR 4,50,000.00',
			expected: { amount: 125000, merchant: null, date: '2026-05-17', paymentMethod: 'netbanking' },
		},
		{
			label: 'Rupee symbol',
			sms: '₹599.00 debited from your A/c XX4444 on 17-05-26 for Spotify subscription. UPI Ref 444555666',
			expected: { amount: 599, merchant: 'Spotify', date: '2026-05-17', paymentMethod: 'upi' },
		},
		{
			label: 'Time in 24h format',
			sms: 'Rs.280.00 paid to OLA via UPI on 17-05-2026 at 18:45. Ref 777888999',
			expected: { amount: 280, merchant: 'Ola', date: '2026-05-17', time: '18:45', paymentMethod: 'upi' },
		},
	];

	for (const testCase of cases) {
		test(testCase.label, () => {
			const parsed = parseSMSClient(testCase.sms);
			expect(parsed.amount).toBe(testCase.expected.amount);
			expect(parsed.date).toBe(testCase.expected.date);
			expect(parsed.paymentMethod).toBe(testCase.expected.paymentMethod);

			if (testCase.expected.merchant === null) {
				expect(parsed.merchant).toBeNull();
			} else {
				expect(parsed.merchant?.trim().toLowerCase()).toBe(testCase.expected.merchant.trim().toLowerCase());
			}

			if (testCase.expected.time !== undefined) {
				expect(parsed.time).toBe(testCase.expected.time);
			}
		});
	}
});
