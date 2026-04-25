import { Directive, ElementRef, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[cepMask]',
})
export class CepMaskDirective {
    constructor(
        private el: ElementRef<HTMLInputElement>,
        @Optional() @Self() private ngControl: NgControl,
    ) { }

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const raw = input.value.replace(/\D/g, '').slice(0, 8);
        const formatted = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw;

        this.el.nativeElement.value = formatted;

        if (this.ngControl?.control) {
            this.ngControl.control.setValue(formatted, { emitEvent: true });
        }
    }
}
