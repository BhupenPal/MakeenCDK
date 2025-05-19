# Makeen

This project is made using AWS CDK application and is written in TypeScript that defines infrastructure as code.

## Prerequisites

- Node.js (v18 or later)
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed globally (`npm install -g aws-cdk`)

## Project Structure

```
makeen/
├── bin/                    # CDK app entry point
├── lib/                    # Stack definitions
├── lambda/                 # Lambda function code
├── test/                   # Test files
└── cdk.out/               # CDK synthesis output
```

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the project:

   ```bash
   npm run build
   ```

3. Run tests:

   ```bash
   npm test
   ```

4. Deploy the stack:

   ```bash
   cdk deploy
   ```

5. Destroy the stack:
   ```bash
   cdk destroy MakeenStack
   ```

## Available Scripts

- `npm run build` - Compiles TypeScript to JavaScript
- `npm run watch` - Watches for changes and recompiles
- `npm test` - Runs the test suite
- `cdk deploy` - Deploys the stack to AWS
- `cdk diff` - Shows infrastructure changes before deployment
- `cdk synth` - Synthesizes CloudFormation template

## License

This project is licensed under the MIT License - see the LICENSE file for details.
