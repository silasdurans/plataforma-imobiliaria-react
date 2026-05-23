# Supabase Storage

Projeto: `erhzqyzqyitfizafixlc`
URL: `https://erhzqyzqyitfizafixlc.supabase.co`

## Buckets

| Bucket                 | Visibilidade | Uso                                      |
|------------------------|--------------|------------------------------------------|
| `driver-bip`           | Public       | Fotos do BIP dos motoristas              |
| `delivery-signatures`  | Public       | Imagens de assinatura das entregas       |

## Integração

Cliente e funções utilitárias em `src/app/lib/supabase.ts`.

### Funções disponíveis

```ts
import { uploadImage, getImageUrl, deleteImage, BUCKETS } from '@/app/lib/supabase'

// Upload — retorna a URL pública do arquivo
await uploadImage(BUCKETS.driverBip, `motorista-${id}.jpg`, file)
await uploadImage(BUCKETS.deliverySignatures, `entrega-${id}.png`, blob)

// Leitura — retorna a URL pública de um arquivo existente
await getImageUrl(BUCKETS.driverBip, `motorista-${id}.jpg`)

// Remoção
await deleteImage(BUCKETS.driverBip, `motorista-${id}.jpg`)
```

### Convenção de nomes de arquivo

- BIP do motorista: `motorista-{id}.jpg`
- Assinatura de entrega: `entrega-{id}.png`

## Variáveis de ambiente

Definidas em `.env` (não versionado):

```
VITE_SUPABASE_URL=https://erhzqyzqyitfizafixlc.supabase.co
VITE_SUPABASE_ANON_KEY=...
```
