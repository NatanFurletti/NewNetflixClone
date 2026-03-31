# 📏 Convenções e Padrões do Projeto

> Este arquivo é uma **referência permanente** consultada por todos os papéis.
> Deve ser adaptado para a stack escolhida pelo Arquiteto, mas a estrutura é universal.

---

## 📁 Nomenclatura de Arquivos

| Tipo | Padrão | Exemplo |
|---|---|---|
| Componente/Classe | PascalCase | `UserService.ts`, `OrderRepository.ts` |
| Arquivo de teste | `[nome].spec.ts` ou `[nome].test.ts` | `UserService.spec.ts` |
| Teste E2E | `[fluxo].e2e.spec.ts` | `checkout.e2e.spec.ts` |
| Utilitários/helpers | kebab-case | `date-formatter.ts`, `string-utils.ts` |
| Tipos/Interfaces | PascalCase com sufixo | `UserDto.ts`, `OrderEntity.ts` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT_MS` |
| Enums | PascalCase | `UserStatus`, `PaymentMethod` |

---

## 🗂️ Estrutura de Commit (Conventional Commits)

```
<tipo>(<escopo>): <descrição curta>

[corpo opcional]

[rodapé opcional: refs, breaking changes]
```

### Tipos Permitidos

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `test` | Adição/modificação de testes |
| `refactor` | Refatoração sem mudança de comportamento |
| `docs` | Documentação |
| `chore` | Configuração, build, CI |
| `perf` | Melhoria de performance |
| `revert` | Reversão de commit anterior |

### Exemplos

```bash
feat(auth): add JWT refresh token rotation
fix(orders): prevent duplicate order creation on network retry
test(users): add edge cases for email validation
refactor(payments): extract payment processor to dedicated service
```

---

## 🌿 Estratégia de Branches

```
main          ← produção (protegida, só via PR)
  └── develop ← integração (protegida, só via PR)
        ├── feature/[ticket]-[descricao-curta]
        ├── fix/[ticket]-[descricao-curta]
        └── refactor/[ticket]-[descricao-curta]
```

### Regras

- Branch names em **kebab-case**
- Sempre referenciar o número do ticket/issue
- Nunca commitar direto em `main` ou `develop`
- PRs devem ter ao menos 1 aprovação antes do merge
- Squash merge para manter histórico limpo

---

## 📝 Padrões de Código

### Funções

```typescript
// Máximo de 20 linhas por função
// Se ultrapassar, extraia responsabilidades

// Funções puras quando possível (sem efeitos colaterais)
const calculateTotal = (items: CartItem[]): Money => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// Nomeie pelo que FAZ, não pelo como faz
// ❌ processData(), handleThing(), doStuff()
// ✅ calculateOrderTotal(), sendWelcomeEmail(), validateUserAge()
```

### Tipos e Interfaces (TypeScript)

```typescript
// Prefira types para unions/intersections e interfaces para objetos extensíveis
type UserId = string & { readonly brand: 'UserId' } // branded types para segurança

interface UserRepository {
  findById(id: UserId): Promise<User | null>
  save(user: User): Promise<void>
}

// DTOs: sempre sufixo Dto
interface CreateUserDto {
  email: string
  name: string
  password: string
}

// Entidades: sufixo Entity ou sem sufixo (preferência do projeto)
interface User {
  id: UserId
  email: Email
  status: UserStatus
}
```

### Tratamento de Erros

```typescript
// Erros de domínio são classes, não strings
export class DomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidationError extends DomainError {}
export class NotFoundError extends DomainError {}
export class UnauthorizedError extends DomainError {}
```

---

## 🌐 Padrões de API (se aplicável)

### REST

```
GET    /resources          → lista recursos
GET    /resources/:id      → busca um recurso
POST   /resources          → cria recurso
PUT    /resources/:id      → substitui recurso completo
PATCH  /resources/:id      → atualiza campos parciais
DELETE /resources/:id      → remove recurso
```

### Respostas de Sucesso

```json
{
  "data": { "id": "123", "email": "user@example.com" },
  "meta": { "timestamp": "2024-01-15T10:30:00Z" }
}
```

### Respostas de Erro

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with id '123' was not found",
    "details": []
  }
}
```

---

## 📊 Logging

```typescript
// Use níveis semânticos
logger.error('Payment failed', { orderId, error: err.message }) // impede fluxo
logger.warn('Retry attempt', { attempt, maxRetries })            // degradação
logger.info('Order created', { orderId, userId })               // evento de negócio
logger.debug('Cache miss', { key })                             // diagnóstico (dev)

// NUNCA logue dados sensíveis
// ❌ logger.info('User logged in', { password: user.password })
// ✅ logger.info('User logged in', { userId: user.id, email: user.email })
```

---

## 🔒 Segurança (checklist mínimo)

- [ ] Nunca expor stack traces em respostas de API em produção
- [ ] Validar e sanitizar TODO input externo na borda do sistema
- [ ] Usar variáveis de ambiente para configurações sensíveis (nunca hardcode)
- [ ] Versionar dependências com lockfile commitado
- [ ] Rate limiting em endpoints públicos
- [ ] HTTPS obrigatório em produção
- [ ] Autenticação e autorização em toda rota protegida
- [ ] Logs sem dados sensíveis (PII, senhas, tokens)

---

## ⚙️ Variáveis de Ambiente

```bash
# .env.example (SEMPRE commitar este arquivo, nunca o .env)
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=change-me-in-production
PORT=3000
NODE_ENV=development

# Convenção de nomenclatura
# SCREAMING_SNAKE_CASE
# Prefixo por categoria: DB_, JWT_, SMTP_, STRIPE_, etc.
```

---

## 📚 Documentação Obrigatória

Todo projeto deve ter:

| Arquivo | Conteúdo |
|---|---|
| `README.md` | Setup, como rodar, como testar |
| `docs/adr/` | Architecture Decision Records |
| `CHANGELOG.md` | Mudanças por versão (gerado automaticamente se possível) |
| `.env.example` | Todas as variáveis necessárias com valores de exemplo |
| `docs/api.md` ou OpenAPI | Contrato da API (se existir) |
