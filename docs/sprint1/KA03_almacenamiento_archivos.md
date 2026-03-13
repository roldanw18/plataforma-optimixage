# Knowledge Acquisition 03
Estrategia de Almacenamiento de Archivos

## Objetivo
Definir el mecanismo de almacenamiento para documentos asociados a los proyectos dentro de la plataforma.

## Alternativas Evaluadas

### Almacenamiento en Base de Datos
Guardar archivos directamente como blobs en la base de datos.

Ventajas:
- Centralización de datos

Desventajas:
- Impacto en rendimiento
- Crecimiento rápido de la base de datos

### Almacenamiento en Sistema de Archivos

Guardar documentos en el servidor y almacenar solo la referencia en la base de datos.

Ventajas:
- Mejor rendimiento
- Mayor simplicidad de implementación

Desventajas:
- Requiere control de acceso adecuado

### Almacenamiento en Cloud

Uso de servicios como almacenamiento en la nube.

Ventajas:
- Escalabilidad
- Alta disponibilidad

Desventajas:
- Mayor complejidad inicial

## Estrategia Seleccionada

Se utilizará almacenamiento en **sistema de archivos del servidor**, guardando únicamente la ruta del archivo en la base de datos.

## Justificación

Permite una implementación simple y eficiente para la primera versión del sistema, con posibilidad de migrar posteriormente a almacenamiento en la nube.