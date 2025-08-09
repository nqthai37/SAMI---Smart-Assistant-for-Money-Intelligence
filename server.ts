// URL -> http://localhost:8383
// IP -> 127.0.0.1:8383

import express from 'express';
import type {Express, Request, Response} from 'express';
import userRoute from './routes/userRoute.js';

const app = express();
const PORT = 8383;

// Middleware
app.use(express.json());
app.use('/api/user', userRoute);

// Example in-memory data store
let data: any[] = [];

// Home page route
app.get('/', (req: Request, res: Response) => {
    console.log('User requested the home page website');
    res.send(`
        <body style="background:pink;color: blue;">
            <h1>DATA:</h1>
            <p>${JSON.stringify(data)}</p>
            <a href="/dashboard">Dashboard</a>
        </body>
        <script>console.log('This is my script')</script>
    `);
});

// Dashboard route
app.get('/dashboard', (req: Request, res: Response) => {
    res.send(`
        <body>
            <h1>dashboard</h1>
            <a href="/">home</a>
        </body>
    `);
});


// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
