import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CepMaskDirective } from './cep-mask.directive';

@Component({
    template: `<input cepMask [(ngModel)]="cep" />`,
})
class TestHostComponent {
    cep = '';
}

describe('CepMaskDirective', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let inputEl: HTMLInputElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CepMaskDirective, TestHostComponent],
            imports: [FormsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    });

    function triggerInput(value: string): void {
        inputEl.value = value;
        inputEl.dispatchEvent(new Event('input'));
        fixture.detectChanges();
    }

    it('deve criar a diretiva', () => {
        const directive = fixture.debugElement.query(By.directive(CepMaskDirective));
        expect(directive).toBeTruthy();
    });

    it('deve formatar 8 dígitos como XXXXX-XXX', () => {
        triggerInput('45055390');
        expect(inputEl.value).toBe('45055-390');
    });

    it('deve preservar a formatação quando já está no formato correto', () => {
        triggerInput('45055-390');
        expect(inputEl.value).toBe('45055-390');
    });

    it('não deve adicionar hífen para menos de 5 dígitos', () => {
        triggerInput('4505');
        expect(inputEl.value).toBe('4505');
    });

    it('deve aceitar exatamente 5 dígitos sem hífen', () => {
        triggerInput('45055');
        expect(inputEl.value).toBe('45055');
    });

    it('deve adicionar hífen após 5 dígitos', () => {
        triggerInput('450553');
        expect(inputEl.value).toBe('45055-3');
    });

    it('deve remover caracteres não-numéricos', () => {
        triggerInput('abc45055390xyz');
        expect(inputEl.value).toBe('45055-390');
    });

    it('deve limitar a 8 dígitos (XXXXX-XXX)', () => {
        triggerInput('450553901234');
        expect(inputEl.value).toBe('45055-390');
    });

    it('deve funcionar com CEP vazio', () => {
        triggerInput('');
        expect(inputEl.value).toBe('');
    });
});
