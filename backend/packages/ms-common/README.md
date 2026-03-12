# @une/ms-common

Librería compartida con utilidades comunes para todos los microservicios de UNE.

## Características

### Filters

#### RpcExceptionFilter
Filtro para mantener el formato consistente de excepciones RPC en las comunicaciones entre microservicios.

**Uso:**
```typescript
import { RpcExceptionFilter } from '@une/ms-common/filters';

@UseFilters(new RpcExceptionFilter())
@Controller()
export class MyController {
  // ...
}
```

#### HttpErrorFilter
Filtro para convertir objetos planos de rxjs en respuestas formateadas para el frontend con código y mensaje correcto.

**Uso:**
```typescript
import { HttpErrorFilter } from '@une/ms-common/filters';

@UseFilters(new HttpErrorFilter())
@Controller()
export class MyController {
  // ...
}
```

### Exceptions

#### BaseRPCException
Excepción base que herede de `RpcException` y establece una interfaz fija para el manejo de excepciones RPC.

**Uso:**
```typescript
import { BaseRPCException } from '@une/ms-common/exceptions';

throw new BaseRPCException(
  400,
  'Usuario no encontrado',
  'USER_NOT_FOUND',
  { userId: '123' }
);
```

## Instalación

Este es un package privado del workspace. Incluirlo como dependencia en otros packages:

```json
{
  "dependencies": {
    "@une/ms-common": "*"
  }
}
```

## Entry Points

El package expone los siguientes entry points:

- `@une/ms-common` - Exporta todo
- `@une/ms-common/filters` - Solo filtros
- `@une/ms-common/exceptions` - Solo excepciones

## Estructura

```
src/
├── exceptions/
│   ├── base-rpc.exception.ts
│   └── index.ts
├── filters/
│   ├── rpc-exception.filter.ts
│   ├── http-error.filter.ts
│   └── index.ts
└── index.ts
```
