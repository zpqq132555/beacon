#!/bin/bash
# Beacon script locator — source this file to export paths to bundled scripts.
#
# Usage:
#   . /path/to/beacon/scripts/beacon-env.sh
#
# This file is sourced by workflow snippets. Do not set global shell options here.

_beacon_env_source="${BASH_SOURCE[0]:-$0}"
_beacon_script_dir="$(cd "$(dirname "$_beacon_env_source")" && pwd -P)"
_beacon_env_sourced=0
(return 0 2>/dev/null) && _beacon_env_sourced=1

export BEACON_GUARD="${BEACON_GUARD:-${_beacon_script_dir}/beacon-guard.sh}"
export BEACON_STATE="${BEACON_STATE:-${_beacon_script_dir}/beacon-state.sh}"
export BEACON_HANDOFF="${BEACON_HANDOFF:-${_beacon_script_dir}/beacon-handoff.sh}"
export BEACON_ARCHIVE="${BEACON_ARCHIVE:-${_beacon_script_dir}/beacon-archive.sh}"
export BEACON_YAML_VALIDATE="${BEACON_YAML_VALIDATE:-${_beacon_script_dir}/beacon-yaml-validate.sh}"

_beacon_bash_is_usable() {
  local _beacon_bash_candidate="$1"
  if [ -z "$_beacon_bash_candidate" ]; then
    return 1
  fi
  case "$_beacon_bash_candidate" in
    */Windows/System32/bash.exe|*/windows/system32/bash.exe|*\\Windows\\System32\\bash.exe|*\\windows\\system32\\bash.exe)
      return 1
      ;;
  esac
  "$_beacon_bash_candidate" -lc 'printf beacon-bash-ok' >/dev/null 2>&1
}

_beacon_resolve_bash() {
  local _beacon_bash_candidate

  if _beacon_bash_is_usable "${BEACON_BASH:-}"; then
    printf '%s\n' "$BEACON_BASH"
    return 0
  fi

  if _beacon_bash_is_usable "${BASH:-}"; then
    printf '%s\n' "$BASH"
    return 0
  fi

  _beacon_bash_candidate="$(command -v sh 2>/dev/null | awk '{ sub(/\/sh(\.exe)?$/, "/bash.exe"); print }')"
  if _beacon_bash_is_usable "$_beacon_bash_candidate"; then
    printf '%s\n' "$_beacon_bash_candidate"
    return 0
  fi

  _beacon_bash_candidate="$(command -v bash 2>/dev/null || true)"
  if _beacon_bash_is_usable "$_beacon_bash_candidate"; then
    printf '%s\n' "$_beacon_bash_candidate"
    return 0
  fi

  return 1
}

BEACON_BASH="$(_beacon_resolve_bash || true)"
export BEACON_BASH

_beacon_env_fail() {
  echo "ERROR: Beacon scripts not found. Ensure the beacon skill is installed completely." >&2
  echo "Expected path pattern: */beacon/scripts/beacon-*.sh under project or platform skill directories" >&2
}

_beacon_bash_fail() {
  echo "ERROR: usable bash not found. Install Git Bash or set BEACON_BASH to a working bash executable." >&2
  echo "Windows WSL launcher bash.exe is not supported for Beacon scripts." >&2
}

_beacon_env_abort() {
  local _beacon_env_was_sourced="$_beacon_env_sourced"
  unset _beacon_env_source _beacon_script_dir _beacon_script _beacon_env_missing _beacon_env_sourced
  unset _beacon_bash_candidate
  unset -f _beacon_env_fail _beacon_bash_fail _beacon_bash_is_usable _beacon_resolve_bash
  if [ "$_beacon_env_was_sourced" -eq 1 ]; then
    unset -f _beacon_env_abort
    return 1
  fi
  exit 1
}

_beacon_env_missing=0
if [ -z "$BEACON_BASH" ]; then
  _beacon_bash_fail
  _beacon_env_missing=1
fi
for _beacon_script in \
  "$BEACON_GUARD" \
  "$BEACON_STATE" \
  "$BEACON_HANDOFF" \
  "$BEACON_ARCHIVE" \
  "$BEACON_YAML_VALIDATE"; do
  if [ ! -f "$_beacon_script" ]; then
    _beacon_env_fail
    _beacon_env_missing=1
    break
  fi
done

if [ "$_beacon_env_missing" -ne 0 ]; then
  _beacon_env_abort
else
  unset _beacon_env_source _beacon_script_dir _beacon_script _beacon_env_missing _beacon_env_sourced
  unset _beacon_bash_candidate
  unset -f _beacon_env_fail _beacon_bash_fail _beacon_bash_is_usable _beacon_resolve_bash _beacon_env_abort
fi
