Fullstack Task Management MVP
=============================

MVP de gestión de tareas con arquitectura desacoplada: Node.js/TypeScript en el backend y React/Vite en el frontend, usando Prisma ORM y Neon (PostgreSQL).

Stack Tecnológico
-----------------

*   Backend: Node.js, Express, TypeScript, Prisma, Neon (PostgreSQL), JWT, BcryptJS, Zod.
    
*   Frontend: React, Vite, TypeScript, Tailwind CSS v4, React Router DOM v6, Axios, Lucide React.
    

Cómo Correr el Proyecto

### 1\. Backend

cd backend

npm install

Crear el archivo .env basado en el .env.example

npx prisma db push

npm run dev

### 2\. Frontend

cd ../frontend

npm install

npm run dev

Variables de Enorno (backend/.env.example)

Crea un archivo llamado .env dentro de la carpeta backend/:

DATABASE\_URL="tu\_url"

JWT\_SECRET="clave\_secreta\_para\_tokens"

Decisiones Técnicas

1.  Validación Estricta con Zod: Control de datos de entrada en tiempo de ejecución para endpoints críticos (Registro, Login, Creación y Modificación de tareas). Esto asegura que las peticiones malformadas se detengan con un código 400 Bad Request antes de interactuar con la base de datos.
    
2.  Optimización de Estado Puro en React: Eliminación de actualizaciones síncronas de estado dentro de los ciclos de sincronización de efectos (useEffect). El reinicio de la paginación y la aplicación de filtros de estado se manejan a través de eventos imperativos disparados por el usuario, previniendo renderizados en cascada (Cascading Renders).
    

Qué Dejarías Pendiente (Deuda Técnica)

Debido a la restricción del límite de tiempo para la entrega de esta prueba, se priorizó la estabilidad de las funcionalidades del Core Fullstack sobre los módulos secundarios. Se catalogan los siguientes puntos pendientes para una Fase 2 de desarrollo:

1.  Suite de Pruebas Automatizadas (Requisito Mínimo): Quedó pendiente la adición de al menos 1 test unitario para el backend y 1 test para el frontend utilizando herramientas como Vitest/Jest y Supertest.
    
2.  Creación del archivo AI\_USAGE.md (Requisito Obligatorio): Falta estructurar el documento requerido que detalla el uso de herramientas de inteligencia artificial, los prompts de valor aplicados, los errores corregidos a la IA y los componentes de lógica que se decidieron no delegar.
    
3.  Middleware Centralizado de Errores en Express: Estandarizar la captura de excepciones mediante un manejador global de errores en el backend, en lugar de delegar el control a bloques try/catch aislados en cada controlador.