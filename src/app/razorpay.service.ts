import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient} from '@angular/common/http';
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

    payNow(orderId: string, orderAmount: Number, customerName: string, customerEmail: string, customerPhone: string): Promise<any> {
        this.medusa.createPaymentSession();
        let that = this;
        return new Promise((resolve, reject) => {
          const options = {
            key: 'rzp_test_KEIgI2f7IkBcGx', // Replace with your Razorpay key_id
            amount: orderAmount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            currency: 'INR',
            name: 'Vastragrah',
            description: 'Transaction for order orderId',
            order_id: orderId,
            prefill: {
              name: customerName,
              email: customerEmail,
              contact: customerPhone
            },
            "handler": function (response: any) {
              that.http.post(`${environment.BACKEND_URL}/store/validateOrder`, {
                ...response
              }).subscribe((data: any) => {
                let cartId = that.medusa.getCartId() as string;
                that.medusa.completeCart(cartId).then(({ data, type }: { data: any, type: any }) => {
                  that.medusa.deletePaymentSession(cartId).then(() => {
                    resolve(data); // Resolve the promise with the data
                  });
                });
              });
            },
            "modal": {
                "ondismiss": function () {
                    reject('Payment cancelled'); // Reject the promise with the error
                }
            },
            theme: {
              color: '#166534'
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response: any) {
            reject(response.error); // Reject the promise with the error
          });
          rzp.open();
        });
      }
}
