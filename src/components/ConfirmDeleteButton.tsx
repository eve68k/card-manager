import { useState } from "react";

/**
 * window.confirm はスマートフォンのブラウザによって抑止されることがあるため、
 * 2 回押すと実行されるボタンにしている。
 */
export function ConfirmDeleteButton({
  label,
  onConfirm,
}: {
  label: string;
  onConfirm: () => Promise<void>;
}) {
  const [armed, setArmed] = useState(false);
  const [pending, setPending] = useState(false);

  if (!armed) {
    return (
      <button type="button" className="button danger-outline" onClick={() => setArmed(true)}>
        {label}
      </button>
    );
  }

  return (
    <div className="confirm-row">
      <button type="button" className="button" onClick={() => setArmed(false)} disabled={pending}>
        やめる
      </button>
      <button
        type="button"
        className="button danger"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          try {
            await onConfirm();
          } finally {
            setPending(false);
          }
        }}
      >
        本当に削除する
      </button>
    </div>
  );
}
