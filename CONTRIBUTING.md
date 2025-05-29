# Contributing to KampusKart

Thank you for your interest in contributing to KampusKart! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the Issues section
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the bug
- Include screenshots if applicable
- Specify your environment (OS, browser, etc.)

### Suggesting Features

- Check if the feature has already been suggested
- Use the feature request template
- Provide a clear description of the feature
- Explain why this feature would be useful
- Include any relevant mockups or examples

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature/fix
3. Make your changes
4. Write or update tests as needed
5. Update documentation
6. Submit a pull request

### Development Process

1. Set up your development environment:
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/KampusKart.git
   cd KampusKart

   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes following the coding standards

4. Test your changes:
   ```bash
   # Frontend tests
   cd frontend
   npm test

   # Backend tests
   cd ../backend
   npm test
   ```

5. Commit your changes:
   ```bash
   git commit -m "Description of changes"
   ```

6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

7. Create a Pull Request

## Coding Standards

### JavaScript/React
- Use ES6+ features
- Follow the Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### CSS/Tailwind
- Use Tailwind utility classes when possible
- Follow BEM naming convention for custom CSS
- Keep styles modular and reusable

### Git Commit Messages
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally

## Testing

- Write unit tests for new features
- Ensure all tests pass before submitting a PR
- Maintain or improve test coverage

## Documentation

- Update README.md if needed
- Add JSDoc comments for new functions
- Update API documentation if changing endpoints

## Review Process

1. All PRs will be reviewed by at least one maintainer
2. Address any feedback or requested changes
3. Once approved, your PR will be merged

## Questions?

Feel free to open an issue for any questions about contributing to KampusKart. 