import { Injectable } from '@angular/core';
import Medusa, { Config } from "@medusajs/medusa-js";
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MedusaClientService {
    medusa: any;
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
    }

    emailExists(email: string){
        return this.medusa.auth.exists(email);
    }

    createUser(first_name: string, last_name: string, email: string, password: string){
        return this.medusa.customers.create({ first_name, last_name, email, password })
    }

    checkUserLoggedIn(){
        return this.medusa.auth.getSession()
    }

    logout(){
        return this.medusa.auth.deleteSession();
    }
}
