# 📁 Project Foundation — Guia Mestre

> Este conjunto de arquivos define a base sólida para qualquer projeto de software.
> Siga a ordem abaixo. Cada arquivo tem um propósito específico e deve ser lido antes de qualquer ação.

---

## 🗂️ Estrutura dos Arquivos

| Arquivo | Papel da IA | Quando usar |
|---|---|---|
| `01_ARCHITECT.md` | Arquiteto de Software | Início do projeto — define estrutura, stack e decisões técnicas |
| `02_TDD_STRATEGY.md` | Engenheiro Sênior + QA Lead | Após arquitetura — define estratégia de testes antes do código |
| `03_QA_ENGINEER.md` | QA Engineer | Durante e após desenvolvimento — cobertura, qualidade e bugs |
| `04_ENGINEER.md` | Engenheiro de Software | Após testes escritos — implementa código para passar nos testes |
| `05_CONVENTIONS.md` | Referência permanente | Durante todo o projeto — padrões, nomenclatura e boas práticas |
| `06_WORKFLOW.md` | Orquestrador | Coordena a sequência entre os papéis acima |
| `07_SECURITY.md` | Security Engineer | Transversal — threat modeling, OWASP, secrets, incidentes |

---

## ⚡ Ordem de Execução Obrigatória

```
1. ARCHITECT   → Define stack, estrutura de pastas, decisões de design
2. SECURITY    → Threat modeling, superfície de ataque, requisitos de segurança
3. TDD         → Escreve todos os testes ANTES de qualquer implementação (inclui testes de segurança)
4. QA          → Valida cobertura dos testes, edge cases, contrato de qualidade
5. ENGINEER    → Implementa o código para passar nos testes (sem alterar testes)
6. QA (review) → Valida que tudo passa, busca regressões e bugs
7. SECURITY    → Auditoria pré-release, checklist OWASP, scan de secrets
```

> ⚠️ **Regra de ouro:** Nenhuma linha de código de implementação deve existir antes dos testes correspondentes estarem escritos e falhando (red). O desenvolvimento só avança quando o ciclo Red → Green → Refactor é respeitado.

---

## 🧭 Como usar estes arquivos

Ao iniciar uma conversa com a IA para um novo projeto, cole o seguinte prompt de ativação:

```
Leia os arquivos de fundação do projeto na seguinte ordem antes de qualquer ação:
1. 00_INDEX.md     — visão geral e ordem de execução
2. 01_ARCHITECT.md — seu papel como arquiteto
3. 02_TDD_STRATEGY.md — estratégia de testes
4. 03_QA_ENGINEER.md — papel de QA
5. 04_ENGINEER.md  — papel de engenheiro
6. 05_CONVENTIONS.md — convenções do projeto
7. 06_WORKFLOW.md  — fluxo de trabalho

Após a leitura, assuma o papel de ARQUITETO e me faça as perguntas necessárias para iniciar o projeto.
```
