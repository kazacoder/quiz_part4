const express = require('express');
const cors = require('cors');
const testRoutes = require('./routes/test.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", authRoutes);
app.use("/api/tests", testRoutes);

let port = 3000

app.listen(port, () => {
        console.log(`Server started on port ${port}`);
        console.log(`http://localhost:${port}`);
    }
)