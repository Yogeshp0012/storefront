import { Component, effect, inject, OnInit } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';
import { FormsModule } from '@angular/forms';
import { RazorpayService } from '../razorpay.service';
import { Router, RouterModule } from '@angular/router';
import { Utils } from '../utils/Utils';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  private readonly medusa: MedusaClientService = inject(MedusaClientService);
  private readonly razorPay: RazorpayService = inject(RazorpayService);
  private readonly router: Router = inject(Router);

  user = this.medusa.user;
  cart: any = this.medusa.cart;
  tax: number = 0;
  shipping: any = 'Calculated after entering address';

  addressIsLoading: boolean = false;
  address_city: string = '';
  address_country: string = 'IN';
  address_state: string = 'Karnataka';
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
  couponCode: string = '';

  guestEmail: string = '';
  totalPrice: Number = 0;
  pageLoading: boolean = true;
  couponCodeInvalid: boolean = false;
  couponCodeValid: boolean = false;
  paymentProcessing: boolean = false;
  disableButton: boolean = false;

  stateList: string[] = [
    'Andaman and Nicobar Islands',
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chandigarh',
    'Chhattisgarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jammu and Kashmir',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Ladakh',
    'Lakshadweep',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'NCT of Delhi',
    'Odisha',
    'Puducherry',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttarakhand',
    'Uttar Pradesh',
    'West Bengal',
  ];

  constructor() {
    effect(() => {
      this.user = this.medusa.user;
      this.cart = this.medusa.cart;
      if (this.cart()) {
        if (this.cart().subtotal === 0) {
          this.router.navigate(['/']);
        }
        if (this.couponCodeValid && this.cart().subtotal > 200000) {
          this.surfaceCost = 0;
          this.couponCodeValid = true;
          this.shipping = 'Free';
          this.totalPrice = this.cart().subtotal / 100;
        } else {
            this.couponCodeValid = false;
          if (this.address_zipcode !== '') {
            this.calculateShippingCost();
          } else {
            this.shippingCostCalculated = false;
            this.shipping = 'Calculated after entering address';
          }
        }
        this.tax = (this.cart().subtotal * 0.05) / (1 + 0.05);
        this.totalPrice = this.cart().subtotal / 100;
        this.pageLoading = false;
      }
    });
  }

  applyCouponCode() {
    this.couponCodeInvalid = false;
    if (this.couponCode === 'VASTRAGRAH' && this.cart().subtotal > 200000) {
      this.surfaceCost = 0;
      this.couponCodeValid = true;
      this.shipping = 'Free';
      this.totalPrice = this.cart().subtotal / 100;
    } else {
      this.couponCodeInvalid = true;
      if (this.address_zipcode !== '') {
        this.calculateShippingCost();
      } else {
        this.shippingCostCalculated = false;
        this.shipping = 'Calculated after entering address';
      }
    }
  }

  makePayment() {
    this.paymentProcessing = true;
    this.addressErrorMessage = '';
    if (!this.user() && !Utils.validateEmail(this.guestEmail)) {
      this.addressErrorMessage = 'Please enter a valid email address.';
      this.paymentProcessing = false;
      return;
    }
    if (
      this.address_city === '' ||
      this.address_phone === '' ||
      this.address_state === '' ||
      this.address_zipcode === '' ||
      this.address_firstName === '' ||
      this.address_lastName === '' ||
      this.address_company === '' ||
      this.address_address1 === ''
    ) {
      this.addressErrorMessage = 'Please enter all the details.';
      this.paymentProcessing = false;
      return;
    }
    if (this.address_phone.length < 10 || this.address_phone.length > 12) {
      this.addressErrorMessage = 'Please enter a valid phone number';
      this.paymentProcessing = false;
      return;
    }
    if (!this.shippingCostCalculated) {
      this.addressErrorMessage = 'Please enter a valid zipcode.';
      this.paymentProcessing = false;
      return;
    }
    this.razorPay.createOrder(this.totalPrice).subscribe({
      next: (data: any) => {
        this.medusa.addShippingMethod(this.cart().id, this.surfaceCost).then(({ cart }: { cart: any }) => {
          if (!this.user()) {
            this.medusa.mergeCart(this.guestEmail, this.cart().id).then(() => {
              this.razorPay
                .payNow(
                  data.order.id,
                  this.totalPrice,
                  this.address_firstName + ' ' + this.address_lastName,
                  this.guestEmail,
                  this.address_phone,
                )
                .then((data) => {
                    let orderId = data.id;
                    this.medusa.sendOrderEmail(this.cart().items,this.address_firstName+" "+this.address_lastName,this.address_address1+" "+this.address_address2 + " " + this.address_city + " " + this.address_state + " " + this.address_zipcode,this.guestEmail,orderId,(this.tax/100).toFixed(2),this.surfaceCost,(this.totalPrice).toFixed(2),data.created_at).subscribe({
                        next: (data: any) => {
                            this.paymentProcessing = false;
                            this.router.navigate(['/confirmOrder']);
                        },
                        error: (error) => {},
                    });
                })
                .catch((error) => {
                  this.paymentProcessing = false;
                });
            });
          } else {
            this.razorPay
              .payNow(
                data.order.id,
                this.totalPrice,
                this.address_firstName + ' ' + this.address_lastName,
                this.user().email,
                this.address_phone,
              )
              .then((data) => {
                let orderId = data.id;
                this.medusa.sendOrderEmail(this.cart().items,this.address_firstName+" "+this.address_lastName,this.address_address1+" "+this.address_address2 + " " + this.address_city + " " + this.address_state + " " + this.address_zipcode,this.user().email,orderId,(this.tax/100).toFixed(2),this.surfaceCost,(this.totalPrice).toFixed(2),data.created_at).subscribe({
                    next: (data: any) => {
                        this.paymentProcessing = false;
                        this.router.navigate(['/order/' + orderId]);
                    },
                    error: (error) => {},
                });
              })
              .catch((error) => {
                this.paymentProcessing = false;
              });
          }
        });
      },
      error: (error) => {
        console.log(error);
        this.paymentProcessing = false;
      },
    });
  }


  selectAddress(address: any) {
    this.address_city = address.city;
    this.address_phone = address.phone;
    this.address_state = address.province;
    this.address_zipcode = address.postal_code;
    this.address_firstName = address.first_name;
    this.address_lastName = address.last_name;
    this.address_company = address.company;
    this.address_address1 = address.address_1;
    this.address_address2 = address.address_2;
    this.calculateShippingCost();
  }

  onZipcodeChange(zipcode: string) {
    this.shippingCostCalculated = false;
    this.addressErrorMessage = '';
    setTimeout(() => {
        if (this.address_zipcode.length === 6) {
            this.calculateShippingCost();
        } else {
            this.addressErrorMessage = 'Not deliverable to this address';
            this.shippingCostCalculated = false;
            this.totalPrice = this.cart().subtotal / 100;
        }
    }, 0);
}

  calculateShippingCost() {
    this.disableButton = true;
    this.shippingCostCalculated = false;
    this.addressErrorMessage = '';
    this.totalPrice = this.cart().subtotal / 100;
    if (this.couponCodeValid && this.cart().subtotal > 200000) {
      this.surfaceCost = 0;
      this.shipping = 'Free';
      this.totalPrice = this.cart().subtotal / 100;
      this.shippingCostCalculated = true;
      this.disableButton = false;
      return;
    }
    this.medusa.calculateShippingCost(this.address_zipcode, 'S', 300).subscribe({
      next: (data: any) => {
        this.surfaceCost = data[0].total_amount;
        this.shipping = data[0].total_amount;
        this.shippingCostCalculated = true;
        this.totalPrice = this.totalPrice + data[0].total_amount;
        this.medusa.updateCartAddress(this.cart().id, {
            first_name: this.address_firstName,
            last_name: this.address_lastName,
            phone: this.address_phone,
            company: this.address_company,
            address_1: this.address_address1,
            address_2   : this.address_address2,
            city: this.address_city,
            province: this.address_state,
            postal_code: this.address_zipcode,
        }).then(({cart}: {cart: any}) => {
            this.disableButton = false;
        })
      },
      error: (error) => {
        this.addressErrorMessage = 'Not deliverable to this address';
        this.shippingCostCalculated = false;
        this.shipping = 'Calculated after entering address';
        this.totalPrice = this.cart().subtotal / 100;
        this.disableButton = false;
      },
    });
  }
}
