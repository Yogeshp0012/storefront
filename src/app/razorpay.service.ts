import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

    createOrder() {
        return this.http.post(`${environment.BACKEND_URL}/store/createOrder`, {});
    }

    payNow(orderId: string) {
        this.medusa.createPaymentSession();
        let that = this;
        const options = {
            key: 'rzp_test_KEIgI2f7IkBcGx', // Replace with your Razorpay key_id
            amount: '50000', // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            currency: 'INR',
            name: 'Acme Corp',
            description: 'Test Transaction',
            order_id: orderId,
            prefill: {
                name: 'Gaurav Kumar',
                email: 'gaurav.kumar@example.com',
                contact: '9999999999'
            },
            "handler": function (response: any) {
                that.http.post(`${environment.BACKEND_URL}/store/validateOrder`, {
                    ...response
                }).subscribe((data: any) => {
                    let cartId = that.medusa.getCartId() as string
                    that.medusa.completeCart(cartId).then(({ data, type }: { data: any, type: any }) => {
                        that.medusa.deletePaymentSession(cartId).then(() => {
                            that.router.navigate(['/orders/' + data.id]);
                        });
                    })
                });
            },
            theme: {
                color: '#F37254'
            },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
            console.log(response.error.code);
            console.log(response.error.description);
            console.log(response.error.source);
            console.log(response.error.step);
            console.log(response.error.reason);
            console.log(response.error.metadata.order_id);
            console.log(response.error.metadata.payment_id);
        });
        rzp.open();
    }
}
