import { Component, inject, OnInit } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
    private readonly medusa: MedusaClientService = inject(MedusaClientService);

    user = this.medusa.user;
    name: string = '';

    ngOnInit(): void {
        this.medusa.checkUserLoggedIn().then((data: any) => {
            console.log(this.user())
            this.name = this.user().customer.first_name + " " +this.user().customer.last_name;
          });
    }
}
