# Testes

## Comandos

```bash
npm test              # Executar testes
npm run test:watch    # Modo watch
npm run test:coverage # Com cobertura
```

## Estrutura

```
tests/
├── unit/            # Testes unitários
├── fixtures/        # Dados de teste
└── coverage-results/ # Relatórios (gerado)
```

## Padrão AAA

```typescript
test('descrição', () => {
  // ARRANGE - Preparar
  const input = { ... };

  // ACT - Executar
  const result = functionToTest(input);

  // ASSERT - Verificar
  expect(result).toBe(expected);
});
```

## Metas de Cobertura

- Linhas: ≥ 70%
- Branches: ≥ 60%
- Módulos críticos: ≥ 85%
