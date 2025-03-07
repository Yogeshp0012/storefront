import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MedusaClientService } from './medusa-client.service';

@Injectable({
    providedIn: 'root'
})
export class RazorpayService {

    private http: HttpClient = inject(HttpClient);
    private medusa: MedusaClientService = inject(MedusaClientService);
    private router: Router = inject(Router);

    private apiUrl = 'http://localhost:9000/store/createOrder';

    createOrder(amount: any) {
        amount = Math.floor(amount);
        return this.http.post(`${environment.BACKEND_URL}/store/createOrder`, {amount: amount});
    }


    payNow(orderId: string, orderAmount: number, customerName: string, customerEmail: string, customerPhone: string): Promise<any> {
        return this.medusa.createPaymentSession().then(() => {
        return new Promise((resolve, reject) => {
            const options = {
                key: environment.RAZORPAY_KEY,
                amount: orderAmount,
                currency: 'INR',
                name: 'Vastragrah',
                description: `Transaction for order ${orderId}`,
                order_id: orderId,
                prefill: {
                    name: customerName,
                    email: customerEmail,
                    contact: customerPhone
                },
                handler: (response: any) => {
                    // Validate the order
                    this.http.post(`${environment.BACKEND_URL}/store/validateOrder`, { ...response }).subscribe({
                        next: () => {
                            // Fetch cart ID
                            this.medusa.getCartId().subscribe({
                                next: (cartId) => {
                                    if (!cartId) {
                                        reject('Failed to retrieve cart ID');
                                        return;
                                    }
                                    // Complete the cart
                                    this.medusa.completeCart(cartId).then(({ data }: { data: any }) => {
                                        // Delete payment session
                                        this.medusa.deletePaymentSession(cartId).then(() => {
                                            resolve(data); // Resolve with the response data
                                        }).catch((error: any) => reject(`Error deleting payment session: ${error}`));
                                    }).catch((error: any) => reject(`Error completing cart: ${error}`));
                                },
                                error: (err) => {
                                    console.error('Error fetching cart ID:', err);
                                    reject(err); // Reject with error if fetching cart ID fails
                                }
                            });
                        },
                        error: (err) => {
                            console.error('Error validating order:', err);
                            reject(err); // Reject with error if order validation fails
                        }
                    });
                },
                modal: {
                    ondismiss: () => {
                        reject('Payment cancelled'); // Reject when the payment modal is dismissed
                    }
                },
                theme: {
                    color: '#166534'
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response: any) => {
                console.error('Payment failed:', response.error);
            });
            rzp.open();
        });
    });
    }

}
