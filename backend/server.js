// Load environment variables from .env early
require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./src/config/database');
const { validateEnvironment } = require('./src/config/environment');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;
const MAX_PORT_ATTEMPTS = 5; // try a few ports before falling back

const startServer = async (port = DEFAULT_PORT, attemptsLeft = MAX_PORT_ATTEMPTS) => {
  try {
    validateEnvironment();
    await connectDB();

    let server = app.listen(port, () => {
      const actualPort = server.address().port;
      process.env.PORT = actualPort;
      console.log(`Server is running on port ${actualPort}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });

    // Handle listen errors (e.g. EADDRINUSE) without crashing the process
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use.`);
        if (attemptsLeft > 1) {
          const nextPort = port + 1;
          console.log(`Attempting to start on port ${nextPort} (${attemptsLeft - 1} attempts left)...`);
          setTimeout(() => startServer(nextPort, attemptsLeft - 1), 500);
        } else {
          console.warn('All configured ports are in use. Attempting to bind to an ephemeral port...');
          // Try an ephemeral port assigned by the OS
          try {
            const fallbackServer = app.listen(0, () => {
              const assigned = fallbackServer.address().port;
              process.env.PORT = assigned;
              console.log(`Server started on ephemeral port ${assigned}`);
              console.log(`Environment: ${process.env.NODE_ENV}`);
            });

            // attach error handler to fallback server as well
            fallbackServer.on('error', (e) => {
              console.error('Fallback server error:', e);
              console.error('No available ports. Exiting.');
              process.exit(1);
            });

            // Graceful shutdown for fallback server
            const gracefulShutdownFallback = () => {
              console.log('Shutting down fallback server...');
              fallbackServer.close(() => {
                console.log('HTTP server closed.');
                process.exit(0);
              });
            };
            process.on('SIGINT', gracefulShutdownFallback);
            process.on('SIGTERM', gracefulShutdownFallback);

          } catch (fallbackError) {
            console.error('Failed to start fallback server:', fallbackError);
            process.exit(1);
          }
        }
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });

    // Graceful shutdown handlers for primary server
    const gracefulShutdown = () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

  } catch (error) {
    console.error('Failed to start server:', error && error.message ? error.message : error);
    process.exit(1);
  }
};

startServer();
