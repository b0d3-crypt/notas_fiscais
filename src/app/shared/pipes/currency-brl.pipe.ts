import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyBrl', pure: true })
export class CurrencyBrlPipe implements PipeTransform {
    private readonly formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    transform(value: number): string {
        return this.formatter.format(value);
    }
}
