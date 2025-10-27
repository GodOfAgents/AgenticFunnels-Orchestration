# Contributing to AFO Platform

Thank you for your interest in contributing to the AFO Platform! This document provides guidelines and instructions for contributing to the project.

## 🤝 How to Contribute

We welcome contributions in many forms:

- 🐛 Bug reports and fixes
- ✨ New features and enhancements
- 📝 Documentation improvements
- 🎨 UI/UX improvements
- 🧪 Tests and test coverage
- 🌐 Translations and internationalization
- 💡 Ideas and suggestions

## 📋 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/afo-platform.git
cd afo-platform

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/afo-platform.git
```

### 2. Set Up Development Environment

Follow the setup instructions in [README.md](README.md) to get your development environment running.

### 3. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 💻 Development Guidelines

### Code Style

#### Python (Backend)

- Follow [PEP 8](https://pep8.org/) style guide
- Use [Black](https://github.com/psf/black) for formatting
- Use type hints where applicable
- Maximum line length: 100 characters

```bash
# Format code with Black
black backend/

# Check with flake8
flake8 backend/ --max-line-length=100
```

#### JavaScript/TypeScript (Frontend)

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/)
- Use TypeScript for new components
- Functional components with hooks over class components

```bash
# Format code
npm run format
# or
yarn format

# Lint code
npm run lint
# or
yarn lint
```

### Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(agents): add voice configuration page
fix(workflows): resolve execution timeout issue
docs(readme): update installation instructions
test(api): add tests for workflow endpoints
```

### Code Review Process

1. Ensure your code follows the style guidelines
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass
5. Submit a pull request with a clear description

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v --cov=app

# Run specific test file
pytest tests/test_agents.py -v

# Run with coverage report
pytest tests/ --cov=app --cov-report=html
```

### Frontend Tests

```bash
cd template/app
npm test
# or
yarn test

# Run with coverage
npm test -- --coverage
```

### E2E Tests

```bash
cd template/app
npx playwright test

# Run in UI mode
npx playwright test --ui
```

## 📝 Documentation

### Code Documentation

**Python (Backend):**
```python
def create_voice_session(
    agent_id: str,
    agent_config: dict,
    user_credentials: dict
) -> dict:
    """
    Create a new voice session for an agent.
    
    Args:
        agent_id: Unique identifier for the agent
        agent_config: Agent configuration including system prompt
        user_credentials: User's API keys (deepgram, elevenlabs, openai)
    
    Returns:
        dict: Session details including session_id and connection info
    
    Raises:
        ValueError: If required credentials are missing
        ConnectionError: If unable to establish voice session
    """
```

**TypeScript (Frontend):**
```typescript
/**
 * Create a new voice session
 * 
 * @param agentId - The agent's unique identifier
 * @param agentConfig - Agent configuration object
 * @param userCredentials - User's API keys for voice services
 * @returns Promise resolving to session details
 * @throws {Error} If session creation fails
 */
async createVoiceSession(
  agentId: string,
  agentConfig: any,
  userCredentials: Record<string, string>
): Promise<VoiceSession> {
  // Implementation
}
```

### README Updates

If your contribution adds new features:
1. Update the feature list in README.md
2. Add usage examples
3. Update the roadmap if applicable

## 🐛 Bug Reports

When filing a bug report, please include:

1. **Clear title and description**
2. **Steps to reproduce**
   ```
   1. Go to '...'
   2. Click on '...'
   3. Scroll down to '...'
   4. See error
   ```
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots** (if applicable)
6. **Environment details**
   - OS: [e.g., macOS 14.0]
   - Browser: [e.g., Chrome 120]
   - Python version: [e.g., 3.11.6]
   - Node version: [e.g., 18.17.0]
7. **Additional context**

## ✨ Feature Requests

When proposing a feature:

1. **Clear use case**: Explain why this feature is needed
2. **Proposed solution**: Describe your suggested implementation
3. **Alternatives considered**: List other approaches you've thought about
4. **Additional context**: Add any other relevant information

## 🔍 Pull Request Process

1. **Before submitting:**
   - Update documentation
   - Add tests for new features
   - Ensure all tests pass
   - Run linters and formatters
   - Update CHANGELOG.md

2. **PR Title:**
   - Follow conventional commit format
   - Be clear and descriptive
   - Example: `feat(voice): add ElevenLabs voice cloning support`

3. **PR Description:**
   ```markdown
   ## Description
   Brief description of the changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] E2E tests added/updated
   - [ ] Manual testing performed
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests pass locally
   
   ## Screenshots (if applicable)
   
   ## Related Issues
   Closes #123
   ```

4. **Review Process:**
   - Maintainers will review your PR
   - Address review comments
   - Once approved, your PR will be merged

## 📦 Release Process

(For maintainers)

1. Update version numbers
2. Update CHANGELOG.md
3. Create a release tag
4. Build and test release
5. Publish release notes

## 🌟 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Project documentation

## 📞 Getting Help

- **Documentation**: Check [README.md](README.md) and [FILE_STRUCTURE.md](FILE_STRUCTURE.md)
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Project maintainers are responsible for clarifying standards and taking appropriate action in response to unacceptable behavior.

## 🙏 Thank You!

Your contributions make this project better. Thank you for taking the time to contribute!

---

**Questions?** Feel free to open an issue or reach out to the maintainers.
