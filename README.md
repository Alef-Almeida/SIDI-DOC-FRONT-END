# SIDI-DOC (Front-end)

Sistema de Digitalização Inteligente de Documentos da Prefeitura de Irecê.
Este repositório contém o Front-end desenvolvido em **React** e **Vite**.

## 🎨 Design (Figma)
O protótipo das telas e o fluxo de navegação estão disponíveis no link abaixo:
- **[🔗 Acessar Figma do Projeto](https://www.figma.com/design/5qo3YGmYEOdt35eNiajJDs?node-id=0-1)**

## 📋 Pré-requisitos
Certifique-se de ter instalado em sua máquina:
* **Node.js** (Versão 18 ou superior)
* **Git**

---

## 🚀 Como rodar o projeto (Passo a passo)

Siga os comandos abaixo no seu terminal para baixar e executar o projeto:

### 1. Clonar o repositório
```bash
git clone [https://github.com/Alef-Almeida/SIDI-DOC-FRONT-END.git](https://github.com/Alef-Almeida/SIDI-DOC-FRONT-END.git)
```

### 2. Entrar na pasta
```bash
cd sidi doc
```

### 3. Instalar dependências
```bash
npm install
```

### 4. Rodar o servidor local
```bash
npm run dev
```

> **Acesso:** Após rodar o comando, o terminal mostrará o link de acesso (geralmente `http://localhost:5173/`).

---

## 📂 Estrutura de Pastas

Para manter a organização, seguimos este padrão dentro da pasta `src/`:

| Pasta | Descrição |
| :--- | :--- |
| **`src/components`** | Componentes reutilizáveis (Botões, Inputs, Header, Sidebar). |
| **`src/pages`** | Telas completas do sistema (Login, Dashboard, Digitalização). |
| **`src/routes`** | Arquivo de configuração das rotas e navegação. |
| **`src/services`** | Configuração do Axios e conexão com o Backend Java. |
| **`src/styles`** | Arquivos CSS globais. |

## 🛠 Tecnologias
* [React](https://react.dev/)
* [Vite](https://vitejs.dev/)
* [Axios](https://axios-http.com/)
* [React Router Dom](https://reactrouter.com/)