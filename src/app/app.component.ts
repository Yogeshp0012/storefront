import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MedusaClientService } from './medusa-client.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
    private readonly medusa: MedusaClientService = inject(MedusaClientService);
    collections: any[] = [];
    products: any[] = [];

    ngOnInit(): void {
        this.medusa.getCollections().then(({ collections, limit, offset, count }: { collections: any, limit: any, offset: any, count: any }) => {
            this.collections = collections;
            collections.forEach((collection: any) => {
                this.medusa.getProducts(collection.id).then(({ products }: { products: any[] }) => {
                    this.products = [...this.products, ...products];
                    console.log(this.products);
                });
            });
        });
    }
}
