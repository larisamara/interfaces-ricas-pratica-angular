# DevPulse Tasks — CRUD com Angular 22, OptimusUI 2 e Tailwind 4

Aplicação de gerenciamento de tarefas desenvolvida para a disciplina **Interfaces Ricas**.
Implementa as operações de **listar, detalhar, incluir, alterar e remover** um modelo
(`Tarefa`) armazenado em memória, usando **OptimusUI 2** para a estrutura visual e
**Tailwind CSS 4** para ajustes específicos.

---

## 📦 Tecnologias e versões

| Tecnologia | Versão | Pacote npm |
| :--- | :--- | :--- |
| Angular | 22.2.x | `@angular/core`, `@angular/cli` |
| OptimusUI | 2.0.x | `@openng/optimus-ui` |
| Tema OptimusUI (Aura) | 2.0.x | `@openng/optimus-ui-themes` |
| Ícones OptimusUI | 1.0.x | `@openng/icons` |
| Tailwind CSS | 4.x | `tailwindcss`, `@tailwindcss/postcss` |
| TypeScript | 6.0.x | `typescript` |
| Testes | Vitest 4 | `vitest` |

> **Por que OptimusUI?** É um *fork* comunitário e com licença MIT do PrimeNG 21. A versão 2
> é a que suporta oficialmente o Angular 22 (`peerDependencies: @angular/core ^22.1.4`).

---

## 🚀 Como executar o projeto

### Pré-requisitos
- **Node.js** 22, 24 ou 26 (versões suportadas pelo Angular 22)
- **npm** (vem junto com o Node)
- **Git**

Verifique com:
```bash
node -v
npm -v
git --version
```

### Passo a passo
```bash
# 1. Clonar o repositório
git clone https://github.com/larisamara/interfaces-ricas-pratica-angular.git

# 2. Entrar na pasta
cd interfaces-ricas-pratica-angular

# 3. Instalar as dependências (lê o package.json e o package-lock.json)
npm install

# 4. Iniciar o servidor de desenvolvimento
npm start
```

Abra o navegador em **http://localhost:4200**. Para parar o servidor, pressione `Ctrl + C` no terminal.

### Outros comandos úteis
| Comando | O que faz |
| :--- | :--- |
| `npm start` | Inicia o servidor de desenvolvimento (`ng serve`) |
| `npm run build` | Gera a versão de produção na pasta `dist/` |
| `npm test -- --watch=false` | Executa os testes unitários uma vez |

---

## 📚 Tutorial: como o projeto foi construído

Esta seção mostra, em ordem, tudo o que foi feito para montar o projeto do zero.

### Passo 1 — Criar o projeto Angular
```bash
ng new dev-pulse --style=css --ssr=false --routing=false
```
- `--style=css` → usa CSS puro (recomendado para o Tailwind 4)
- `--ssr=false` → sem renderização no servidor
- `--routing=false` → o CRUD fica em uma única tela, não precisa de rotas

Depois o projeto foi atualizado para o Angular 22:
```bash
npx ng update @angular/core@22 @angular/cli@22
```

### Passo 2 — Instalar o OptimusUI 2
```bash
npm install @openng/optimus-ui @openng/optimus-ui-themes @openng/icons @angular/cdk @angular/animations
```

Registrar o tema no arquivo [`src/app/app.config.ts`](src/app/app.config.ts):
```ts
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideOptimus } from '@openng/optimus-ui/config';
import Aura from '@openng/optimus-ui-themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),            // animações dos modais e toasts
    provideOptimus({ theme: { preset: Aura } }), // tema Aura
  ],
};
```

### Passo 3 — Instalar o Tailwind CSS 4
```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

Criar o arquivo [`.postcssrc.json`](.postcssrc.json) na raiz:
```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

Importar no CSS global [`src/styles.css`](src/styles.css):
```css
@import "@openng/icons/openng-icons.css"; /* ícones pi pi-* */
@import "tailwindcss";                    /* Tailwind 4 */
```

> No Tailwind 4 **não existe mais** `tailwind.config.js` nem as diretivas `@tailwind base/components/utilities`.
> Basta o `@import "tailwindcss";`, e ele detecta automaticamente as classes usadas nos templates.

### Passo 4 — Criar o model
Arquivo [`src/app/models/tarefa.model.ts`](src/app/models/tarefa.model.ts):
```ts
export interface Tarefa {
  id: number;              // number  → identificador
  titulo: string;          // string
  descricao: string;       // string
  pontosEstimados: number; // number
  dataPrazo: Date;         // date
  concluida: boolean;      // boolean
}
```

### Passo 5 — Implementar o CRUD
Toda a lógica está no componente principal [`src/app/app.ts`](src/app/app.ts), com o template em
[`src/app/app.html`](src/app/app.html). Os dados ficam em um array em memória:

| Operação | Método | Componente OptimusUI usado |
| :--- | :--- | :--- |
| **Listar** | array `tarefas` | `<p-table>` |
| **Detalhar** | `abrirModalDetalhes(tarefa)` | `<p-dialog>` |
| **Incluir** | `abrirModalNovo()` + `salvarTarefa()` | `<p-dialog>` + inputs |
| **Alterar** | `abrirModalEditar(tarefa)` + `salvarTarefa()` | `<p-dialog>` + inputs |
| **Remover** | `removerTarefa(tarefa)` | `<p-confirmdialog>` |

Exemplo, a remoção com confirmação:
```ts
removerTarefa(tarefa: Tarefa): void {
  this.confirmationService.confirm({
    message: `Tem certeza que deseja excluir a tarefa "${tarefa.titulo}"?`,
    accept: () => {
      this.tarefas = this.tarefas.filter((t) => t.id !== tarefa.id);
    },
  });
}
```

---

## 🧠 Conceitos do Angular usados no projeto

### Data Binding
| Tipo | Sintaxe | Exemplo no `app.html` |
| :--- | :--- | :--- |
| Interpolação | `{{ }}` | `{{ tarefa.titulo }}` |
| Property binding | `[prop]` | `[value]="tarefas"` |
| Event binding | `(evento)` | `(onClick)="abrirModalNovo()"` |
| Two-way binding | `[(ngModel)]` | `[(ngModel)]="tarefaForm.titulo"` |

### Diretivas e controle de fluxo
- `@if (tarefaSelecionada) { ... }` → só mostra os detalhes quando há uma tarefa selecionada
- `pTemplate="header"` / `pTemplate="body"` → definem o cabeçalho e as linhas da tabela
- `pInputText` → diretiva que transforma um `<input>` comum em um input estilizado do OptimusUI

### Eventos de manipulação de dados
- `(onClick)` nos botões → incluir, detalhar, alterar e remover
- `(ngSubmit)` no formulário → salvar
- `(click)` na tag de status → alterna entre "Concluída" e "Pendente"

### Pipes
- `{{ tarefa.dataPrazo | date:'dd/MM/yyyy' }}` → formata a data

---

## 🎨 OptimusUI × Tailwind: quem faz o quê

**OptimusUI** fica com a **estrutura visual** (componentes prontos):
`p-table`, `p-dialog`, `p-button`, `p-tag`, `p-inputnumber`, `p-datepicker`,
`p-toggleswitch`, `p-toast`, `p-confirmdialog`, `pInputText`.

**Tailwind** faz **ajustes específicos**:

- Em **elementos HTML** comuns:
  ```html
  <header class="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm">
  ```
- Em **componentes OptimusUI**:
  ```html
  <p-tag class="cursor-pointer" ...>
  <input pInputText class="w-full" ...>
  <p-datepicker styleClass="w-full" class="w-full" ...>
  ```

---

## 🗂️ Estrutura dos arquivos principais

```
interfaces-ricas-pratica-angular/
├── .postcssrc.json            # Configuração do PostCSS → ativa o Tailwind 4
├── angular.json               # Configuração do Angular CLI (build, serve, test)
├── package.json               # Dependências e scripts do projeto
├── package-lock.json          # Versões exatas instaladas (gerado pelo npm)
├── tsconfig.json              # Configuração do TypeScript
└── src/
    ├── index.html             # Página HTML base
    ├── main.ts                # Ponto de entrada (bootstrap da aplicação)
    ├── styles.css             # CSS global: Tailwind + ícones
    └── app/
        ├── app.config.ts      # Providers: tema OptimusUI (Aura) e animações
        ├── app.ts             # Componente principal: lógica do CRUD
        ├── app.html           # Template: OptimusUI + Tailwind + bindings
        ├── app.spec.ts        # Testes unitários
        └── models/
            └── tarefa.model.ts  # Model com string, number, date e boolean
```

> **Observação:** o enunciado cita `package-lock.yaml`, mas o **npm** gera o arquivo
> `package-lock.json`. Ele cumpre o mesmo papel: travar as versões exatas de cada dependência.

---

## 👩‍💻 Autora

**Larissa Samara** — [@larisamara](https://github.com/larisamara)