#!/usr/bin/env bash
set -euo pipefail
umask 077

case "${1:-}" in
  backup)
    : "${DATABASE_URL:?Tetapkan DATABASE_URL}"
    : "${WORKSPACE_STORAGE_ROOT:?Tetapkan WORKSPACE_STORAGE_ROOT}"
    : "${WORKSPACE_BACKUP_DIR:?Tetapkan WORKSPACE_BACKUP_DIR}"
    source_dir=$(realpath "$WORKSPACE_STORAGE_ROOT")
    backup_dir=$(realpath -m "$WORKSPACE_BACKUP_DIR")
    case "$backup_dir/" in "$source_dir/"*) echo 'Direktori sandaran mesti di luar storan workspace' >&2; exit 1 ;; esac
    mkdir -p "$backup_dir"
    staging=$(mktemp -d "$backup_dir/.snapshot-XXXXXXXX")
    trap 'rm -rf -- "$staging"' EXIT
    pg_dump --format=custom --file="$staging/database.dump" "$DATABASE_URL"
    tar -C "$source_dir" -czf "$staging/workspaces.tar.gz" .
    (cd "$staging" && sha256sum database.dump workspaces.tar.gz > SHA256SUMS)
    snapshot="$backup_dir/$(date -u +%Y%m%dT%H%M%SZ)-${staging##*-}"
    mv -T -- "$staging" "$snapshot"
    echo "$snapshot"
    ;;
  restore)
    : "${2:?Nyatakan direktori sandaran}"
    : "${3:?Nyatakan storan pemulihan baharu}"
    : "${RESTORE_DATABASE_URL:?Tetapkan RESTORE_DATABASE_URL kepada pangkalan data ujian/kosong}"
    snapshot=$(realpath "$2")
    (cd "$snapshot" && sha256sum --check SHA256SUMS)
    destination=$(realpath -m "$3")
    if [[ -e "$destination" ]]; then echo 'Storan pemulihan mesti direktori baharu' >&2; exit 1; fi
    staging=$(mktemp -d "$(dirname "$destination")/.restore-XXXXXXXX")
    trap 'rm -rf -- "$staging"' EXIT
    tar --no-overwrite-dir -xzf "$snapshot/workspaces.tar.gz" -C "$staging"
    pg_restore --exit-on-error --single-transaction --no-owner --no-privileges --dbname="$RESTORE_DATABASE_URL" "$snapshot/database.dump"
    mv -T -- "$staging" "$destination"
    ;;
  *) echo 'Penggunaan: workspace-backup.sh backup | restore DIREKTORI_SANDARAN DIREKTORI_BAHARU' >&2; exit 2 ;;
esac
