import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MedusaClientService } from '../medusa-client.service';

@Component({
    selector: 'app-guest-track',
    imports: [FormsModule, RouterModule],
    templateUrl: './guest-track.component.html',
    styleUrl: './guest-track.component.scss'
})
export class GuestTrackComponent implements OnInit {
  orderId: string = '';

  private route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.orderId = params['id'].slice(-8);
    });
  }

  redirectToHomePage(){
    this.router.navigate(['/']);
  }

}
