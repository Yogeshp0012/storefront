import { Component, inject, OnInit } from '@angular/core';
import { TitleService } from '../../title.service';

@Component({
  selector: 'app-tnc',
  standalone: true,
  imports: [],
  templateUrl: './tnc.component.html',
  styleUrl: './tnc.component.scss'
})
export class TncComponent implements OnInit{
    private readonly title: TitleService = inject(TitleService);

    ngOnInit(): void {
        this.title.setTitle("Vastragrah - Terms and Conditions")
    }
}
