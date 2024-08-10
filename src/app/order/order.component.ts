import { Component, inject, OnInit } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [RouterModule, DatePipe],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit {
    private medusa: MedusaClientService = inject(MedusaClientService);
    private route: ActivatedRoute = inject(ActivatedRoute);

    orderId:string = '';
    order: any= {};

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.orderId = params['id'];
            this.retrieveOrderDetails();
          });

    }

    retrieveOrderDetails(){
        this.medusa.retrieveOrder(this.orderId).then(({ order }: {order: any}) => {
            console.log(order);
           this.order = order;
          })
    }
}
