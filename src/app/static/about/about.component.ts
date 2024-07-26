import { DOCUMENT } from '@angular/common';
import { Component, inject, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit  {
    private readonly document = inject(DOCUMENT);
    private readonly renderer = inject(Renderer2);

    ngOnInit(): void {
        this.renderer.setProperty(this.document.documentElement, 'scrollTop', 0);
        this.renderer.setProperty(this.document.body, 'scrollTop', 0);
      }
}