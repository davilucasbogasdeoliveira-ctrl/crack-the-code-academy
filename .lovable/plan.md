## Visão geral

Site de cursos aprofundados de **Python** e **C/C++**, com acesso fechado. Só quem tem assinatura ativa (liberada manualmente por você) consegue ver o conteúdo. Você (davilucasbogasdeoliveira@gmail.com) é o admin principal e libera o acesso pelo painel após receber o pagamento (PIX/etc).

## O que vou construir

**1. Landing pública (`/`)**
- Apresenta o curso, ementa resumida (Python + C/C++), preço mensal, botões "Entrar" / "Criar conta".
- Sem conteúdo do curso exposto.

**2. Autenticação (Lovable Cloud)**
- Email/senha + Google.
- Página `/auth` para login/cadastro.

**3. Sistema de roles + assinatura**
- Tabela `user_roles` com enum `admin | student`.
- Tabela `subscriptions` com `user_id`, `status` (pending/active/expired), `expires_at`, `notes`.
- Ao se cadastrar, o usuário fica com status `pending` até você aprovar.
- **Trigger seguro**: quando `davilucasbogasdeoliveira@gmail.com` confirmar o email, recebe role `admin` automaticamente + assinatura vitalícia. (Só concede se o email estiver verificado, evitando spoof.)

**4. Painel do admin (`/admin`)**
- Lista todos os usuários com status da assinatura.
- Botões: **Liberar acesso** (define active + expira em 30 dias), **Estender +30 dias**, **Bloquear**.
- Campo de anotação (ex: "pagou via PIX em X").
- Só acessível a quem tem role `admin`.

**5. Área do aluno (`/curso`, protegida)**
- Só entra quem tem assinatura `active` e não vencida.
- Se `pending`/`expired`: mostra tela "Aguardando liberação — envie o comprovante para davilucasbogasdeoliveira@gmail.com".
- Menu com módulos de Python e C/C++.

**6. Conteúdo aprofundado ("virar crack")**

**Python (12 módulos):**
1. Fundamentos + modelo de execução (CPython, bytecode)
2. Tipagem, mutabilidade e modelo de memória
3. Estruturas de dados internas (list/dict/set — big-O real)
4. Funções, closures, decorators
5. OOP profundo (MRO, dunder methods, metaclasses)
6. Iteradores, geradores, `itertools`
7. Concorrência: threading, multiprocessing, asyncio, GIL
8. Testes (pytest), tipagem estática (mypy)
9. Performance & profiling (cProfile, `__slots__`, Cython básico)
10. Padrões de projeto pythônicos
11. Projeto prático: API + CLI
12. Preparação para entrevistas técnicas

**C/C++ (12 módulos):**
1. Modelo de compilação (pré-processador → linker)
2. Ponteiros, arrays, aritmética de ponteiros
3. Gerenciamento manual de memória, stack vs heap
4. Structs, unions, layout de memória e alinhamento
5. C++ moderno: RAII, smart pointers
6. OOP em C++ (herança, virtual, polimorfismo)
7. Templates e STL a fundo
8. Move semantics, rvalue references, perfect forwarding
9. Concorrência (`std::thread`, mutex, atomics, memory model)
10. Undefined behavior, sanitizers, debugging (gdb, valgrind)
11. Projeto prático: estrutura de dados customizada + benchmark
12. Preparação para entrevistas

Cada módulo terá: teoria detalhada, exemplos de código comentados, exercícios com solução, e "armadilhas comuns".

**7. Design**
- Tema escuro, tipografia técnica (mono para código), destaque para trechos de código.
- Sem cara genérica de SaaS roxo.

## Detalhes técnicos

- Stack: TanStack Start + Lovable Cloud (auth + Postgres + RLS).
- RLS: `subscriptions` só o próprio user lê; admin lê tudo via `has_role`.
- Rota `_authenticated/curso` gated no client; server functions verificam `subscription.status = 'active' AND expires_at > now()` antes de retornar conteúdo detalhado.
- Conteúdo dos módulos vive em MDX/TS no repo (não banco) — mais fácil de editar.
- Sem pagamento automático nesta versão. Se depois quiser Stripe, plugamos.

## Ordem de execução

1. Ativar Lovable Cloud + auth (email/senha + Google).
2. Migração: `app_role` enum, `user_roles`, `has_role`, `subscriptions`, trigger de admin, políticas RLS.
3. Rotas: `/`, `/auth`, `_authenticated/curso`, `_authenticated/curso/$moduleId`, `_authenticated/admin`.
4. Escrever conteúdo dos 24 módulos.
5. Design system escuro + componentes.

## Confirmação
Email admin confirmado: **davilucasbogasdeoliveira@gmail.com** ✓

Aprova pra eu começar?
