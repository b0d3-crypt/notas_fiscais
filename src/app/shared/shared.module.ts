import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './components/card/card.component';
import { ButtonComponent } from './components/button/button.component';
import { CepMaskDirective } from './directives/cep-mask.directive';

@NgModule({
  declarations: [CardComponent, ButtonComponent, CepMaskDirective],
  imports: [CommonModule],
  exports: [CardComponent, ButtonComponent, CepMaskDirective],
})
export class SharedModule {}
