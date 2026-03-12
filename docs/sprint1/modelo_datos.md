# Modelo de Datos

## Descripción

El sistema utiliza un modelo relacional para gestionar usuarios, proyectos y el progreso de los procesos de digitalización.

## Entidades Principales

Usuarios
Información de acceso y rol dentro del sistema.

Proyectos
Representa cada proceso de transformación o digitalización asociado a un cliente.

Etapas
Define las fases del proceso de implementación.

HistorialEtapas
Registro histórico de cambios de estado de cada proyecto.

## Relaciones

Un usuario puede tener múltiples proyectos.

Un proyecto puede tener múltiples registros de historial de etapas.

Cada registro de historial corresponde a una etapa específica.

## Objetivo del Modelo

Permitir el seguimiento estructurado del avance de cada proyecto dentro de la plataforma.

## ------------
El siguiente diagrama entidad–relación representa la estructura del modelo de datos del sistema, incluyendo las entidades principales y las relaciones que permiten gestionar usuarios, proyectos, procesos, documentos y comunicación dentro de la plataforma.

El modelo de datos incluye una entidad de auditoría, la cual permite registrar eventos relevantes dentro del sistema, garantizando trazabilidad de acciones y facilitando el monitoreo y control de cambios realizados por los usuarios.

Se implementa una tabla de categorías de documentos con el fin de normalizar la clasificación de archivos dentro del sistema. Esto permite mejorar la organización, facilitar los filtros y garantizar consistencia en la información almacenada.