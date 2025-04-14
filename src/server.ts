import app from './api';

const port = 3_000;
app.listen(port, () => console.info(`Listening on http://localhost:${port}.`));
