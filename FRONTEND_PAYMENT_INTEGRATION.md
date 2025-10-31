# Integração de Pagamentos no Frontend

Este documento descreve como o frontend deve conduzir o fluxo de pagamentos da PattPay, distinguindo os cenários de cobrança recorrente e pagamento único, e explicando quais endpoints precisam ser chamados em cada etapa.

---

## Visão Geral do Processo

1. **Carregar o link de pagamento** para obter as informações do plano (tipo de pagamento, tokens aceitos, preços, recebedor).
2. **Coletar dados do usuário** (nome, e-mail opcional) e permitir que escolha o token suportado pelo plano.
3. **Executar o fluxo específico**:
   - Recorrente: aprovar delegação on-chain e registrar a assinatura no backend.
   - Único: transferir os tokens diretamente e registrar a execução no backend.
4. **Tratar respostas e erros** exibindo feedback ao usuário e atualizando o estado do checkout.

> Todos os endpoints expostos para o checkout estão sob o prefixo `/api`.

---

## 1. Carregamento do link de pagamento

- **Endpoint**: `GET /api/links/public/:id`
- **Autenticação**: nenhuma (público)

Esse endpoint retorna apenas links ativos e não expirados. A resposta traz:
- Nome e descrição do plano.
- Indicador `isRecurring`.
- Lista `tokenPrices` com `token`, `tokenMint`, `tokenDecimals` e `price`.
- Dados do recebedor (nome e `walletAddress`).
- Metadados como `redirectUrl`, `expiresAt`, `durationMonths` e `periodSeconds`.

Use essas informações para montar o checkout, permitir a seleção do token e validar se o fluxo é recorrente ou único.

---

## 2. Fluxo Recorrente (assinaturas)

### Pré-requisitos

- O plano retornado precisa ter `isRecurring: true`.
- O token selecionado deve existir em `tokenPrices`. Utilize o `tokenMint` e `tokenDecimals` exatos fornecidos.

### 2.1 Aprovação on-chain

Antes de chamar o backend, o usuário deve aprovar a delegação via instrução `approve_delegate` do contrato Solana. Parâmetros importantes:

- `subscriptionId`: gere um UUID client-side e reutilize no cálculo do PDA para `delegateAuthority`.
- `approvedAmount`: valor máximo que o relayer poderá cobrar; normalmente `price * durationMonths`.
- `payer`: wallet do usuário.
- `receiver`: `walletAddress` do recebedor retornado pelo plano.
- `tokenMint` e `tokenAccount`: correspondentes ao token escolhido.

Capture os resultados:

- `delegateTxSignature`: assinatura da transação de aprovação.
- `delegateAuthority`: PDA calculado no contrato.
- `delegateApprovedAt`: timestamp ISO (`new Date().toISOString()`) do momento da aprovação.

### 2.2 Registro da assinatura

- **Endpoint**: `POST /api/subscribe`
- **Autenticação**: nenhuma (público)
- **Body**:

```json
{
  "payer": {
    "walletAddress": "WALLET_DO_USUARIO",
    "name": "Nome do Usuário",
    "email": "user@example.com"
  },
  "planId": "UUID_DO_PLANO",
  "tokenMint": "TOKEN_MINT_ESCOLHIDO",
  "delegateTxSignature": "ASSINATURA_DA_APROVACAO",
  "delegateAuthority": "PDA_DA_DELEGACAO",
  "delegateApprovedAt": "2025-01-10T10:30:00.000Z"
}
```

Campos obrigatórios:
- `payer.walletAddress` e `payer.name`.
- `planId`, `tokenMint`, `delegateTxSignature`, `delegateAuthority`, `delegateApprovedAt`.
- `payer.email` é opcional.

Caso haja validações falhando (plano inativo, token não suportado, assinatura duplicada), o endpoint responde com status `4xx` explicando o motivo.

### 2.3 Resposta esperada

A resposta `201` traz:
- `subscription`: objeto completo da assinatura (inclui plano, recebedor, datas de cobrança).
- `payer`: dados do pagador e flag `isNew`.
- Mensagem de sucesso.

Guarde o `subscription.id` para que o usuário possa gerenciar a assinatura (ex.: cancelar).

### 2.4 Cancelamento (após revogação on-chain)

- **Endpoint**: `DELETE /api/subscriptions/:id`
- **Autenticação**: bearer token do recebedor.
- Deve ser chamado somente depois que o usuário revogar a delegação no contrato (`revoke_delegate`). O backend apenas persiste o cancelamento.

---

## 3. Fluxo de Pagamento Único

### Pré-requisitos

- O plano deve vir com `isRecurring: false`.
- Selecionar um token listado em `tokenPrices`.

### 3.1 Transferência on-chain

O usuário realiza a transferência diretamente para o `receiver.walletAddress` usando o token escolhido. Após a confirmação:
- Capture `txSignature`.
- Guarde o valor efetivamente transferido (`amount`).
- Opcional: capture a wallet do pagador para enviar em `executedBy`.

### 3.2 Registro do pagamento

- **Endpoint**: `POST /api/payment-executions`
- **Autenticação**: nenhuma (público)
- **Body**:

```json
{
  "planId": "UUID_DO_PLANO",
  "txSignature": "ASSINATURA_DA_TRANSFERENCIA",
  "tokenMint": "TOKEN_MINT_ESCOLHIDO",
  "amount": 25.5,
  "executedBy": "WALLET_DO_USUARIO"
}
```

Regras:
- `amount` deve ser um número > 0 (use unidades inteiras conforme os decimais do token).
- O backend valida se o plano é realmente one-time e se o token faz parte do plano.
- Transações duplicadas (mesma `txSignature`) retornam `409` com o `paymentExecutionId` já existente.

### 3.3 Resposta esperada

Status `201` com:
- `paymentExecution`: registro completo (inclui dados do plano e recebedor).
- Mensagem de sucesso.

---

## 4. Tabela de Endpoints Utilizados

| Endpoint | Método | Autenticação | Uso no Frontend |
| --- | --- | --- | --- |
| `/api/links/public/:id` | `GET` | Pública | Carregar dados do link antes do checkout |
| `/api/subscribe` | `POST` | Pública | Registrar assinatura recorrente após `approve_delegate` |
| `/api/payment-executions` | `POST` | Pública | Registrar pagamento único após transferência |
| `/api/subscriptions/:id` | `DELETE` | Bearer (recebedor) | Cancelar assinatura após revogar delegação |

---

## 5. Boas Práticas de UI

- Trate mensagens de erro do backend exibindo o `message` retornado.
- Para assinaturas, sinalize ao usuário que a primeira cobrança ocorre no instante da delegação (`lastPaidAt`).
- Após respostas de sucesso:
  - Redirecione para `redirectUrl` caso fornecida;
  - Ou apresente confirmação com detalhes (`token`, valor, datas).
- Registre métricas de falhas para monitorar problemas de integração.

Com esses passos o frontend fica alinhado com os fluxos implementados no backend, reduzindo retrabalho e garantindo a consistência dos registros de pagamento.
