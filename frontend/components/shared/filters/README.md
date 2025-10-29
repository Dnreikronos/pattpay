# SearchFilterBar Component

Componente pai compartilhado para manter consistência visual nos filtros em toda a aplicação.

## Objetivo

Garantir que todos os filtros tenham o mesmo padrão visual e comportamento:
- Search input com border azul (brand)
- Filter popover com mesmo estilo
- Active filter chips animados
- Layout consistente

## Uso

### Exemplo básico (Payments)

```tsx
import { SearchFilterBar } from '@/components/shared/filters/SearchFilterBar'

export function PaymentFilters({ filters, onFiltersChange }) {
  const filterContent = (
    <div className="flex flex-col">
      {/* Seu conteúdo de filtro customizado */}
    </div>
  )

  return (
    <SearchFilterBar
      searchValue={filters.search}
      onSearchChange={(value) => onFiltersChange({ ...filters, search: value })}
      searchPlaceholder="Search by hash or wallet..."
      showSearch={true}
      filterContent={filterContent}
      hasActiveFilters={filters.status !== 'all'}
      activeFilterCount={filters.status !== 'all' ? 1 : 0}
      filterChips={[
        {
          label: `Search: "${filters.search}"`,
          onRemove: () => onFiltersChange({ ...filters, search: '' })
        }
      ]}
    />
  )
}
```

### Exemplo avançado (Dashboard)

```tsx
import { SearchFilterBar } from '@/components/shared/filters/SearchFilterBar'
import { FilterPopover } from './FilterPopover'
import { useFilterStore } from '@/lib/stores/filter-store'

export function DashboardFilters() {
  const { hasActiveFilters, clearFilters } = useFilterStore()

  return (
    <SearchFilterBar
      showSearch={false} // Dashboard não usa search
      filterContent={<FilterPopover />}
      hasActiveFilters={hasActiveFilters()}
      // Chips podem vir de um componente separado (FilterChips)
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchValue` | `string` | `''` | Valor atual do search |
| `onSearchChange` | `(value: string) => void` | - | Callback quando search muda (debounced 300ms) |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder do input de search |
| `showSearch` | `boolean` | `true` | Mostrar ou esconder o search input |
| `filterContent` | `React.ReactNode` | - | Conteúdo customizado do popover de filtros |
| `hasActiveFilters` | `boolean` | `false` | Se há filtros ativos |
| `activeFilterCount` | `number` | `0` | Número de filtros ativos (badge) |
| `onClearFilters` | `() => void` | - | Callback para limpar todos os filtros |
| `filterChips` | `FilterChip[]` | `[]` | Array de chips a serem exibidos |

### FilterChip Type

```tsx
interface FilterChip {
  label: string      // Texto do chip
  onRemove: () => void  // Callback ao remover
}
```

## Padrão Visual

✅ **Search Input**
- Border: `border-2 border-brand`
- Focus: `focus-visible:border-brand`
- Font: `font-mono`
- Icon: Search (esquerda), X para clear (direita)

✅ **Filter Button**
- Border: `border-2 border-border`
- Hover: `hover:border-brand/30`
- Badge de contagem quando há filtros ativos
- Icon: SlidersHorizontal

✅ **Filter Chips**
- Border: `border-2 border-brand`
- Background: `bg-brand/5`
- Animação: motion com scale/opacity
- Icon X para remover

## Implementações Atuais

1. **PaymentFiltersRefactored** (`app/dashboard/payments/_components/`)
   - Usa search + status filter
   - Exemplo completo de uso

2. **FilterButton** (`app/dashboard/_components/`)
   - Usa apenas filter popover (sem search)
   - Chips vêm do componente FilterChips separado
   - Usa Zustand store para estado

## Migração

Para migrar filtros existentes:

1. Importar `SearchFilterBar`
2. Passar o conteúdo do filtro como `filterContent`
3. Construir array de `filterChips` baseado nos filtros ativos
4. Remover código duplicado de search/filter UI

## Benefícios

✅ Consistência visual em toda aplicação
✅ Menos código duplicado
✅ Fácil manutenção de estilos
✅ Comportamento padronizado (debounce, animações)
