# Configuración DevOps

## Repositorio

El código fuente del proyecto se gestiona mediante un repositorio en :contentReference[oaicite:1]{index=1}.

## Estrategia de Ramas

main
Rama principal estable.

develop
Rama de integración de desarrollo.

feature/*
Ramas utilizadas para el desarrollo de nuevas funcionalidades.

## Integración Continua

Se configuró un pipeline de integración continua que ejecuta:

- Instalación de dependencias
- Compilación del proyecto
- Ejecución de pruebas básicas

## Objetivo

Garantizar control de versiones, automatización de procesos y calidad en el desarrollo del software.