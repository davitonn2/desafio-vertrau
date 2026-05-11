import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { Genero } from '../../models/cadastro.model';
import { UsuarioUpdatePayload } from '../../models/usuario-api.model';
import { CadastroService } from '../../services/cadastro.service';
import { ViaCepService } from '../../services/viacep.service';
import { mensagemErroApi } from '../../utils/api-error.util';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    ToastModule,
    MessageModule,
  ],
  providers: [MessageService],
  templateUrl: './editar-usuario.component.html',
  styleUrl: './editar-usuario.component.css',
})
export class EditarUsuarioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private api = inject(CadastroService);
  private viaCep = inject(ViaCepService);
  private messageService = inject(MessageService);

  userId = signal<number | null>(null);
  loading = signal(true);
  saving = signal(false);
  erro = signal<string | null>(null);
  loadingCep = signal(false);
  /** Quando o cadastro original não tinha endereço, o bloco de endereço é opcional (PUT pode enviar null). */
  enderecoOpcional = signal(false);

  generos = [
    { label: 'Masculino', value: 'Masculino' as Genero },
    { label: 'Feminino', value: 'Feminino' as Genero },
    { label: 'Outro', value: 'Outro' as Genero },
  ];

  usuarioForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    sobrenome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    genero: [null as Genero | null, Validators.required],
    dataNascimento: [''],
  });

  enderecoForm = this.fb.group({
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    estado: ['', Validators.required],
    rua: ['', Validators.required],
    bairro: ['', Validators.required],
    numero: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    complemento: [''],
  });

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    const id = Number(raw);
    if (!Number.isFinite(id) || id < 1) {
      this.erro.set('ID inválido.');
      this.loading.set(false);
      return;
    }

    this.userId.set(id);
    this.api.obterPorId(id).subscribe({
      next: (u) => {
        this.usuarioForm.patchValue({
          nome: u.nome,
          sobrenome: u.sobrenome,
          email: u.email,
          genero: u.genero,
          dataNascimento: u.dataNascimento
            ? u.dataNascimento.substring(0, 10)
            : '',
        });

        if (u.endereco) {
          const c = u.endereco.cep.replace(/\D/g, '');
          const cepFmt =
            c.length === 8 ? `${c.slice(0, 5)}-${c.slice(5)}` : u.endereco.cep;
          this.enderecoForm.patchValue({
            cep: cepFmt,
            estado: u.endereco.estado,
            rua: u.endereco.rua,
            bairro: u.endereco.bairro,
            numero: String(u.endereco.numero),
            complemento: u.endereco.complemento ?? '',
          });
        } else {
          this.enderecoOpcional.set(true);
          this.enderecoForm.reset();
          Object.values(this.enderecoForm.controls).forEach((c) => {
            c.clearValidators();
            c.updateValueAndValidity({ emitEvent: false });
          });
        }

        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.erro.set(mensagemErroApi(err, 'Usuário não encontrado.'));
      },
    });
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

  private restaurarValidadoresEndereco(): void {
    this.enderecoForm.get('cep')?.setValidators([
      Validators.required,
      Validators.pattern(/^\d{5}-?\d{3}$/),
    ]);
    this.enderecoForm.get('estado')?.setValidators(Validators.required);
    this.enderecoForm.get('rua')?.setValidators(Validators.required);
    this.enderecoForm.get('bairro')?.setValidators(Validators.required);
    this.enderecoForm
      .get('numero')
      ?.setValidators([Validators.required, Validators.pattern(/^\d+$/)]);
    this.enderecoForm.get('complemento')?.clearValidators();
    Object.values(this.enderecoForm.controls).forEach((c) =>
      c.updateValueAndValidity({ emitEvent: false }),
    );
  }

  salvar(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Corrija os dados do usuário.',
      });
      return;
    }

    const id = this.userId();
    if (!id) return;

    const u = this.usuarioForm.getRawValue();
    const e = this.enderecoForm.getRawValue();
    const dataRaw = u.dataNascimento?.trim();

    const temTrechoEndereco = [
      e.cep,
      e.estado,
      e.rua,
      e.bairro,
      e.numero,
      e.complemento,
    ].some((x) => !!String(x ?? '').trim());

    let enderecoPayload: UsuarioUpdatePayload['endereco'];

    if (this.enderecoOpcional() && !temTrechoEndereco) {
      enderecoPayload = null;
    } else {
      if (this.enderecoOpcional() && temTrechoEndereco) {
        this.restaurarValidadoresEndereco();
      }
      if (this.enderecoForm.invalid) {
        this.enderecoForm.markAllAsTouched();
        this.messageService.add({
          severity: 'warn',
          summary: 'Atenção',
          detail: 'Preencha o endereço corretamente ou deixe todos os campos vazios.',
        });
        return;
      }
      enderecoPayload = {
        cep: e.cep!.replace(/\D/g, ''),
        estado: e.estado!.trim(),
        rua: e.rua!.trim(),
        bairro: e.bairro!.trim(),
        numero: Number(e.numero),
        complemento: e.complemento?.trim() || null,
      };
    }

    const payload: UsuarioUpdatePayload = {
      nome: u.nome!.trim(),
      sobrenome: u.sobrenome!.trim(),
      email: u.email!.trim(),
      genero: u.genero!,
      dataNascimento: dataRaw ? dataRaw : null,
      endereco: enderecoPayload,
    };

    this.saving.set(true);
    this.api.atualizar(id, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Salvo',
          detail: 'Cadastro atualizado com sucesso.',
        });
        void this.router.navigate(['/lista']);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: mensagemErroApi(err, 'Falha ao atualizar.'),
        });
      },
    });
  }
}
