import { computed, inject, Injectable, signal } from '@angular/core';
import Medusa, { Config } from '@medusajs/medusa-js';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, map, Observable, of, switchMap, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MedusaClientService {
    private readonly http: HttpClient = inject(HttpClient);

    medusa: any;
    currentCartId: any = '';

    #user = signal<any>(null);
    user = computed(this.#user);

    #cart = signal<any>(null);
    cart = computed(this.#cart);

    #favourite = signal<any>(null);
    favourite = computed(this.#favourite);

    #cartLoading = signal<boolean>(false);
    cartLoading = computed(this.#cartLoading);

    constructor() {
        let config: Config = { baseUrl: environment.BACKEND_URL, maxRetries: 3 };
        this.medusa = new Medusa(config);
    }

    getVariantData(item: any) {
        return this.medusa.variants.retrieve(item.variant_id);
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
                this.clearCart();
                this.getAllWishlistItems();
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
                this.clearCart();
                this.getAllWishlistItems();
            });
    }

    checkUserLoggedIn() {
        return this.medusa.auth
            .getSession()
            .then(({ customer }: { customer: any }) => {
                this.#user.set(customer);
                return true;
            })
            .catch((err: any) => {
                this.#user.set(null);
                return false;
            });
    }

    logout() {
        return this.medusa.auth.deleteSession().then((data: any) => {
            this.#user.set(null);
            this.checkCart();
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

    getCouponDetails(affiliateId: string) {
        return this.http.post(`${environment.BACKEND_URL}/store/get-coupon-details`, {affiliateId });
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

    mergeCart(cartId: string, email: string) {
        return this.medusa.carts.update(cartId, {
            email: email,
        });
    }

    updateCartAddress(cartId: string, address: any) {
        return this.medusa.carts.update(cartId, {
            shipping_address: { ...address },
        });
    }

    private getLocalCartId(): Observable<string | null> {
        this.currentCartId = localStorage.getItem('cart_id');
        return of(this.currentCartId);
    }

    private handleCartIdResponse(message: string): string | null {
        this.currentCartId = message === "Cart Search Failed" ? null : message;
        return this.currentCartId;
    }

    private fetchCartIdByEmail(email: string): Observable<string | null> {
        return this.http.post<{ message: string }>(`${environment.BACKEND_URL}/store/cart-details`, { email })
            .pipe(
                map(data => this.handleCartIdResponse(data.message)),
                catchError(() => of(null))
            );
    }

    getCartId(): Observable<string | null> {
        if (this.user() && this.user().email) {
            return this.fetchCartIdByEmail(this.user().email);
        } else {
            return this.getLocalCartId();
        }
    }

    clearCart() {
        localStorage.removeItem('cart_id');
        this.checkCart();
    }

    createPaymentSession(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getCartId().subscribe({
                next: (cartId: any) => {
                    this.medusa.carts.createPaymentSessions(cartId).then(({ cart }: { cart: any }) => {
                        resolve(cart); // Resolve with the cart object
                    }).catch((error: any) => {
                        reject(error); // Reject with error if payment session creation fails
                    });
                },
                error: (err) => {
                    reject(err); // Reject with error if fetching cart ID fails
                }
            });
        });
    }


    refreshPaymentSession(cartId: string) {
        return this.medusa.carts
            .deletePaymentSession(cartId, 'manual')
            .then(({ cart }: { cart: any }) => {

            });
    }

    checkCart(): void {
        this.#cartLoading.set(true);
        this.getCartId().subscribe({
            next: async (cartId: string | null) => {
                try {
                    if (cartId) {
                        const { cart } = await this.retrieveCart(cartId);
                        await this.processExistingCart(cart);
                    } else {
                        const { cart } = await this.createCart();
                        await this.processNewCart(cart);
                    }
                } catch (error) {
                    console.error("Error in checkCart:", error);
                    this.clearCart();
                }
                this.#cartLoading.set(false);
            },
            error: (error) => {
                this.#cartLoading.set(false);
                console.error("Error fetching cart ID:", error);
            },
        });
    }

    private async processExistingCart(cart: any): Promise<void> {
        if (this.user() && this.user().email) {
            await this.addItemsToCart(cart.id);
            await this.mergeCartWithUser(cart.id, this.user().email);
        } else {
            this.#cart.set(cart);
        }
    }

    private async processNewCart(cart: any): Promise<void> {
        if (this.user() && this.user().email) {
            await this.addItemsToCart(cart.id);
            await this.saveCartToBackend(cart.id, this.user().email);
            await this.mergeCartWithUser(cart.id, this.user().email);
        } else {
            localStorage.setItem('cart_id', cart.id);
            this.#cart.set(cart);
        }
    }

    private async addItemsToCart(cartId: string): Promise<void> {
        if (this.cart() && this.cart().items) {
            for (const item of this.cart().items) {
                await this.medusa.carts.lineItems.create(cartId, {
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                });
            }
        }
    }

    private async mergeCartWithUser(cartId: string, email: string): Promise<void> {
        try {
            const { cart } = await this.mergeCart(cartId, email);
            this.#cart.set(cart);
        } catch (error) {
            console.error("Error merging cart with user:", error);
        }
    }

    private async saveCartToBackend(cartId: string, email: string): Promise<void> {
        try {
            await firstValueFrom(this.http.post(`${environment.BACKEND_URL}/store/save-cart`, { email, cartId }));
        } catch (error) {
            console.error("Error saving cart to backend:", error);
        }
    }


    getCurrentCartId() {
        if (this.currentCartId !== null || this.currentCartId !== '') {
            return this.currentCartId;
        }
    }

    getAffiliateLink(productId: string, email: string): Observable<any> {
        return this.getAffiliate(email).pipe(
            switchMap((data: any) => {
                if (data.message) {
                    return this.http.post(`${environment.BACKEND_URL}/store/create-affiliate-link`, {
                        productHandle: productId,
                        affiliateId: data.message.id
                    });
                } else {
                    return throwError('No affiliate ID found');
                }
            })
        );
    }

    alreadyPresentInCart(variant_id: string): Promise<number | null> {
        return new Promise((resolve, reject) => {
            this.getCartId().subscribe({
                next: (cartId: any) => {
                    this.medusa.carts.retrieve(cartId).then((data: any) => {
                        const item = data.cart.items.find((item: any) => item.variant.id === variant_id);
                        const quantity = item ? item.quantity : null;
                        resolve(quantity); // Return the quantity value
                    }).catch((error: any) => {
                        reject(error); // Handle errors from the Medusa API
                    });
                },
                error: (error) => {
                    reject(error); // Handle errors from getCartId()
                }
            });
        });
    }

    updateCartItems(lineId: string, quantity: number) {
        this.getCartId().subscribe({
            next: (cartId: any) => {
                this.medusa.carts.lineItems.update(cartId, lineId, {
                    quantity: quantity
                })
                    .then(({ cart }: { cart: any }) => {
                        this.#cart.set(cart);
                    })
            },
            error: (err: any) => {
                console.log(err);
            }
        })
    }

    addToCart(variant_id: string, quantity: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.getCartId().subscribe({
                next: (cartId: any) => {
                    this.medusa.carts.lineItems
                        .create(cartId, { variant_id, quantity })
                        .then(({ cart }: { cart: any }) => {
                            this.#cart.set(cart);
                            resolve(); // Resolve the promise when the operation is complete
                        })
                        .catch((err: any) => {
                            console.log(err);
                            reject(err); // Reject the promise if there's an error
                        });
                },
                error: (error) => {
                    console.log(error);
                    reject(error); // Reject the promise if getCartId fails
                },
            });
        });
    }

    removeFromCart(lineId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.getCartId().subscribe({
                next: (cartId: string | null) => {
                    this.medusa.carts.lineItems
                        .delete(cartId, lineId)
                        .then(({ cart }: { cart: any }) => {
                            this.#cart.set(cart);
                            resolve(); // Resolve the promise when the operation is complete
                        })
                        .catch((err: any) => {
                            console.log(err);
                            reject(err); // Reject the promise if there's an error
                        });
                },
                error: (error) => {
                    console.log(error);
                    reject(error); // Reject the promise if getCartId fails
                },
            });
        });
    }

    subscribe(email: string) {
        return this.http.post(`${environment.BACKEND_URL}/store/subscribe`, { email });
    }

    async updateProfile(
        first_name: string,
        last_name: string,
        email: string,
        phone: string,
        password: string = '',
    ): Promise<void> {
        try {
            const updateData: any = { first_name, last_name, email, phone };
            if (password) {
                updateData.password = password;
            }

            await this.medusa.customers.update(updateData);
            this.checkUserLoggedIn();
        } catch (error) {
            console.error("Error updating profile:", error);
            throw new Error("Failed to update profile.");
        }
    }


    async addAddress(address: any) {
        await this.medusa.customers.addresses
            .addAddress({
                address: {
                    ...address,
                },
            });
            this.checkUserLoggedIn();

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
            .then(async ({ cart }: { cart: any }) => {
                await this.deleteCart();
            });
    }

    deleteCart() {
        this.#cart.set(null);
        if (this.user()) {
            this.http.post(`${environment.BACKEND_URL}/store/delete-cart`, { email: this.user().email }).subscribe({
                next: (data: any) => {
                    this.checkCart();
                }, error: () => { }
            });
        }
        else {
            this.clearCart();
        }
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

    addAffiliate(email: string) {
        this.http.post(`${environment.BACKEND_URL}/store/add-affiliate`, { email: email }).subscribe({
            next: (data: any) => { },
            error: (data: any) => { }
        })
    }

    getAffiliate(email: string) {
        return this.http.post(`${environment.BACKEND_URL}/store/get-affiliate`, { email: email });
    }

    updateVisits(affiliateId: string, productHandle: string) {
        return this.http.post(`${environment.BACKEND_URL}/store/update-visits`, { affiliateId, productHandle });
    }

    updatePurchases(affiliateId: string, productHandle: string, orderId: string, totalPrice: any) {
        return this.http.post(`${environment.BACKEND_URL}/store/update-purchases`, { affiliateId, productHandle, orderId, totalPrice });
    }

    async getAllWishlistItems(): Promise<void> {
        if (!this.user()) {
            return;
        }

        try {
            const response = await firstValueFrom(
                this.http.post<{ message: string[] }>(`${environment.BACKEND_URL}/store/get-wishlist`, {
                    email: this.user().email,
                })
            );
            this.#favourite.set(response.message);
        } catch (error) {
            console.error("Error fetching wishlist items:", error);
        }
    }



    addToWishlist(email: string, productId: string) {
        this.http.post(`${environment.BACKEND_URL}/store/add-wishlist`, { email: email, productId: productId }).subscribe({
            next: (data: any) => { this.#favourite.set(data.message) },
            error: (_error: any) => { }
        });
    }

    async removeFromWishlist(productId: string) {
        if (!this.user()) {
            return;
        }

        try {
            const response = await firstValueFrom(
                this.http.post<{ message: string[] }>(`${environment.BACKEND_URL}/store/delete-wishlist`, {
                    email: this.user().email,productId: productId,
                })
            );
            this.#favourite.set(response.message);
        } catch (error) {
            console.error("Error removing wishlist items:", error);
        }
    }

    async removeAllFavourites() {
        if (!this.user()) {
            return;
        }

        try {
            const response = await firstValueFrom(
                this.http.post<{ message: string[] }>(`${environment.BACKEND_URL}/store/wishlist-remove-all`, { email: this.user().email })
            );
            this.#favourite.set(response.message);
        } catch (error) {
            console.error("Error removing wishlist items:", error);
        }
    }
}
