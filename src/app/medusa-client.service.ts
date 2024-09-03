import { computed, inject, Injectable, signal } from '@angular/core';
import Medusa, { Config } from '@medusajs/medusa-js';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MedusaClientService {
  private readonly http: HttpClient = inject(HttpClient);

  medusa: any;

  #user = signal<any>(null);
  user = computed(this.#user);

  #cart = signal<any>(null);
  cart = computed(this.#cart);

  constructor() {
    let config: Config = { baseUrl: environment.BACKEND_URL, maxRetries: 3 };
    this.medusa = new Medusa(config);
  }

  getCollections() {
    return this.medusa.collections.list();
  }

  getProducts(collectionId: string, limit: number = 4) {
    return this.medusa.products.list({ collection_id: [collectionId], limit });
  }

  retrieveProduct(productHandle: string) {
    return this.medusa.products.list({ handle: productHandle });
  }

  searchProducts(query: string) {
    return this.medusa.products.search({
      q: query,
    });
  }

  getAllProducts(limit: number = 4) {
    return this.medusa.products.list({ limit });
  }

  //Authentication
  login(email: string, password: string) {
    return this.medusa.auth
      .authenticate({ email, password })
      .then(({ customer }: { customer: any }) => {
        this.#user.set(customer);
        this.checkCart();
      });
  }

  emailExists(email: string) {
    return this.medusa.auth.exists(email);
  }

  createUser(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    phone: string,
  ) {
    return this.medusa.customers
      .create({ first_name, last_name, email, password, phone })
      .then(({ customer }: { customer: any }) => {
        this.#user.set(customer);
        this.checkCart();
      });
  }

  checkUserLoggedIn() {
    return this.medusa.auth
      .getSession()
      .then(({ customer }: { customer: any }) => {
        this.#user.set(customer);
      })
      .catch((err: any) => {});
  }

  logout() {
    return this.medusa.auth.deleteSession().then((data: any) => {
      this.#user.set(null);
    });
  }

  updatePassword(email: string, password: string, token: string) {
    return this.medusa.customers
      .resetPassword({
        email,
        password,
        token,
      })
      .then(({ customer }: { customer: any }) => {

      });
  }

  generatePasswordToken(email: string) {
    this.medusa.customers.generatePasswordToken({ email });
  }

  //Cart Options
  createCart() {
    return this.medusa.carts.create();
  }

  retrieveCart(id: string) {
    return this.medusa.carts.retrieve(id);
  }

  //Send emails
  sendPasswordToken(email: string, code: string) {
    return this.http.post(`${environment.BACKEND_URL}/store/request-password`, { email, code });
  }

  sendOrderEmail(
    items: any,
    name: any,
    address: any,
    email: any,
    orderId: any,
    tax: any,
    shipping: any,
    total: any,
    date: any,
  ) {
    return this.http.post(`${environment.BACKEND_URL}/store/orderEmail`, {
      'items': [...items],
      'name': name,
      'address': address,
      'deliverymethod': 'Standard',
      'paymentMode': 'Online',
      'email': email,
      'orderId': orderId,
      'tax': tax,
      'shipping': shipping,
      'total': total,
      'date': new Date(date).toLocaleString(),
    });
  }

  sendSignUpEmail(email: string, name: string) {
    return this.http.post(`${environment.BACKEND_URL}/store/signup-email`, { email, name });
  }

  mergeCart(email: string, cartId: string) {
    return this.medusa.carts.update(cartId, {
      email: email,
    });
  }

  updateCartAddress(cartId: string, address: any) {
    return this.medusa.carts.update(cartId, {
      shipping_address: { ...address },
    });
  }

  getCartId() {
    return localStorage.getItem('cart_id');
  }

  clearCart() {
    localStorage.removeItem('cart_id');
    this.checkCart();
  }

  createPaymentSession() {
    this.medusa.carts.createPaymentSessions(this.getCartId()).then(({ cart }: { cart: any }) => {

    });
  }

  refreshPaymentSession(cartId: string) {
    return this.medusa.carts
      .deletePaymentSession(cartId, 'manual')
      .then(({ cart }: { cart: any }) => {

      });
  }

  checkCart() {
    const id = this.getCartId();
    if (id) {
      this.retrieveCart(id).then(({ cart }: { cart: any }) => {
        this.#cart.set(cart);
        if (this.user() && !cart.email) {
          this.mergeCart(cart.id, this.user().customer.email)
            .then(({ cart }: { cart: any }) => {

              this.#cart.set(cart);
            })
            .catch((err: any) => {
              console.log(err);
            });
        }
      }).catch((err: any) =>{
        this.clearCart();
      });
    } else {
      this.createCart().then(({ cart }: { cart: any }) => {
        localStorage.setItem('cart_id', cart.id);
        this.#cart.set(cart);

        if (this.user() && !cart.email) {
          this.mergeCart(cart.id, this.user().customer.email)
            .then(({ cart }: { cart: any }) => {

              this.#cart.set(cart);
            })
            .catch((err: any) => {
              console.log(err);
            });
        }
      });
    }
  }

  addToCart(variant_id: string, quantity: number) {
    return this.medusa.carts.lineItems
      .create(this.getCartId(), {
        variant_id,
        quantity,
      })
      .then(({ cart }: { cart: any }) => {
        this.#cart.set(cart);
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  removeFromCart(lineId: string) {
    return this.medusa.carts.lineItems
      .delete(this.getCartId(), lineId)
      .then(({ cart }: { cart: any }) => {
        this.#cart.set(cart);
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  subscribe(email: string) {
    return this.http.post(`${environment.BACKEND_URL}/store/subscribe`, { email });
  }

  updateProfile(
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    password: string = '',
  ) {
    if (password == '') {
      return this.medusa.customers
        .update({ first_name, last_name, email, phone })
        .then(({ customer }: { customer: any }) => {
          this.#user.set(customer);
        });
    } else {
      return this.medusa.customers
        .update({ first_name, last_name, email, password, phone })
        .then(({ customer }: { customer: any }) => {
          this.#user.set(customer);
        });
    }
  }

  addAddress(address: any) {
    return this.medusa.customers.addresses
      .addAddress({
        address: {
          ...address,
        },
      })
      .then(({ customer }: { customer: any }) => {
        this.#user.set(customer);
      });
  }

  updateAddress(addressId: any, address: any) {
    return this.medusa.customers.addresses
      .updateAddress(addressId, {
        ...address,
      })
      .then(({ customer }: { customer: any }) => {
        this.#user.set(customer);
      });
  }

  deleteAddress(addressId: any) {
    return this.medusa.customers.addresses
      .deleteAddress(addressId)
      .then(({ customer }: { customer: any }) => {
        this.#user.set(customer);
      });
  }

  completeCart(cartId: string) {
    return this.medusa.carts.complete(cartId);
  }

  deletePaymentSession(cartId: string) {
    return this.medusa.carts
      .deletePaymentSession(cartId, 'manual')
      .then(({ cart }: { cart: any }) => {
        this.clearCart();
      });
  }

  retrieveOrder(orderId: string) {
    return this.medusa.orders.retrieve(orderId);
  }

  calculateShippingCost(pincode: any, mode: string, grams: number) {
    return this.http.post(`${environment.BACKEND_URL}/store/shipping`, { pincode, grams, mode });
  }

  lookupOrder(orderId: string) {
    return this.medusa.orders.retrieve(orderId);
  }

  addShippingMethod(cartId: any, shippingCost: any) {
    return this.medusa.carts.addShippingMethod(cartId, {
      option_id: "so_01J6WCXB14FWR3WYE8ACV9RSXP",
      data: {
        shipping_cost: shippingCost,
      },
    });
  }
}
