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

    getProducts(collectionId: string){
        console.log(collectionId);
        return this.medusa.products.list({ collection_id: [collectionId] })
    }
}
