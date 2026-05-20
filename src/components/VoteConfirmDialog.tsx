interface VoteConfirmDialogProps {
  open: boolean
  countryName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function VoteConfirmDialog({
  open,
  countryName,
  onConfirm,
  onCancel,
}: VoteConfirmDialogProps) {
  if (!open) {
    return null
  }

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content" role="dialog" aria-modal="true" aria-labelledby="confirm-heading" onClick={(e) => e.stopPropagation()}>
        <h2 id="confirm-heading">Confirmer votre vote</h2>
        <p className="dialog-text">
          Vous avez choisi <strong>{countryName}</strong> comme pays favori.
        </p>
        <p className="dialog-text">
          Ce vote est définitif et permet de clôturer votre participation.
        </p>
        <div className="dialog-actions">
          <button type="button" onClick={onCancel} className="secondary">
            Annuler
          </button>
          <button type="button" onClick={onConfirm}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}
