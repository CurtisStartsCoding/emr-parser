# RadOrderPad EMR Extension

A HIPAA and SOC2-compliant Chrome extension that captures patient demographics and insurance information from any EMR system and automatically fills it into RadOrderPad forms.

## 🚀 Quick Start

New to the project? Start here:
- [QUICK-START.md](./QUICK-START.md) - Get up and running in 15 minutes
- [Technical Specification](./radorderpad-extension-tech-spec.md) - Detailed product requirements

## 📚 Documentation Structure

### Development Guides

1. **[SETUP-GUIDE.md](./SETUP-GUIDE.md)** - Project setup and configuration
   - Initial project structure
   - Security infrastructure setup
   - Development environment configuration
   - Build system setup

2. **[DEVELOPMENT-GUIDE.md](./DEVELOPMENT-GUIDE.md)** - Core development
   - Module implementation
   - Chrome extension components
   - UI development
   - Security features

3. **[TESTING-GUIDE.md](./TESTING-GUIDE.md)** - Testing procedures
   - Unit testing setup
   - Integration testing
   - Security testing
   - Compliance testing

4. **[COMPLIANCE-GUIDE.md](./COMPLIANCE-GUIDE.md)** - HIPAA & SOC2 compliance
   - HIPAA requirements
   - SOC2 controls
   - Security best practices
   - Audit procedures

5. **[DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)** - Release procedures
   - Build optimization
   - Chrome Web Store submission
   - Security checklist
   - Monitoring setup

### Technical Documentation

- [CLAUDE.md](./CLAUDE.md) - AI assistant context for Claude
- [API Documentation](./docs/api/) - Module API references
- [Security Documentation](./docs/security/) - Security policies and procedures

## 🏗️ Project Overview

### What It Does
- Captures patient data from EMR patient summary pages
- Supports Epic, Cerner, Athena, and other major EMRs
- Automatically fills RadOrderPad order forms
- Maintains HIPAA compliance with encrypted storage
- Auto-deletes data after 5 minutes for security

### Key Features
- 🔒 **Security First**: AES-256 encryption, session timeouts
- 📋 **Multi-EMR Support**: Universal parser with fallback strategies
- ⚡ **One-Click Operation**: Capture and fill with minimal clicks
- 📊 **Audit Trail**: Comprehensive logging without PHI exposure
- 🏥 **HIPAA Compliant**: Technical and administrative safeguards
- 🛡️ **SOC2 Certified**: Security, availability, and confidentiality

## 🛠️ Technology Stack

- **Language**: TypeScript
- **Framework**: Chrome Extension Manifest V3
- **Build Tool**: Webpack
- **Testing**: Jest
- **Security**: AES-256 encryption, CSP

## 📋 Development Timeline

- **Week 1**: Setup, security infrastructure, core modules
- **Week 2**: UI, testing, compliance documentation
- **Week 3**: Security hardening, deployment prep
- **Week 4**: Final testing, compliance audit, release

## 🔐 Security & Compliance

This extension is designed with security and compliance as top priorities:

- **HIPAA Compliant**: All technical and administrative safeguards
- **SOC2 Type II**: Annual audits for trust service criteria
- **Zero Data Retention**: Automatic deletion after 5 minutes
- **Encrypted Storage**: No plaintext PHI ever stored
- **Audit Logging**: Complete trail without PHI exposure

## 🚦 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/radorderpad/emr-extension.git
   cd radorderpad-emr-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development build**
   ```bash
   npm run dev
   ```

4. **Load in Chrome**
   - Navigate to `chrome://extensions`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the `build` directory

For detailed setup instructions, see [SETUP-GUIDE.md](./SETUP-GUIDE.md).

## 📝 License

Proprietary - RadOrderPad © 2024

## 🤝 Support

- **Technical Issues**: tech-support@radorderpad.com
- **Security Concerns**: security@radorderpad.com
- **Compliance Questions**: compliance@radorderpad.com

## 🏆 Compliance Certifications

- HIPAA Compliant ✓
- SOC2 Type II ✓
- Annual Security Audits ✓