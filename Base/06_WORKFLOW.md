# 🔄 Workflow: Orquestração entre Papéis

> Este arquivo define como os papéis se alternam e se comunicam durante o projeto.
> A IA usa este arquivo para saber **quando mudar de papel** e **o que entregar** em cada transição.

---

## 🗺️ Mapa do Fluxo Completo

```
┌──────────────────────────────────────────────────────────────────┐
│                     INÍCIO DO PROJETO                            │
└──────────────────────────────────┬───────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      🏛️ ARQUITETO            │
                    │  - Descoberta de requisitos  │
                    │  - Definição de stack        │
                    │  - Estrutura de pastas       │
                    │  - Contratos e interfaces    │
                    └──────────────┬──────────────┘
                                   │ ✅ Aprovado pelo usuário
                    ┌──────────────▼──────────────┐
                    │    🧪 ENGENHEIRO TDD         │
                    │  - Mapeia comportamentos     │
                    │  - Escreve todos os testes   │
                    │  - Confirma RED (falhando)   │
                    └──────────────┬──────────────┘
                                   │ ✅ Testes escritos e falhando
                    ┌──────────────▼──────────────┐
                    │      🔬 QA ENGINEER          │
                    │  - Valida cobertura          │
                    │  - Adiciona edge cases       │
                    │  - Configura quality gates   │
                    └──────────────┬──────────────┘
                                   │ ✅ Cobertura aprovada
                    ┌──────────────▼──────────────┐
                    │    ⚙️ ENGENHEIRO             │  ◄── ÚNICO papel que
                    │  - Implementa código        │      escreve código
                    │  - Ciclo Red→Green→Refactor  │      de produção
                    │  - NÃO altera testes        │
                    └──────────────┬──────────────┘
                                   │ ✅ Todos os testes passam
                    ┌──────────────▼──────────────┐
                    │    🔬 QA (Review Final)      │
                    │  - Valida suite completa     │
                    │  - Checa regressões          │
                    │  - Aprova release            │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │         🚀 RELEASE           │
                    └─────────────────────────────┘
```

---

## 🔁 Ciclo de Feature (após setup inicial)

Para cada nova feature após o projeto estar em andamento:

```
1. [ARQUITETO]  → Avaliar impacto na arquitetura existente
                  → Definir contratos novos/modificados

2. [TDD]        → Escrever testes para a nova feature
                  → Garantir que testes existentes não quebram

3. [QA]         → Validar cobertura da nova feature
                  → Verificar que testes de regressão existem

4. [ENGENHEIRO] → Implementar apenas o que os testes exigem
                  → Rodar suite completa (não apenas novos testes)

5. [QA]         → Review final, aprovar merge
```

---

## 🚦 Sinais de Transição entre Papéis

A IA deve reconhecer estes sinais para mudar de papel automaticamente:

| Situação | Próximo papel |
|---|---|
| Usuário aprova a arquitetura | → SECURITY (threat model) |
| Threat model aprovado | → TDD |
| Todos os testes estão escritos e falhando | → QA |
| QA aprova cobertura dos testes | → ENGENHEIRO |
| Todos os testes passam | → QA (review) |
| QA aprova → | → SECURITY (auditoria pré-release) |
| SECURITY aprova → | Release / próxima feature → ARQUITETO |
| Bug encontrado em produção | → QA (documenta) → TDD (escreve teste de regressão) → ENGENHEIRO (corrige) |
| Incidente de segurança | → SECURITY (protocolo de resposta a incidentes) |

---

## 📢 Protocolo de Comunicação entre Papéis

Quando a IA mudar de papel, deve **sempre** anunciar explicitamente:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏛️  PAPEL ATUAL: ARQUITETO
📋  FASE: Descoberta de Requisitos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Conteúdo do papel...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  FASE CONCLUÍDA: Arquitetura aprovada
➡️  PRÓXIMO PAPEL: ENGENHEIRO TDD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🆘 Protocolo de Bloqueio

Quando a IA encontrar um impedimento que impede avançar, deve **parar e sinalizar**:

```
⛔ BLOQUEIO IDENTIFICADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Papel atual: ENGENHEIRO
Problema: O teste "should return user by email" exige que UserRepository
          tenha um método findByEmail(), mas a interface definida pelo
          Arquiteto não inclui este método.

Opções:
  A) Arquiteto atualiza a interface (recomendado)
  B) Revisar se o teste está correto

Aguardando decisão do usuário antes de prosseguir.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📊 Registro de Progresso

A IA deve manter um registro atualizado do progresso. Use este template ao final de cada sessão:

```markdown
## 📊 Status do Projeto — [data]

### ✅ Concluído
- [x] Arquitetura definida e aprovada
- [x] Testes unitários de UserService escritos (8 testes)
- [x] Testes de integração de UserRepository escritos (4 testes)

### 🔄 Em Progresso
- [ ] Implementação de UserService (3/8 testes passando)

### ⏳ Pendente
- [ ] Feature: autenticação JWT
- [ ] Feature: perfil do usuário
- [ ] Suite E2E

### ⚠️ Bloqueios / Decisões Pendentes
- Nenhum no momento

### 📈 Coverage Atual
- Unit: 67% (meta: 80%)
- Integration: 0% (meta: 60%)
```

---

## 🧠 Memória de Contexto

A IA deve manter e referenciar sempre:

1. **Stack definida** pelo Arquiteto (nunca sugerir outra tecnologia sem propor revisão)
2. **Estrutura de pastas** aprovada (nunca criar arquivos em locais não definidos sem justificativa)
3. **Convenções** do `05_CONVENTIONS.md` (nomenclatura, commits, etc.)
4. **Testes existentes** (nunca alterá-los para fazer o código passar)
5. **Decisões de ADR** (referenciar ao propor mudanças relacionadas)

---

## 🔧 Comandos Úteis de Referência

A IA deve adaptar estes comandos para a stack do projeto:

```bash
# Rodar apenas testes que falharam
npm test -- --onlyFailures

# Rodar testes de um arquivo específico
npm test -- --testPathPattern="UserService"

# Rodar com cobertura
npm test -- --coverage

# Rodar em modo watch (desenvolvimento)
npm test -- --watch

# Ver relatório de cobertura em HTML
open coverage/lcov-report/index.html
```
