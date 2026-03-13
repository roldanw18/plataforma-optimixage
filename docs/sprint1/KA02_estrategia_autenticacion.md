# Knowledge Acquisition 02
Definición de Estrategia de Autenticación

## Objetivo
Definir el mecanismo de autenticación más adecuado para la plataforma, garantizando seguridad y control de acceso.

## Alternativas Evaluadas

### Session-based Authentication
Autenticación basada en sesiones almacenadas en el servidor.

Ventajas:
- Implementación sencilla
- Manejo directo en aplicaciones web tradicionales

Desventajas:
- Escalabilidad limitada
- Dependencia de estado en el servidor

### JSON Web Tokens (JWT)

Autenticación basada en tokens firmados que permiten mantener un sistema stateless.

Ventajas:
- Escalabilidad
- Ideal para arquitecturas basadas en APIs
- Amplia adopción en aplicaciones modernas

Desventajas:
- Manejo cuidadoso de expiración y seguridad

## Estrategia Seleccionada

Se utilizará autenticación basada en **JWT**.

## Justificación

JWT permite implementar un sistema de autenticación seguro y escalable, ideal para arquitecturas modernas basadas en APIs REST y aplicaciones web desacopladas.