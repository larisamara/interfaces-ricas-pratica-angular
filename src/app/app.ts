import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from '@openng/optimus-ui/table';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { InputNumberModule } from '@openng/optimus-ui/inputnumber';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { TagModule } from '@openng/optimus-ui/tag';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';
import { CardModule } from '@openng/optimus-ui/card';
import { ToastModule } from '@openng/optimus-ui/toast';
import { ConfirmDialogModule } from '@openng/optimus-ui/confirmdialog';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';

import { Tarefa } from './models/tarefa.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    TagModule,
    ToggleSwitchModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Lista em memória de Tarefas
  tarefas: Tarefa[] = [
    {
      id: 1,
      titulo: 'Configurar Autenticação OAuth 2.0',
      descricao: 'Integrar login social com Google e GitHub no sistema',
      pontosEstimados: 8,
      dataPrazo: new Date('2026-10-15'),
      concluida: true,
    },
    {
      id: 2,
      titulo: 'Desenvolver Interface com OptimusUI 2',
      descricao: 'Construir tela de CRUD utilizando tema Aura e utilitários do Tailwind 4',
      pontosEstimados: 13,
      dataPrazo: new Date('2026-10-20'),
      concluida: false,
    },
    {
      id: 3,
      titulo: 'Criar Testes Automatizados',
      descricao: 'Validar formulários e manipulação de estados do modelo',
      pontosEstimados: 5,
      dataPrazo: new Date('2026-10-25'),
      concluida: false,
    },
  ];

  // Controle de estado dos diálogos/modais
  modalFormularioVisivel = false;
  modalDetalhesVisivel = false;
  modoEdicao = false;

  // Modelo temporário para edição/inclusão
  tarefaForm: Tarefa = this.criarTarefaVazia();

  // Tarefa selecionada para o modal de detalhes
  tarefaSelecionada: Tarefa | null = null;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  // Helper para instanciar modelo vazio
  private criarTarefaVazia(): Tarefa {
    return {
      id: 0,
      titulo: '',
      descricao: '',
      pontosEstimados: 1,
      dataPrazo: new Date(),
      concluida: false,
    };
  }

  // 1. INCLUIR (abrir modal)
  abrirModalNovo(): void {
    this.modoEdicao = false;
    this.tarefaForm = this.criarTarefaVazia();
    this.modalFormularioVisivel = true;
  }

  // 2. ALTERAR (abrir modal com dados)
  abrirModalEditar(tarefa: Tarefa): void {
    this.modoEdicao = true;
    this.tarefaForm = {
      ...tarefa,
      dataPrazo: new Date(tarefa.dataPrazo),
    };
    this.modalFormularioVisivel = true;
  }

  // SALVAR (Incluir ou Alterar em memória)
  salvarTarefa(): void {
    if (!this.tarefaForm.titulo.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'O título da tarefa é obrigatório.',
      });
      return;
    }

    if (this.modoEdicao) {
      const index = this.tarefas.findIndex((t) => t.id === this.tarefaForm.id);
      if (index !== -1) {
        this.tarefas[index] = { ...this.tarefaForm };
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Tarefa atualizada com sucesso!',
        });
      }
    } else {
      const novoId = this.tarefas.length > 0
        ? Math.max(...this.tarefas.map((t) => t.id)) + 1
        : 1;
      const novaTarefa: Tarefa = {
        ...this.tarefaForm,
        id: novoId,
      };
      this.tarefas = [...this.tarefas, novaTarefa];
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Tarefa cadastrada com sucesso!',
      });
    }

    this.modalFormularioVisivel = false;
  }

  // 3. DETALHAR
  abrirModalDetalhes(tarefa: Tarefa): void {
    this.tarefaSelecionada = tarefa;
    this.modalDetalhesVisivel = true;
  }

  // 4. REMOVER
  removerTarefa(tarefa: Tarefa): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a tarefa "${tarefa.titulo}"?`,
      header: 'Confirmação de Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.tarefas = this.tarefas.filter((t) => t.id !== tarefa.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Removida',
          detail: 'Tarefa excluída com sucesso.',
        });
      },
    });
  }

  // Alternar status rápido direto na listagem
  alternarStatus(tarefa: Tarefa): void {
    tarefa.concluida = !tarefa.concluida;
    this.messageService.add({
      severity: tarefa.concluida ? 'success' : 'secondary',
      summary: 'Status Atualizado',
      detail: `Tarefa marcada como ${tarefa.concluida ? 'Concluída' : 'Pendente'}.`,
    });
  }

  // Métricas auxiliares para o dashboard
  get totalTarefas(): number {
    return this.tarefas.length;
  }

  get tarefasConcluidas(): number {
    return this.tarefas.filter((t) => t.concluida).length;
  }

  get totalPontos(): number {
    return this.tarefas.reduce((acc, t) => acc + (t.pontosEstimados || 0), 0);
  }
}
