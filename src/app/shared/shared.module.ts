import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonComponent } from './components/button/button.component';
import { CardComponent } from './components/card/card.component';
import { CepMaskDirective } from './directives/cep-mask.directive';

@NgModule({
    declarations: [CardComponent, ButtonComponent, CepMaskDirective],
    imports: [CommonModule],
    exports: [CardComponent, ButtonComponent, CepMaskDirective],
})
export class SharedModule { }
