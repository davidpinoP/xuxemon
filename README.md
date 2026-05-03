# XUXEMONS

Xuxemons es una aplicacion web gamificada desarrollada con Angular en el frontend, Laravel en el backend y Docker para el despliegue.

El proyecto permite a los usuarios registrarse, iniciar sesion, gestionar su perfil, coleccionar Xuxemons, administrar su mochila, alimentar criaturas, curarlas con vacunas y relacionarse con otros jugadores mediante amistades.

## Tecnologias usadas

- Angular
- Laravel
- MySQL
- Docker Compose
- JWT para autenticacion

## Funcionalidades principales

### Nivel 1 - Autenticacion y Perfil

- Registro de usuarios
- Login con `player_id` y contrasena
- Generacion automatica de ID tipo `#NombreXXXX`
- Primer usuario registrado como administrador
- Edicion de perfil
- Baja de cuenta
- Proteccion de rutas con JWT

### Nivel 2 - Inventario y Coleccion

- Mochila con 20 espacios
- Objetos apilables y no apilables
- 3 tipos de xuxes
- Xuxedex con catalogo y coleccion del usuario
- Repetidos visibles
- Panel admin para regalar xuxes y Xuxemons

### Nivel 3 - Mecanicas avanzadas

- Evolucion de Xuxemons por alimentacion
- Enfermedades
- Vacunas
- Recompensa diaria
- Configuracion de parametros del juego desde admin

### Nivel 4 - Social y Despliegue

- Busqueda de usuarios por ID
- Envio y gestion de solicitudes de amistad
- Lista de amigos
- Despliegue completo con Docker

### Nivel 5 - Seguridad y SEO

- JWT con expiracion
- Auto-login con token valido
- Logout automatico en error 401
- Meta tags SEO
- Mejoras de accesibilidad y estructura semantica

## Estructura del proyecto

- `Frontend/xuxemons` -> aplicacion Angular
- `Backend/Xuxemon_Bknd` -> API Laravel
- `docker-compose.yml` -> despliegue de frontend, backend y base de datos

## Puesta en marcha

Levantar contenedores:

```bash
docker compose up -d --build
```

Ejecutar migraciones:

```bash
docker compose exec backend php artisan migrate
```

Cargar seeders principales:

```bash
docker compose exec backend php artisan db:seed --class=Database\\Seeders\\XuxemonSeeder
docker compose exec backend php artisan db:seed --class=Database\\Seeders\\UserSeeder
docker compose exec backend php artisan db:seed --class=Database\\Seeders\\ConfigSeeder
```

## Accesos

Frontend:
- `http://localhost:4200`

Backend:
- `http://localhost:8000`

Base de datos:
- `localhost:3307`

## Objetivo del proyecto

El objetivo de Xuxemons es aplicar conocimientos de desarrollo web cliente y servidor en una aplicacion completa, integrando autenticacion, logica de juego, gestion de datos, interfaz responsive, accesibilidad, seguridad y despliegue con contenedores.
