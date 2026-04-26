import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonComponent } from './components/button/button.component';
import { CardComponent } from './components/card/card.component';
import { CepMaskDirective } from './directives/cep-mask.directive';
import { CurrencyBrlPipe } from './pipes/currency-brl.pipe';

@NgModule({
    declarations: [CardComponent, ButtonComponent, CepMaskDirective, CurrencyBrlPipe],
    imports: [CommonModule],
    exports: [CardComponent, ButtonComponent, CepMaskDirective, CurrencyBrlPipe],
})
export class SharedModule { }
