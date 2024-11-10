import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // origin: '*' 
    origin:[
      'http://localhost:3000', // <-- development frontend
      'http://localhost:3001', // <-- development frontend
      'chrome-extension://lingiapgkicdbiacmldhkpnlocmoicif', // <-- chrome extension
      'https://meet.google.com', // <-- google meet
      'emodu-v2.vercel.app', // <-- production frontend
    ]
  });
  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('api/v2');

  const config = new DocumentBuilder()
    .setTitle('Emodu v2 API')
    .setDescription('API Documentation for Emodu V2')
    .setVersion('1.0')
    // .addTag('blog')
    .addBearerAuth()
    .build();
  // const documentFactory = () => SwaggerModule.createDocument(app, config);
  const document = SwaggerModule.createDocument(app, config);

  const swaggerCustomOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      plugins: [
        {
          statePlugins: {
            auth: {
              wrapActions: {
                authorize: (oriAction, system) => (authData) => {
                  const { email, password } = authData;
                  fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      const accessToken = data.accessToken;
                      system.authActions.authorize({ Bearer: accessToken });
                    })
                    .catch((error) => console.error('Login failed', error));
                },
              },
            },
          },
        },
      ],
    },
  };

  SwaggerModule.setup('api-docs', app, document, {
    customJs: '/swagger-custom.js',
  });
  await app.listen(8080);
}
bootstrap();
