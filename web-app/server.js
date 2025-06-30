const express = require('express');
const cors = require('cors');
const { SimpleUniversalParser } = require('../src/lib/simple-universal-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Parse EMR data
app.post('/api/parse-emr', async (req, res) => {
  try {
    const { html, url } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content required' });
    }

    // Set up DOM environment for parser
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(html);
    global.document = dom.window.document;
    global.window = dom.window;

    // Parse the data
    const parser = new SimpleUniversalParser();
    const result = await parser.parsePatientData();

    res.json({
      success: true,
      data: result.data,
      confidence: result.confidence,
      strategy: result.strategy,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ 
      error: 'Failed to parse EMR data',
      details: error.message 
    });
  }
});

// Query CDS platform (mock implementation)
app.post('/api/cds-query', async (req, res) => {
  try {
    const { patientData, queryType } = req.body;
    
    // Mock CDS response - replace with real CDS integration
    const mockCDSResponse = {
      queryType: queryType || 'general',
      recommendations: [
        {
          type: 'medication',
          priority: 'high',
          message: 'Consider drug interaction check',
          details: 'Patient on multiple medications'
        },
        {
          type: 'screening',
          priority: 'medium',
          message: 'Schedule annual physical',
          details: 'Due for routine checkup'
        }
      ],
      alerts: [
        {
          type: 'warning',
          message: 'Patient has allergies',
          severity: 'medium'
        }
      ]
    };

    res.json({
      success: true,
      cdsResult: mockCDSResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('CDS query error:', error);
    res.status(500).json({ 
      error: 'Failed to query CDS platform',
      details: error.message 
    });
  }
});

// Combined EMR → CDS workflow
app.post('/api/emr-to-cds', async (req, res) => {
  try {
    const { html, url, cdsQueryType } = req.body;
    
    // Step 1: Parse EMR data
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(html);
    global.document = dom.window.document;
    global.window = dom.window;

    const parser = new SimpleUniversalParser();
    const parseResult = await parser.parsePatientData();

    // Step 2: Query CDS platform
    const cdsResult = await queryCDSPlatform(parseResult.data, cdsQueryType);

    // Step 3: Return combined result
    res.json({
      success: true,
      workflow: 'emr-to-cds',
      patientData: parseResult.data,
      cdsRecommendations: cdsResult,
      confidence: parseResult.confidence,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Workflow error:', error);
    res.status(500).json({ 
      error: 'Failed to complete EMR to CDS workflow',
      details: error.message 
    });
  }
});

// Mock CDS platform integration
async function queryCDSPlatform(patientData, queryType = 'general') {
  // Replace this with your actual CDS platform integration
  return {
    queryType,
    recommendations: [
      {
        type: 'medication',
        priority: 'high',
        message: 'Review medication list',
        details: `Patient has ${patientData.medications?.length || 0} medications`
      }
    ],
    alerts: [],
    timestamp: new Date().toISOString()
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EMR Parser Web App running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Parse EMR: POST http://localhost:${PORT}/api/parse-emr`);
  console.log(`💡 CDS Query: POST http://localhost:${PORT}/api/cds-query`);
  console.log(`🔄 EMR→CDS: POST http://localhost:${PORT}/api/emr-to-cds`);
});

module.exports = app; 