import fs from 'fs';
import path from 'path';
// @ts-ignore
import solc from 'solc';

function findImports(importPath: string) {
  if (importPath.startsWith('@openzeppelin/')) {
    const fullPath = path.resolve(process.cwd(), 'node_modules', importPath);
    if (fs.existsSync(fullPath)) {
      return { contents: fs.readFileSync(fullPath, 'utf8') };
    }
  }

  const localPath = path.resolve(process.cwd(), 'contracts', importPath);
  if (fs.existsSync(localPath)) {
    return { contents: fs.readFileSync(localPath, 'utf8') };
  }

  const interfacesPath = path.resolve(process.cwd(), 'contracts', 'interfaces', path.basename(importPath));
  if (fs.existsSync(interfacesPath)) {
    return { contents: fs.readFileSync(interfacesPath, 'utf8') };
  }

  return { error: 'File not found: ' + importPath };
}

export function compileContracts() {
  console.log('🔨 Compiling Luma Finance Solidity Contracts (v0.8.20)...');

  const sources: Record<string, { content: string }> = {
    'PolicyManager.sol': { content: fs.readFileSync(path.resolve(process.cwd(), 'contracts/PolicyManager.sol'), 'utf8') },
    'DecisionRegistry.sol': { content: fs.readFileSync(path.resolve(process.cwd(), 'contracts/DecisionRegistry.sol'), 'utf8') },
    'ExecutionRouter.sol': { content: fs.readFileSync(path.resolve(process.cwd(), 'contracts/ExecutionRouter.sol'), 'utf8') },
    'LumaVault.sol': { content: fs.readFileSync(path.resolve(process.cwd(), 'contracts/LumaVault.sol'), 'utf8') }
  };

  const input = {
    language: 'Solidity',
    sources,
    settings: {
      viaIR: true,
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  if (output.errors) {
    const fatal = output.errors.filter((e: any) => e.severity === 'error');
    if (fatal.length > 0) {
      console.error('❌ Compilation Errors:', fatal);
      throw new Error('Solidity compilation failed.');
    }
  }

  const compiled: Record<string, { abi: any[]; bytecode: string }> = {};

  for (const file in output.contracts) {
    for (const contract in output.contracts[file]) {
      compiled[contract] = {
        abi: output.contracts[file][contract].abi,
        bytecode: '0x' + output.contracts[file][contract].evm.bytecode.object
      };
    }
  }

  const outDir = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(path.resolve(outDir, 'compiled-contracts.json'), JSON.stringify(compiled, null, 2));
  console.log('✅ Contracts compiled successfully to dist/compiled-contracts.json');
  return compiled;
}

if (process.argv[1]?.endsWith('compile.ts') || process.argv[1]?.endsWith('compile.js')) {
  compileContracts();
}
