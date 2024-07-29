import { computed, inject, Injectable, signal } from '@angular/core';
import Medusa, { Config } from "@medusajs/medusa-js";
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class MedusaClientService {
    private readonly http: HttpClient = inject(HttpClient);

    medusa: any;

    #user = signal<any>(null);
    user = computed(this.#user);

    constructor() {
        let config: Config = { baseUrl: environment.BACKEND_URL, maxRetries: 3 };
        this.medusa = new Medusa(config)
    }

    getCollections(){
        return this.medusa.collections.list()
    }

    getProducts(collectionId: string, limit: number = 4){
        return this.medusa.products.list({ collection_id: [collectionId], limit })
    }

    getAllProducts(limit: number = 4){
        return this.medusa.products.list({limit})
    }

    //Authentication
    login(email: string, password: string){
        return this.medusa.auth.authenticate({ email, password })
        .then(({ customer }: {customer: any}) => {
            this.#user.set(customer)
          })
    }

    emailExists(email: string){
        return this.medusa.auth.exists(email);
    }

    createUser(first_name: string, last_name: string, email: string, password: string){
        return this.medusa.customers.create({ first_name, last_name, email, password })
    }

    checkUserLoggedIn(){
        return this.medusa.auth.getSession().then((data: any) => {
            this.#user.set(data)
        }).catch((err: any) => {});
    }

    logout(){
        this.medusa.auth.deleteSession().then((data: any) => {
            this.#user.set(null)
        });
    }

    sendPasswordToken(email: string, code: string){
        return this.http.post(`${environment.BACKEND_URL}/store/request-password`, { email, code });
    }

    updatePassword(email: string, password: string, token: string){
        return this.medusa.customers.resetPassword({
            email,
            password,
            token
          })
          .then(({ customer }: {customer: any}) => {
            console.log(customer.id);
          })
    }

    generatePasswordToken(email: string){
        this.medusa.customers.generatePasswordToken({ email });
    }
}
