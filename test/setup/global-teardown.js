module.exports = async () => {
  // Force exit after tests to clean up any remaining Puppeteer processes
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}; 