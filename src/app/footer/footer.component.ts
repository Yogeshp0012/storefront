import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MedusaClientService } from '../medusa-client.service';
import { FormsModule } from '@angular/forms';
import { Utils } from '../utils/Utils';

@Component({
    selector: 'app-footer',
    imports: [RouterModule, FormsModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent {
    private readonly medusa: MedusaClientService = inject(MedusaClientService);

    collections: any[] = [];
    email: string = '';
    code: number = 0;

    ngOnInit(): void {
        this.medusa.getCollections().then(async ({ collections, limit, offset, count }: { collections: any, limit: any, offset: any, count: any }) => {
            this.collections = collections;
        });
    }

    subscribeToNewsLetter(): void {
        this.code = 0;
        if(!Utils.validateEmail(this.email)){
            this.code = -1;
            return;
        }
        this.medusa.subscribe(this.email).subscribe({
            next: (data: any) => {
                if(data.message == "Subscribed Successfully"){
                    this.code = 1;
                }
                else{
                    this.code = 2;
                }
            },
            error: (error) => {
                console.log(error);
            }
        });
    }
}
