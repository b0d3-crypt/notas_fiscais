import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() color: 'primary' | 'accent' | 'warn' | 'default' | 'basic' = 'default';
  @Input() size: 'small' | 'normal' = 'small';
  @Input() disabled: boolean = false;

  @HostBinding('class') get classes(): string[] {
    return [`btn-${this.size}`, `btn-${this.color}`];
  }
}
