import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';

import { Cadastro } from '../../models/cadastro.model';
import { CadastroService } from '../../services/cadastro.service';
import { ViaCepService } from '../../services/viacep.service';
import { mensagemErroApi } from '../../utils/api-error.util';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    StepsModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    DialogModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css',
})
export class CadastroComponent {
  private fb = inject(FormBuilder);
  private viaCep = inject(ViaCepService);
  private cadastroService = inject(CadastroService);
  private messageService = inject(MessageService);

  activeIndex = signal(0);
  showDialog = signal(false);
  loadingCep = signal(false);
  saving = signal(false);

  steps = [{ label: 'Dados do Usuário' }, { label: 'Endereço' }];

  generos = [
    { label: 'Masculino', value: 'Masculino' },
    { label: 'Feminino', value: 'Feminino' },
    { label: 'Outro', value: 'Outro' },
  ];

  usuarioForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    sobrenome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    genero: [null, Validators.required],
    dataNascimento: [''],
  });

  enderecoForm: FormGroup = this.fb.group({
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    estado: ['', Validators.required],
    rua: ['', Validators.required],
    bairro: ['', Validators.required],
    numero: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    complemento: [''],
  });

  proximo(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios.',
      });
      return;
    }
    this.activeIndex.set(1);
  }

  voltar(): void {
    this.activeIndex.set(0);
  }

  buscarCep(): void {
    const cep = this.enderecoForm.value.cep;
    if (!cep || this.enderecoForm.get('cep')?.invalid) return;

    this.loadingCep.set(true);
    this.viaCep.buscar(cep).subscribe({
      next: (res) => {
        this.enderecoForm.patchValue({
          estado: res.uf,
          rua: res.logradouro,
          bairro: res.bairro,
        });
        this.loadingCep.set(false);
      },
      error: () => {
        this.loadingCep.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'CEP inválido',
          detail: 'Não foi possível localizar o CEP informado.',
        });
      },
    });
  }

  abrirResumo(): void {
    if (this.enderecoForm.invalid) {
      this.enderecoForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios.',
      });
      return;
    }
    this.showDialog.set(true);
  }

  get resumo(): Cadastro {
    return {
      usuario: this.usuarioForm.value,
      endereco: this.enderecoForm.value,
    };
  }

  confirmarEnvio(): void {
    this.saving.set(true);
    this.cadastroService.salvar(this.resumo).subscribe({
      next: () => {
        this.saving.set(false);
        this.showDialog.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Cadastro enviado com sucesso!',
        });
        this.usuarioForm.reset();
        this.enderecoForm.reset();
        this.activeIndex.set(0);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: mensagemErroApi(
            err,
            'Falha ao enviar o cadastro. Tente novamente.',
          ),
        });
      },
    });
  }
}
