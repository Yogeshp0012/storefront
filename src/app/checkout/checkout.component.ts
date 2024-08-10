import { Component, effect, inject } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';
import { FormsModule } from '@angular/forms';
import { RazorpayService } from '../razorpay.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {

    private readonly medusa: MedusaClientService = inject(MedusaClientService);
    private readonly razorPay: RazorpayService = inject(RazorpayService);


    user = this.medusa.user;
    cart: any = this.medusa.cart;
    tax: number = 0;
    shipping: any = 'Calculated after entering address';

    addressIsLoading: boolean = false;
    address_city: string = '';
    address_country: string = 'IN';
    address_state: string = '';
    address_zipcode: string = '';
    address_firstName: string = '';
    address_lastName: string = '';
    address_phone: string = '';
    address_company: string = '';
    address_address1: string = '';
    address_address2: string = '';
    address_metadata: {} = {};
    addressErrorMessage: string = '';
    shippingCostCalculated: boolean = false;
    shippingSelected: boolean = false;
    surfaceCost: number = 0;
    expressCost: number = 0;

    constructor(){
        effect(() => {
            this.user = this.medusa.user;
            console.log(this.user())
            this.cart = this.medusa.cart;
            if(this.cart()){
                this.tax = this.cart().subtotal * 0.05;
            }
        })
    }

    makePayment(){
        this.addressErrorMessage = '';
        if(this.address_city === ''||
        this.address_phone === ''||
        this.address_state === ''||
        this.address_zipcode === ''||
        this.address_firstName === ''||
        this.address_lastName === ''||
        this.address_company === ''||
        this.address_address1 === ''
     ){
        this.addressErrorMessage = 'Please enter all the details.';
        return;
        }
        if(this.address_phone.length < 10 || this.address_phone.length > 12){
            this.addressErrorMessage = 'Please enter a valid phone number';
            return;
        }
        if(!this.shippingCostCalculated){
            this.addressErrorMessage = 'The address is not serviceable. Please enter a valid zipcode';
            return;
        }
        this.razorPay.createOrder().subscribe({
            next: (data: any) => {
                this.razorPay.payNow(data.order.id);
            },
            error: (error) => {
                console.log(error);
            }
        });
    }

    selectAddress(address: any){
        this.address_city = address.city;
        this.address_phone = address.phone;
        this.address_state = address.province;
        this.address_zipcode = address.postal_code;
        this.address_firstName = address.first_name;
        this.address_lastName = address.last_name;
        this.address_company = address.company;
        this.address_address1 = address.address_1;
        this.address_address2 = address.address_2;
    }

    calculateShippingCost(){
        this.shippingCostCalculated = false;
        this.medusa.calculateShippingCost(this.address_zipcode,"S",300).subscribe({
            next: (data: any) => {
                this.surfaceCost = data[0].total_amount;
                this.shippingCostCalculated = true;
            },
            error: (error) => {
                console.log(error);
            }
        })

        this.medusa.calculateShippingCost(this.address_zipcode,"E",300).subscribe({
            next: (data: any) => {
                console.log(data);
                this.expressCost = data[0].total_amount;
                this.shippingCostCalculated = true;
            },
            error: (error) => {
                console.log(error);
            }
        })
    }
}
