import { Component, effect, inject, OnInit } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [RouterModule, DatePipe, SlicePipe, CommonModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
})
export class OrderComponent implements OnInit {
  private medusa: MedusaClientService = inject(MedusaClientService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);

  orderId: string = '';
  order: any = {};
  user = this.medusa.user;
  statusCode: number = 2;
  cancelOrderPopup: boolean = false;
  exchangeOrderPopup: boolean = false;
  totalPrice: number = 0;
  delivery: string = '';

  ngOnInit(): void {
    this.medusa.checkUserLoggedIn().then(() => {

      if (!this.user()) {
        this.router.navigate(['/', 'login']);
      }
    });
    this.route.params.subscribe((params) => {
      this.orderId = params['id'];
      this.retrieveOrderDetails();
    });
  }

  retrieveOrderDetails() {
    this.medusa.retrieveOrder(this.orderId).then(({ order }: { order: any }) => {
      this.order = order;

      if(order.status === 'completed'){
        this.statusCode = 5;
      }
      else if (order.status === 'pending' && order.fulfillment_status === 'fulfilled') {
        this.statusCode = 3;
      }
      else if (order.status === 'pending' && order.fulfillment_status === 'shipped') {
        this.statusCode = 4;
      }
      else if (order.status === 'pending') {
        this.statusCode = 2;
      } else if (order.status === 'canceled') {
        this.statusCode = -1;
      }
      if (!isNaN(order.shipping_methods[0].data.shipping_cost) && typeof order.shipping_methods[0].data.shipping_cost === 'number') {
        this.totalPrice = (order.subtotal /
            100)+ order.shipping_methods[0].data.shipping_cost;
    } else {
        this.totalPrice = (order.subtotal /
            100);
    }
    let createdAtDate = new Date(order.created_at);
    createdAtDate.setDate(createdAtDate.getDate() + 8);
    this.delivery =createdAtDate.toISOString();
    });
  }

  calculateWidth(): string {
    if (this.statusCode === -1) {
      return '0%'; // If statusCode is -1, the width should be 0%
    }
    return `${(this.statusCode / 5) * 100}%`; // Calculate width based on statusCode
  }
}
