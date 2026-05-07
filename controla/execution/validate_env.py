#!/usr/bin/env python3
"""
validate_env.py — DOE Framework
Valida que todas as variáveis de .env.example estão presentes no .env do projeto.

Uso:
    python execution/validate_env.py
    python execution/validate_env.py --env-file ../.env --example-file ../.env.example
"""

import os
import sys
import argparse
from pathlib import Path


def parse_env_file(filepath: Path) -> dict[str, str | None]:
    """
    Lê um arquivo .env ou .env.example e retorna um dicionário
    {NOME_DA_VARIAVEL: valor_ou_None}.
    Ignora linhas em branco e comentários (#).
    """
    variables = {}
    if not filepath.exists():
        return variables

    with filepath.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            # ignora comentários e linhas em branco
            if not line or line.startswith("#"):
                continue
            # ignora linhas semafóricas sem '='
            if "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip() if value.strip() else None
            if key:
                variables[key] = value

    return variables


def find_project_root() -> Path:
    """Sobe na hierarquia de diretórios até encontrar .env.example ou a raiz."""
    current = Path.cwd()
    for parent in [current, *current.parents]:
        if (parent / ".env.example").exists():
            return parent
    return current


def main():
    parser = argparse.ArgumentParser(
        description="Valida variáveis de ambiente do DOE Framework"
    )
    parser.add_argument(
        "--env-file",
        default=None,
        help="Caminho do arquivo .env (padrão: detectado automaticamente)",
    )
    parser.add_argument(
        "--example-file",
        default=None,
        help="Caminho do arquivo .env.example (padrão: detectado automaticamente)",
    )
    args = parser.parse_args()

    # Detectar raiz do projeto
    project_root = find_project_root()

    env_file     = Path(args.env_file)     if args.env_file     else project_root / ".env"
    example_file = Path(args.example_file) if args.example_file else project_root / ".env.example"

    print("\n╔══════════════════════════════════════╗")
    print("║  DOE Framework — validate_env.py     ║")
    print("╚══════════════════════════════════════╝\n")
    print(f"  Projeto:  {project_root}")
    print(f"  .env:     {env_file}")
    print(f"  example:  {example_file}\n")

    # Verificar existência dos arquivos
    if not example_file.exists():
        print(f"  ❌ ERRO: {example_file} não encontrado.")
        print("     Crie um .env.example com as variáveis necessárias.\n")
        sys.exit(1)

    example_vars = parse_env_file(example_file)

    if not example_vars:
        print("  ⚠️  .env.example está vazio ou sem variáveis definidas.")
        print("  ✅ Nada a validar.\n")
        sys.exit(0)

    if not env_file.exists():
        print(f"  ❌ ERRO: {env_file} não encontrado.")
        print(f"     Copie .env.example para .env e preencha os valores.\n")
        print("  Variáveis esperadas:")
        for var in example_vars:
            print(f"     • {var}")
        print()
        sys.exit(1)

    env_vars = parse_env_file(env_file)

    # Verificar variáveis faltando ou vazias
    missing   = []
    empty     = []
    ok        = []

    for var, example_value in example_vars.items():
        # Variáveis comentadas no exemplo (ex: "# AWS_KEY=") são opcionais
        if var not in env_vars:
            missing.append(var)
        elif not env_vars[var]:
            # Está presente mas sem valor
            empty.append(var)
        else:
            ok.append(var)

    # Relatório
    if ok:
        print(f"  ✅ OK ({len(ok)} variável/variáveis):")
        for var in ok:
            print(f"     • {var}")

    if empty:
        print(f"\n  ⚠️  VAZIAS ({len(empty)} variável/variáveis):")
        for var in empty:
            print(f"     • {var}")

    if missing:
        print(f"\n  ❌ FALTANDO ({len(missing)} variável/variáveis):")
        for var in missing:
            print(f"     • {var}")

    print()

    if missing:
        print("  🔴 Validação FALHOU — adicione as variáveis faltando ao .env\n")
        sys.exit(1)
    elif empty:
        print("  🟡 Validação com AVISOS — variáveis presentes mas sem valor\n")
        sys.exit(0)
    else:
        print("  🟢 Validação OK — todas as variáveis estão configuradas\n")
        sys.exit(0)


if __name__ == "__main__":
    main()
