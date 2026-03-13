# Knowledge Acquisition 01
Evaluación de Stack Tecnológico

## Objetivo
Evaluar diferentes alternativas tecnológicas para el desarrollo de la plataforma de seguimiento de proyectos y seleccionar el stack más adecuado para el sistema.

## Opciones Evaluadas

### Frontend
- React
- Vue

### Backend
- Node.js (Express)
- .NET
- FastAPI
- Django

### Base de Datos
- PostgreSQL
- MySQL

## Criterios de Evaluación

- Facilidad de desarrollo
- Comunidad y soporte
- Escalabilidad
- Integración con herramientas DevOps
- Compatibilidad con despliegue en la nube

## Stack Seleccionado

Frontend:  
React

Backend:  
FastAPI (Python)

Base de Datos:  
PostgreSQL

ORM:
SQLAlchemy

Autenticacion:
JWT

DevOps:
Azure DevOps

## Justificación

El stack seleccionado permite construir una arquitectura modular basada en APIs, facilita la integración con herramientas de CI/CD y cuenta con amplio soporte en la comunidad de desarrollo.

## ¿Por que el FastAPI y no Node.js?
Aunque Node.js es ampliamente utilizado en el desarrollo de APIs y aplicaciones web modernas, se decidió utilizar FastAPI debido a su integración natural con el lenguaje Python, el cual ya forma parte del ecosistema tecnológico del equipo de desarrollo.

FastAPI permite construir APIs REST de alto rendimiento con una sintaxis clara y concisa, lo que facilita un desarrollo más rápido y mantenible. Además, ofrece documentación automática de endpoints, validación de datos basada en tipos y una arquitectura adecuada para aplicaciones backend modernas.

Dado que el proyecto requiere principalmente gestión de datos, autenticación, lógica de negocio y exposición de servicios API, FastAPI proporciona una solución eficiente que reduce la complejidad del desarrollo y mejora la productividad.

Por estas razones, FastAPI fue seleccionado como framework backend para la plataforma.