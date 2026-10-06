import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { App } from './app';
import { Tarefa } from './models/tarefa.model';

describe('Componente Principal (App) - CRUD com OptimusUI e Tailwind', () => {
  let fixture: ComponentFixture<App>;
  let app: App;
  let confirmationService: ConfirmationService;
  let messageService: MessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideAnimationsAsync()],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    app = fixture.componentInstance;
    confirmationService = fixture.debugElement.injector.get(ConfirmationService);
    messageService = fixture.debugElement.injector.get(MessageService);
    fixture.detectChanges();
  });

  describe('1. Inicialização e Layout', () => {
    it('deve instanciar o componente com sucesso', () => {
      expect(app).toBeTruthy();
    });

    it('deve renderizar o título da aplicação no cabeçalho', async () => {
      await fixture.whenStable();
      const elementoHtml = fixture.nativeElement as HTMLElement;
      const titulo = elementoHtml.querySelector('h1')?.textContent;
      expect(titulo).toContain('DevPulse Tasks');
    });
  });

  describe('2. Modelo Tarefa (Tipos obrigatórios: string, number, date, boolean)', () => {
    it('deve validar que o modelo Tarefa possui atributos dos 4 tipos exigidos', () => {
      const tarefaExemplo: Tarefa = app.tarefas[0];

      expect(typeof tarefaExemplo.id).toBe('number');
      expect(typeof tarefaExemplo.titulo).toBe('string');
      expect(typeof tarefaExemplo.descricao).toBe('string');
      expect(typeof tarefaExemplo.pontosEstimados).toBe('number');
      expect(tarefaExemplo.dataPrazo instanceof Date).toBe(true);
      expect(typeof tarefaExemplo.concluida).toBe('boolean');
    });
  });

  describe('3. Operação de LISTAR', () => {
    it('deve inicializar com a lista de tarefas em memória', () => {
      expect(app.tarefas.length).toBe(3);
      expect(app.tarefas[0].titulo).toBe('Configurar Autenticação OAuth 2.0');
    });
  });

  describe('4. Operação de INCLUIR', () => {
    it('deve abrir o modal de inclusão com modelo vazio e modoEdicao falso', () => {
      app.abrirModalNovo();

      expect(app.modalFormularioVisivel).toBe(true);
      expect(app.modoEdicao).toBe(false);
      expect(app.tarefaForm.id).toBe(0);
      expect(app.tarefaForm.titulo).toBe('');
      expect(app.tarefaForm.concluida).toBe(false);
    });

    it('deve cadastrar uma nova tarefa em memória com ID incremental', () => {
      const totalInicial = app.tarefas.length;

      app.abrirModalNovo();
      app.tarefaForm.titulo = 'Nova Tarefa de Teste';
      app.tarefaForm.descricao = 'Descrição detalhada do teste';
      app.tarefaForm.pontosEstimados = 5;
      app.tarefaForm.dataPrazo = new Date('2026-11-01');
      app.tarefaForm.concluida = false;

      app.salvarTarefa();

      expect(app.tarefas.length).toBe(totalInicial + 1);
      const tarefaCadastrada = app.tarefas.find((t) => t.titulo === 'Nova Tarefa de Teste');
      expect(tarefaCadastrada).toBeDefined();
      expect(tarefaCadastrada?.id).toBe(4);
      expect(app.modalFormularioVisivel).toBe(false);
    });

    it('não deve salvar tarefa se o título estiver em branco (regra de validação)', () => {
      const totalInicial = app.tarefas.length;
      const spyMessage = vi.spyOn(messageService, 'add');

      app.abrirModalNovo();
      app.tarefaForm.titulo = '   ';
      app.salvarTarefa();

      expect(app.tarefas.length).toBe(totalInicial);
      expect(spyMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'warn',
          summary: 'Atenção',
        })
      );
    });
  });

  describe('5. Operação de DETALHAR', () => {
    it('deve abrir o modal de detalhes com os dados da tarefa selecionada', () => {
      const tarefaParaDetalhar = app.tarefas[1];

      app.abrirModalDetalhes(tarefaParaDetalhar);

      expect(app.modalDetalhesVisivel).toBe(true);
      expect(app.tarefaSelecionada).toEqual(tarefaParaDetalhar);
      expect(app.tarefaSelecionada?.titulo).toBe('Desenvolver Interface com OptimusUI 2');
    });
  });

  describe('6. Operação de ALTERAR', () => {
    it('deve abrir o modal de edição preenchido com cópia da tarefa', () => {
      const tarefaOriginal = app.tarefas[0];

      app.abrirModalEditar(tarefaOriginal);

      expect(app.modalFormularioVisivel).toBe(true);
      expect(app.modoEdicao).toBe(true);
      expect(app.tarefaForm.id).toBe(tarefaOriginal.id);
      expect(app.tarefaForm.titulo).toBe(tarefaOriginal.titulo);
    });

    it('deve atualizar os dados da tarefa existente em memória', () => {
      const tarefaParaEditar = app.tarefas[0];
      const idOriginal = tarefaParaEditar.id;

      app.abrirModalEditar(tarefaParaEditar);
      app.tarefaForm.titulo = 'Título Atualizado';
      app.tarefaForm.pontosEstimados = 21;

      app.salvarTarefa();

      const tarefaAtualizada = app.tarefas.find((t) => t.id === idOriginal);
      expect(tarefaAtualizada?.titulo).toBe('Título Atualizado');
      expect(tarefaAtualizada?.pontosEstimados).toBe(21);
      expect(app.modalFormularioVisivel).toBe(false);
    });
  });

  describe('7. Operação de REMOVER', () => {
    it('deve remover a tarefa em memória após confirmação', () => {
      const tarefaParaRemover = app.tarefas[0];
      const totalInicial = app.tarefas.length;

      // Simula a confirmação do diálogo disparando o callback accept
      vi.spyOn(confirmationService, 'confirm').mockImplementation((config: any) => {
        config.accept?.();
        return confirmationService;
      });

      app.removerTarefa(tarefaParaRemover);

      expect(app.tarefas.length).toBe(totalInicial - 1);
      expect(app.tarefas.some((t) => t.id === tarefaParaRemover.id)).toBe(false);
    });
  });

  describe('8. Alternar Status e Métricas', () => {
    it('deve alternar o status booleano da tarefa', () => {
      const tarefa = app.tarefas[0];
      const statusInicial = tarefa.concluida;

      app.alternarStatus(tarefa);
      expect(tarefa.concluida).toBe(!statusInicial);

      app.alternarStatus(tarefa);
      expect(tarefa.concluida).toBe(statusInicial);
    });

    it('deve calcular corretamente as métricas de tarefas totais, concluídas e pontos', () => {
      // 3 tarefas iniciais: concluída (8pts), pendente (13pts), pendente (5pts)
      expect(app.totalTarefas).toBe(3);
      expect(app.tarefasConcluidas).toBe(1);
      expect(app.totalPontos).toBe(26);
    });
  });
});
