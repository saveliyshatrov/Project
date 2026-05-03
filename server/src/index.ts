import cors from 'cors';
import express from 'express';
import * as expressUseragent from 'express-useragent';
import { VERSION } from 'shared';
import swaggerUi from 'swagger-ui-express';

import routes from './routes';
import { swaggerSpec } from './swagger';

const app = express();
const PORT = process.env.PORT || 3001;

const whiteList = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: 'Content-Type,Authorization',
};

// Middleware
app.use(cors(whiteList));
app.use(express.json());
app.use(expressUseragent.express());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use(routes);

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Version: ${VERSION}`);
});

export { server };
export default app;
