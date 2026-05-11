import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Genero } from '../../models/cadastro.model';
import { UsuarioResponse } from '../../models/usuario-api.model';
import { CadastroService } from '../../services/cadastro.service';
import { mensagemErroApi } from '../../utils/api-error.util';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardModule,
    TableModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService],
  templateUrl: './lista-usuarios.component.html',
  styleUrl: './lista-usuarios.component.css',
})
export class ListaUsuariosComponent implements OnInit {
  private cadastroService = inject(CadastroService);
  private confirmation = inject(ConfirmationService);
  private messageService = inject(MessageService);

  itens = signal<UsuarioResponse[]>([]);
  pagina = signal(1);
  totalPaginas = signal(1);
  totalItens = signal(0);
  loading = signal(false);
  erro = signal<string | null>(null);

  filtroNome = '';
  filtroEmail = '';
  filtroGenero: Genero | null = null;

  opcoesGeneroFiltro = [
    { label: 'Masculino', value: 'Masculino' as Genero },
    { label: 'Feminino', value: 'Feminino' as Genero },
    { label: 'Outro', value: 'Outro' as Genero },
  ];

  private readonly tamanhoPagina = 10;

  ngOnInit(): void {
    this.carregar();
  }

  aplicarFiltros(): void {
    this.pagina.set(1);
    this.carregar();
  }

  limparFiltros(): void {
    this.filtroNome = '';
    this.filtroEmail = '';
    this.filtroGenero = null;
    this.pagina.set(1);
    this.carregar();
  }

  carregar(): void {
    this.loading.set(true);
    this.erro.set(null);
    this.cadastroService
      .listar(this.pagina(), this.tamanhoPagina, {
        nome: this.filtroNome.trim() || undefined,
        email: this.filtroEmail.trim() || undefined,
        genero: this.filtroGenero ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.itens.set(res.itens);
          this.totalPaginas.set(Math.max(1, res.totalPaginas));
          this.totalItens.set(res.totalItens);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.erro.set(
            mensagemErroApi(err, 'Não foi possível carregar a lista.'),
          );
        },
      });
  }

  anterior(): void {
    if (this.pagina() <= 1) return;
    this.pagina.update((p) => p - 1);
    this.carregar();
  }

  proxima(): void {
    if (this.pagina() >= this.totalPaginas()) return;
    this.pagina.update((p) => p + 1);
    this.carregar();
  }

  enderecoResumido(u: UsuarioResponse): string {
    const e = u.endereco;
    if (!e) return '—';
    const comp = e.complemento ? `, ${e.complemento}` : '';
    return `${e.rua}, ${e.numero} — ${e.bairro}, ${e.estado} — CEP ${e.cep}${comp}`;
  }

  confirmarExclusao(u: UsuarioResponse): void {
    this.confirmation.confirm({
      message: `Remover permanentemente ${u.nome} ${u.sobrenome}?`,
      header: 'Excluir cadastro',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.cadastroService.excluir(u.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Removido',
              detail: 'Usuário excluído.',
            });
            if (this.itens().length <= 1 && this.pagina() > 1) {
              this.pagina.update((p) => Math.max(1, p - 1));
            }
            this.carregar();
          },
          error: (err: unknown) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: mensagemErroApi(err, 'Não foi possível excluir.'),
            });
          },
        });
      },
    });
  }
}
