# Contributing to ProductOps AI

Thank you for your interest in contributing to ProductOps AI! This document provides guidelines and instructions for contributing.

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/productops-ai`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Run tests: `pytest backend/` and `npm test --prefix frontend`
6. Commit: `git commit -m "Add amazing feature"`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📋 Development Setup

### Backend

```bash
# Install Python dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For development tools

# Run backend
python -m uvicorn backend.main:app --reload --port 8000

# Run tests
pytest backend/ -v

# Run linter
ruff check backend/
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Slack/Email integration for feedback ingestion
- [ ] Historical data learning for better prioritization
- [ ] A/B testing framework for scoring algorithms
- [ ] Performance optimizations (caching, batching)
- [ ] Additional language support (i18n)

### Medium Priority
- [ ] Jira/Linear integration
- [ ] Custom scoring models (beyond RICE)
- [ ] Team collaboration features
- [ ] Export functionality (PDF reports)
- [ ] Mobile responsive improvements

### Good First Issues
- [ ] Add more test cases to evaluation suite
- [ ] Improve error messages
- [ ] Add more documentation
- [ ] Fix accessibility issues
- [ ] Add keyboard shortcuts

## 🧪 Testing Guidelines

### Backend Tests
```python
# Use pytest fixtures
@pytest.fixture
async def mock_feedback():
    return "Test feedback text"

# Test agent outputs
async def test_feedback_analyzer(mock_feedback):
    result = await analyze_feedback(mock_feedback)
    assert result["category"] in VALID_CATEGORIES
    assert 0 <= result["sentiment_score"] <= 1
```

### Frontend Tests
```typescript
// Use React Testing Library
import { render, screen } from '@testing/library/react';

test('renders pipeline status', () => {
  render(<PipelineStatus status="running" />);
  expect(screen.getByText(/running/i)).toBeInTheDocument();
});
```

## 📝 Code Style

### Python
- Follow PEP 8
- Use type hints everywhere
- Docstrings for all public functions
- Max line length: 100 characters
- Run `ruff format` before committing

### TypeScript/React
- Use TypeScript strict mode
- Functional components with hooks
- Consistent naming (camelCase for functions, PascalCase for components)
- ESLint + Prettier configuration provided
- Run `npm run lint --fix` before committing

## 🎨 UI/UX Guidelines

- Follow Material Design 3 principles
- Maintain dark mode consistency
- Use existing components from `/components/ui`
- Add Framer Motion animations for new interactions
- Test on both desktop and mobile viewports
- Ensure keyboard navigation works
- Maintain WCAG AA accessibility standards

## 🔒 Security

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Validate all user inputs
- Sanitize data before rendering
- Follow OWASP security best practices
- Report security vulnerabilities privately

## 📄 Documentation

### Code Comments
- Explain "why", not "what"
- Document complex algorithms
- Add JSDoc/docstrings for public APIs

### README Updates
- Update README for new features
- Add screenshots for UI changes
- Update architecture diagram if needed
- Keep setup instructions current

## 🐛 Bug Reports

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md):

```markdown
**Describe the bug**
Clear description of what happened

**To Reproduce**
Steps to reproduce the behavior

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]
```

## ✨ Feature Requests

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md):

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you thought of

**Additional context**
Mockups, examples, etc.
```

## 🔄 Pull Request Process

1. **Before Submitting**
   - Update documentation
   - Add/update tests
   - Run linters and tests
   - Rebase on latest main

2. **PR Title Format**
   - `feat: Add feature X`
   - `fix: Resolve bug Y`
   - `docs: Update README`
   - `test: Add test for Z`
   - `refactor: Improve component A`

3. **PR Description**
   - Link related issues
   - Describe changes
   - List testing done
   - Add screenshots for UI changes

4. **Review Process**
   - Maintainers will review within 48 hours
   - Address feedback
   - Squash commits before merge
   - Maintainer will merge when approved

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Given shoutouts on social media
- Invited to contributor Discord channel

## 📧 Contact

- **Issues:** [GitHub Issues](https://github.com/yourusername/productops-ai/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/productops-ai/discussions)
- **Email:** amit.waghmare@example.com

## 📜 Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

### Enforcement
Instances of abusive behavior may be reported to amit.waghmare@example.com. All complaints will be reviewed and investigated.

---

Thank you for contributing to ProductOps AI! 🚀
