"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
async function bootstrap() {
    dotenv.config();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const corsOptions = {
        origin: [process.env.CORS_ORIGIN],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
    };
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    app.enableCors(corsOptions);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map